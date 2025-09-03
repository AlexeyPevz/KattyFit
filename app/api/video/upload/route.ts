import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Загрузка видео на VK
async function uploadToVK(
  file: File,
  title: string,
  description: string,
  isPrivate: boolean = true
): Promise<{ videoId: string; url: string; embedUrl: string } | null> {
  try {
    const vkToken = process.env.VK_API_TOKEN
    const vkGroupId = process.env.VK_GROUP_ID
    
    if (!vkToken || !vkGroupId) {
      console.error("VK API credentials not configured")
      return null
    }

    // 1. Получаем URL для загрузки
    const uploadUrlResponse = await fetch(
      `https://api.vk.com/method/video.save?` +
      `group_id=${vkGroupId}&` +
      `name=${encodeURIComponent(title || 'Видео')}&` +
      `description=${encodeURIComponent(description || '')}&` +
      `is_private=${isPrivate ? 1 : 0}&` +
      `access_token=${vkToken}&` +
      `v=5.131`
    )

    const uploadData = await uploadUrlResponse.json()
    if (uploadData.error) {
      console.error("VK upload URL error:", uploadData.error)
      return null
    }

    // Проверяем наличие upload_url
    if (!uploadData.response?.upload_url) {
      console.error("VK API не вернул upload_url:", uploadData)
      return null
    }

    // 2. Загружаем видео
    const formData = new FormData()
    formData.append("video_file", file)

    const uploadResponse = await fetch(uploadData.response.upload_url, {
      method: "POST",
      body: formData,
    })

    if (!uploadResponse.ok) {
      console.error("VK upload HTTP error:", uploadResponse.status)
      return null
    }

    const uploadResult = await uploadResponse.json()
    
    // Проверяем обязательные поля
    if (!uploadResult.video_id || !uploadResult.owner_id) {
      console.error("VK upload failed - missing required fields:", uploadResult)
      return null
    }

    // 3. Формируем URLs
    const videoId = `${uploadResult.owner_id}_${uploadResult.video_id}`
    const accessKey = uploadResult.access_key || ""
    
    return {
      videoId: videoId,
      url: `https://vk.com/video${videoId}${accessKey ? `?access_key=${accessKey}` : ""}`,
      embedUrl: `https://vk.com/video_ext.php?oid=${uploadResult.owner_id}&id=${uploadResult.video_id}${uploadResult.video_hash ? `&hash=${uploadResult.video_hash}` : ""}`
    }
  } catch (error) {
    console.error("VK upload error:", error)
    return null
  }
}

// Загрузка видео на YouTube (требует OAuth)
async function uploadToYouTube(
  file: File,
  title: string,
  description: string,
  isPrivate: boolean = true
): Promise<{ videoId: string; url: string; embedUrl: string } | null> {
  try {
    // Для YouTube требуется OAuth токен, который должен быть получен через flow авторизации
    const youtubeToken = await getYouTubeToken() // Нужно реализовать OAuth flow
    
    if (!youtubeToken) {
      console.error("YouTube OAuth token not available")
      return null
    }

    // YouTube API v3 upload через resumable upload
    // Это упрощенная версия, в реальности нужен более сложный процесс
    
    // 1. Инициализируем upload session
    const metadata = {
      snippet: {
        title,
        description,
        tags: ["fitness", "stretching", "yoga"],
        categoryId: "17" // Sports
      },
      status: {
        privacyStatus: isPrivate ? "unlisted" : "public",
        selfDeclaredMadeForKids: false
      }
    }

    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${youtubeToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Length": file.size.toString(),
          "X-Upload-Content-Type": file.type
        },
        body: JSON.stringify(metadata)
      }
    )

    if (!initResponse.ok) {
      console.error("YouTube init upload failed:", await initResponse.text())
      return null
    }

    const uploadUrl = initResponse.headers.get("Location")
    if (!uploadUrl) {
      console.error("No upload URL received from YouTube")
      return null
    }

    // 2. Загружаем видео файл
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Length": file.size.toString()
      },
      body: file
    })

    if (!uploadResponse.ok) {
      console.error("YouTube video upload failed:", await uploadResponse.text())
      return null
    }

    const videoData = await uploadResponse.json()
    
    return {
      videoId: videoData.id,
      url: `https://www.youtube.com/watch?v=${videoData.id}`,
      embedUrl: `https://www.youtube.com/embed/${videoData.id}`
    }
  } catch (error) {
    console.error("YouTube upload error:", error)
    return null
  }
}

// Получение YouTube OAuth токена (заглушка - нужна реализация)
async function getYouTubeToken(): Promise<string | null> {
  // Здесь должна быть логика получения OAuth токена из БД
  // После того как пользователь авторизовался через OAuth flow
  const { data } = await supabaseAdmin
    .from("integrations")
    .select("config")
    .eq("service", "youtube")
    .eq("is_active", true)
    .single()

  return data?.config?.access_token || null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const courseId = formData.get("courseId") as string
    const lessonId = formData.get("lessonId") as string

    if (!file || !title) {
      return NextResponse.json(
        { error: "Файл и название обязательны" },
        { status: 400 }
      )
    }

    // Проверяем размер файла (макс 5GB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Размер файла превышает 5GB" },
        { status: 413 }
      )
    }

    // Проверяем тип файла
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат видео" },
        { status: 415 }
      )
    }

    // Загружаем параллельно на обе платформы
    const [vkResult, youtubeResult] = await Promise.allSettled([
      uploadToVK(file, title, description, true),
      uploadToYouTube(file, title, description, true)
    ])

    const vkData = vkResult.status === "fulfilled" ? vkResult.value : null
    const youtubeData = youtubeResult.status === "fulfilled" ? youtubeResult.value : null

    if (!vkData && !youtubeData) {
      return NextResponse.json(
        { error: "Не удалось загрузить видео ни на одну платформу" },
        { status: 500 }
      )
    }

    // Сохраняем информацию о видео в БД
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from("videos")
      .insert({
        title,
        description,
        course_id: courseId,
        lesson_id: lessonId,
        vk_video_id: vkData?.videoId,
        vk_url: vkData?.url,
        vk_embed_url: vkData?.embedUrl,
        youtube_video_id: youtubeData?.videoId,
        youtube_url: youtubeData?.url,
        youtube_embed_url: youtubeData?.embedUrl,
        is_private: true,
        duration: 0, // Нужно будет обновить после обработки
        status: "processing"
      })
      .select()
      .single()

    if (dbError) {
      console.error("Ошибка сохранения в БД:", dbError)
      return NextResponse.json(
        { error: "Ошибка сохранения информации о видео" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      video: videoRecord,
      platforms: {
        vk: vkData ? "success" : "failed",
        youtube: youtubeData ? "success" : "failed"
      }
    })
  } catch (error) {
    console.error("Ошибка загрузки видео:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки видео" },
      { status: 500 }
    )
  }
}