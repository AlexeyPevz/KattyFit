import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"
import logger from "@/lib/logger"

// Проверка статуса дубляжа ElevenLabs
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl
  const dubbingId = searchParams.get("dubbingId")
  const contentId = searchParams.get("contentId")

  if (!dubbingId && !contentId) {
    return NextResponse.json(
      { error: "Необходим dubbingId или contentId" },
      { status: 400 }
    )
  }

  try {
    let dubbingIdToCheck = dubbingId

    // Если передан contentId, получаем dubbingId из базы
    if (contentId && !dubbingId) {
      const { data: translation } = await supabaseAdmin
        .from("content_translations")
        .select("dubbing_id")
        .eq("content_id", contentId)
        .eq("status", "processing")
        .single()

      if (!translation?.dubbing_id) {
        return NextResponse.json({
          success: false,
          error: "Задача дубляжа не найдена"
        }, { status: 404 })
      }

      dubbingIdToCheck = translation.dubbing_id
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY

    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: "ElevenLabs API ключ не настроен" },
        { status: 500 }
      )
    }

    // Проверяем статус в ElevenLabs
    const statusResponse = await fetch(
      `https://api.elevenlabs.io/v1/dubbing/${dubbingIdToCheck}`,
      {
        headers: {
          'xi-api-key': elevenLabsKey,
        },
      }
    )

    if (!statusResponse.ok) {
      const error = await statusResponse.text()
      logger.error("Failed to check dubbing status", { error, dubbingId: dubbingIdToCheck })
      return NextResponse.json(
        { error: "Ошибка проверки статуса" },
        { status: 500 }
      )
    }

    const statusData = await statusResponse.json()

    // Обновляем статус в базе данных
    if (statusData.status === "dubbed") {
      // Дубляж завершен, скачиваем результат
      const downloadResponse = await fetch(
        `https://api.elevenlabs.io/v1/dubbing/${dubbingIdToCheck}/audio/${statusData.target_languages[0]}`,
        {
          headers: {
            'xi-api-key': elevenLabsKey,
          },
        }
      )

      if (downloadResponse.ok) {
        const audioBuffer = await downloadResponse.arrayBuffer()
        
        // Загружаем в Supabase Storage
        const filename = `dubbed/${dubbingIdToCheck}_${statusData.target_languages[0]}.mp3`
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('content')
          .upload(filename, new Uint8Array(audioBuffer), {
            contentType: 'audio/mpeg',
            upsert: true,
          })

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabaseAdmin
            .storage
            .from('content')
            .getPublicUrl(uploadData.path)

          // Обновляем запись перевода
          await supabaseAdmin
            .from("content_translations")
            .update({
              status: "completed",
              dubbed_url: publicUrlData.publicUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("dubbing_id", dubbingIdToCheck)

          return NextResponse.json({
            success: true,
            status: "completed",
            dubbedUrl: publicUrlData.publicUrl,
            dubbingId: dubbingIdToCheck,
          })
        }
      }
    } else if (statusData.status === "dubbing") {
      // Еще в процессе
      await supabaseAdmin
        .from("content_translations")
        .update({
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("dubbing_id", dubbingIdToCheck)

      return NextResponse.json({
        success: true,
        status: "processing",
        progress: statusData.progress || 0,
        dubbingId: dubbingIdToCheck,
      })
    } else if (statusData.status === "failed") {
      // Ошибка дубляжа
      await supabaseAdmin
        .from("content_translations")
        .update({
          status: "failed",
          error: statusData.error_message || "Unknown error",
          updated_at: new Date().toISOString(),
        })
        .eq("dubbing_id", dubbingIdToCheck)

      return NextResponse.json({
        success: false,
        status: "failed",
        error: statusData.error_message,
        dubbingId: dubbingIdToCheck,
      })
    }

    return NextResponse.json({
      success: true,
      status: statusData.status,
      dubbingId: dubbingIdToCheck,
      data: statusData,
    })
  } catch (error) {
    logger.error("Dubbing status check error", { 
      error: error instanceof Error ? error.message : String(error),
      dubbingId,
      contentId 
    })
    return NextResponse.json(
      { error: "Ошибка проверки статуса дубляжа" },
      { status: 500 }
    )
  }
})