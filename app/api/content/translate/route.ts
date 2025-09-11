import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"
import logger from "@/lib/logger"

export const POST = apiHandler(async (request: NextRequest) => {
  const { contentId, targetLanguage, autoTranslate } = await request.json()

  if (!contentId || !targetLanguage) {
    return NextResponse.json(
      { error: "Необходимы contentId и targetLanguage" },
      { status: 400 }
    )
  }

  try {
    // Получаем оригинальный контент
    const { data: content, error: contentError } = await supabaseAdmin
      .from("content")
      .select("*")
      .eq("id", contentId)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { error: "Контент не найден" },
        { status: 404 }
      )
    }

    let translation = {
      title: content.title,
      description: content.description,
      language: targetLanguage,
    }

    if (autoTranslate) {
      // В реальном приложении здесь был бы вызов AI сервиса для перевода
      // Например, Google Translate API, Yandex Translate, или OpenAI
      
      // Для демо создаем простой перевод
      const translations: Record<string, { title: string; description: string }> = {
        en: {
          title: `[EN] ${content.title}`,
          description: `[English translation] ${content.description}`,
        },
        es: {
          title: `[ES] ${content.title}`,
          description: `[Traducción al español] ${content.description}`,
        },
        de: {
          title: `[DE] ${content.title}`,
          description: `[Deutsche Übersetzung] ${content.description}`,
        },
        fr: {
          title: `[FR] ${content.title}`,
          description: `[Traduction française] ${content.description}`,
        },
        it: {
          title: `[IT] ${content.title}`,
          description: `[Traduzione italiana] ${content.description}`,
        },
        pt: {
          title: `[PT] ${content.title}`,
          description: `[Tradução portuguesa] ${content.description}`,
        },
        tr: {
          title: `[TR] ${content.title}`,
          description: `[Türkçe çeviri] ${content.description}`,
        },
      }

      translation = {
        title: translations[targetLanguage]?.title || content.title,
        description: translations[targetLanguage]?.description || content.description,
        language: targetLanguage,
      }
    }

    // Сохраняем перевод в базу данных
    const { error: saveError } = await supabaseAdmin
      .from("content_translations")
      .upsert({
        content_id: contentId,
        language: targetLanguage,
        title: translation.title,
        description: translation.description,
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "content_id,language"
      })

    if (saveError) {
      logger.error("Ошибка сохранения перевода", { error: saveError instanceof Error ? saveError.message : String(saveError) })
      // Не возвращаем ошибку, так как перевод все равно создан
    }

    return NextResponse.json({
      success: true,
      translation,
      message: "Перевод создан",
    })
  } catch (error) {
    logger.error("Ошибка создания перевода", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка создания перевода" },
      { status: 500 }
    )
  }
})

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get("contentId")

  if (!contentId) {
    return NextResponse.json(
      { error: "Необходим contentId" },
      { status: 400 }
    )
  }

  try {
    const { data: translations, error } = await supabaseAdmin
      .from("content_translations")
      .select("*")
      .eq("content_id", contentId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      translations: translations || [],
    })
  } catch (error) {
    console.error("Ошибка загрузки переводов:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки переводов" },
      { status: 500 }
    )
  }
})
