import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const enableTranslation = formData.get("enableTranslation") === "true"
    const targetLanguages = JSON.parse(formData.get("targetLanguages") as string || "[]")

    if (!file) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 400 }
      )
    }

    // Создаем уникальное имя файла
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = `${uniqueSuffix}-${file.name}`
    
    // Для демо - сохраняем локально. В продакшене используйте Supabase Storage
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Создаем запись в БД
    const { data: content, error } = await supabase
      .from("content")
      .insert({
        title,
        description,
        type,
        filename,
        original_name: file.name,
        size: file.size,
        mime_type: file.type,
        status: "processing",
        languages: ["ru"],
        target_languages: enableTranslation ? targetLanguages : [],
        platforms: [],
        views: 0,
        thumbnail: null,
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

    // Имитируем обработку видео
    setTimeout(async () => {
      await supabase
        .from("content")
        .update({ status: "draft" })
        .eq("id", content.id)
    }, 3000)

    return NextResponse.json({
      success: true,
      content: content,
    })
  } catch (error) {
    console.error("Ошибка загрузки:", error)
    return NextResponse.json(
      { error: "Ошибка при загрузке файла" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data: content, error } = await supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Ошибка загрузки контента:", error)
      return NextResponse.json(
        { error: "Ошибка загрузки контента" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: content || [],
    })
  } catch (error) {
    console.error("Ошибка:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}