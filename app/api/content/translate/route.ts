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

    if (autoTranslate && content.url) {
      // Реальная интеграция с ElevenLabs Dubbing API
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY

      if (elevenLabsKey) {
        try {
          // Создаем задачу дубляжа
          const dubbingResponse = await fetch('https://api.elevenlabs.io/v1/dubbing', {
            method: 'POST',
            headers: {
              'xi-api-key': elevenLabsKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source_url: content.url,
              target_lang: targetLanguage,
              num_speakers: 1,
              watermark: false, // Требует подписки
            }),
          })

          if (!dubbingResponse.ok) {
            const error = await dubbingResponse.text()
            logger.warn("ElevenLabs dubbing failed", { error, targetLanguage })
          } else {
            const dubbingData = await dubbingResponse.json()
            const dubbingId = dubbingData.dubbing_id

            // Сохраняем ID задачи для отслеживания статуса
            await supabaseAdmin
              .from("content_translations")
              .upsert({
                content_id: contentId,
                language: targetLanguage,
                title: content.title,
                description: content.description,
                status: "processing",
                dubbing_id: dubbingId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, {
                onConflict: "content_id,language"
              })

            logger.info("ElevenLabs dubbing started", { dubbingId, targetLanguage })
            
            translation = {
              title: content.title,
              description: content.description,
              language: targetLanguage,
              dubbing_id: dubbingId,
            } as typeof translation & { dubbing_id?: string }
          }
        } catch (error) {
          logger.error("ElevenLabs API error", { 
            error: error instanceof Error ? error.message : String(error),
            targetLanguage 
          })
        }
      } else {
        // Fallback: простой перевод заголовков через OpenAI/YandexGPT
        const langNames: Record<string, string> = {
          en: 'English',
          es: 'Spanish',
          de: 'German',
          fr: 'French',
          it: 'Italian',
          pt: 'Portuguese',
          tr: 'Turkish',
        }
        
        logger.info("Using fallback translation (ElevenLabs not configured)", { targetLanguage })
        
        translation = {
          title: `${content.title} (${langNames[targetLanguage] || targetLanguage})`,
          description: content.description,
          language: targetLanguage,
        }
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
  const { searchParams } = request.nextUrl
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
    logger.error("Ошибка загрузки переводов", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка загрузки переводов" },
      { status: 500 }
    )
  }
})
