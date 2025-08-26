import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const { contentId, language, imageData, type = "generated" } = await request.json()

    if (!contentId || !language || !imageData) {
      return NextResponse.json(
        { error: "Необходимо указать контент, язык и изображение" },
        { status: 400 }
      )
    }

    // Преобразуем base64 в buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    // Создаем уникальное имя файла
    const filename = `thumbnail-${contentId}-${language}-${Date.now()}.png`
    
    // Для демо - сохраняем локально
    const thumbnailsDir = path.join(process.cwd(), "public", "thumbnails")
    if (!existsSync(thumbnailsDir)) {
      await mkdir(thumbnailsDir, { recursive: true })
    }
    
    const filepath = path.join(thumbnailsDir, filename)
    await writeFile(filepath, buffer)

    // URL для доступа к файлу
    const url = `/thumbnails/${filename}`

    // Сохраняем в БД (upsert - обновляем если существует)
    const { data: thumbnail, error } = await supabaseAdmin
      .from("thumbnails")
      .upsert({
        content_id: contentId,
        language,
        url,
        type,
      }, {
        onConflict: "content_id,language"
      })
      .select()
      .single()

    if (error) {
      console.error("Ошибка сохранения обложки:", error)
      return NextResponse.json(
        { error: "Ошибка сохранения в базу данных" },
        { status: 500 }
      )
    }

    // Обновляем основную обложку контента (для языка по умолчанию)
    if (language === "ru") {
      await supabaseAdmin
        .from("content")
        .update({ thumbnail: url })
        .eq("id", contentId)
    }

    return NextResponse.json({
      success: true,
      thumbnail,
      url,
    })
  } catch (error) {
    console.error("Ошибка сохранения обложки:", error)
    return NextResponse.json(
      { error: "Ошибка при сохранении обложки" },
      { status: 500 }
    )
  }
}

// Получение обложек для контента
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get("contentId")

  if (!contentId) {
    return NextResponse.json(
      { error: "Необходимо указать ID контента" },
      { status: 400 }
    )
  }

  try {
    const { data: thumbnails, error } = await supabaseAdmin
      .from("thumbnails")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      thumbnails: thumbnails || [],
    })
  } catch (error) {
    console.error("Ошибка загрузки обложек:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки обложек" },
      { status: 500 }
    )
  }
}