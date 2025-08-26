import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Функция для извлечения ID видео из ссылки RuTube
function extractRutubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const videoIndex = pathParts.indexOf("video")
    if (videoIndex !== -1 && pathParts[videoIndex + 1]) {
      return pathParts[videoIndex + 1]
    }
    return null
  } catch {
    return null
  }
}

// Функция для получения метаданных RuTube через их API
async function fetchRutubeMetadata(videoId: string) {
  try {
    // RuTube API endpoint для получения информации о видео
    const response = await fetch(`https://rutube.ru/api/video/${videoId}/`)
    if (!response.ok) {
      throw new Error("Не удалось получить данные видео")
    }
    
    const data = await response.json()
    return {
      title: data.title || "Видео с RuTube",
      description: data.description || "",
      duration: data.duration || 0,
      thumbnail: data.thumbnail_url || data.picture_url || null,
      embedUrl: `https://rutube.ru/play/embed/${videoId}`,
    }
  } catch (error) {
    console.error("Ошибка получения метаданных RuTube:", error)
    // Возвращаем дефолтные значения
    return {
      title: "Видео с RuTube",
      description: "",
      duration: 0,
      thumbnail: null,
      embedUrl: `https://rutube.ru/play/embed/${videoId}`,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, title, description, type, enableTranslation, targetLanguages } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL не указан" },
        { status: 400 }
      )
    }

    const videoId = extractRutubeVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: "Неверный формат ссылки RuTube" },
        { status: 400 }
      )
    }

    // Получаем метаданные с RuTube
    const metadata = await fetchRutubeMetadata(videoId)

    // Создаем запись в БД
    const { data: content, error } = await supabase
      .from("content")
      .insert({
        title: title || metadata.title,
        description: description || metadata.description,
        type: type || (metadata.duration > 180 ? "lesson" : "short"),
        platform: "rutube",
        video_id: videoId,
        url,
        embed_url: metadata.embedUrl,
        duration: metadata.duration,
        status: "processing",
        languages: ["ru"],
        target_languages: enableTranslation ? targetLanguages : [],
        platforms: ["rutube"],
        views: 0,
        thumbnail: metadata.thumbnail,
      })
      .select()
      .single()

    if (error) {
      console.error("Ошибка создания записи:", error)
      return NextResponse.json(
        { error: "Ошибка сохранения в базу данных" },
        { status: 500 }
      )
    }

    // Имитируем обработку
    setTimeout(async () => {
      await supabase
        .from("content")
        .update({ status: "draft" })
        .eq("id", content.id)
    }, 2000)

    return NextResponse.json({
      success: true,
      content: content,
      metadata: metadata,
    })
  } catch (error) {
    console.error("Ошибка обработки RuTube URL:", error)
    return NextResponse.json(
      { error: "Ошибка при обработке ссылки" },
      { status: 500 }
    )
  }
}