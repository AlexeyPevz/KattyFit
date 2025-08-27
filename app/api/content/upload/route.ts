import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { env } from "@/lib/env"

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
    
    // Загрузка в Supabase Storage (v0 env)
    const fileBytes = await file.arrayBuffer()
    const { data: storageUpload, error: storageError } = await supabaseAdmin
      .storage
      .from(env.storageBucket)
      .upload(`content/${filename}`, new Uint8Array(fileBytes), {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      })

    if (storageError) {
      console.error("Ошибка загрузки в Storage:", storageError)
      return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 })
    }

    // Публичный URL файла
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(env.storageBucket)
      .getPublicUrl(storageUpload.path)
    const publicUrl = publicUrlData.publicUrl

    // Создаем запись в БД
    const { data: content, error } = await supabaseAdmin
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
        url: publicUrl,
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
      await supabaseAdmin
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
    const { data: content, error } = await supabaseAdmin
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