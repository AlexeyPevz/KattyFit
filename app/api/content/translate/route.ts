import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Получение API ключа ElevenLabs
async function getElevenLabsKey(): Promise<string | null> {
  if (process.env.ELEVENLABS_API_KEY) {
    return process.env.ELEVENLABS_API_KEY
  }

  // legacy fallback
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("key_value")
    .eq("service", "elevenlabs")
    .eq("is_active", true)
    .single()

  return data?.key_value || null
}

// Функция для запуска дубляжа через ElevenLabs
async function startDubbing(videoUrl: string, targetLanguages: string[], apiKey: string) {
  const response = await fetch("https://api.elevenlabs.io/v1/dubbing", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_url: videoUrl,
      target_lang: targetLanguages,
      mode: "automatic", // или "manual" для ручного контроля
      num_speakers: 1, // Количество спикеров
      watermark: false, // Без водяного знака
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Ошибка запуска дубляжа")
  }

  return response.json()
}

// Проверка статуса дубляжа
async function checkDubbingStatus(dubbingId: string, apiKey: string) {
  const response = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
    headers: {
      "xi-api-key": apiKey,
    },
  })

  if (!response.ok) {
    throw new Error("Ошибка проверки статуса")
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const { contentId, targetLanguages } = await request.json()

    if (!contentId || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: "Необходимо указать контент и целевые языки" },
        { status: 400 }
      )
    }

    // Получаем API ключ
    const apiKey = await getElevenLabsKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API ключ не настроен" },
        { status: 400 }
      )
    }

    // Получаем информацию о контенте
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

    // Формируем URL видео
    let videoUrl = ""
    if (content.url) {
      videoUrl = content.url // RuTube или другая платформа
    } else if (content.filename) {
      // Локальный файл - нужен публичный URL
      videoUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/uploads/${content.filename}`
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: "URL видео не найден" },
        { status: 400 }
      )
    }

    // Запускаем дубляж
    const dubbingResult = await startDubbing(videoUrl, targetLanguages, apiKey)

    // Сохраняем задачу дубляжа в БД
    const { error: taskError } = await supabaseAdmin
      .from("content")
      .update({
        target_languages: targetLanguages,
        dubbing_id: dubbingResult.dubbing_id,
        dubbing_status: "processing",
      })
      .eq("id", contentId)

    if (taskError) {
      console.error("Ошибка сохранения задачи:", taskError)
    }

    return NextResponse.json({
      success: true,
      dubbingId: dubbingResult.dubbing_id,
      message: "Дубляж запущен. Процесс может занять несколько минут.",
    })
  } catch (error: any) {
    console.error("Ошибка запуска дубляжа:", error)
    return NextResponse.json(
      { error: error.message || "Ошибка при запуске дубляжа" },
      { status: 500 }
    )
  }
}

// Проверка статуса дубляжа
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dubbingId = searchParams.get("dubbingId")
  const contentId = searchParams.get("contentId")

  if (!dubbingId && !contentId) {
    return NextResponse.json(
      { error: "Необходимо указать ID дубляжа или контента" },
      { status: 400 }
    )
  }

  try {
    const apiKey = await getElevenLabsKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API ключ не настроен" },
        { status: 400 }
      )
    }

    let dubbing_id = dubbingId

    // Если передан contentId, получаем dubbingId из БД
    if (contentId && !dubbing_id) {
      const { data: content } = await supabaseAdmin
        .from("content")
        .select("dubbing_id")
        .eq("id", contentId)
        .single()

      dubbing_id = content?.dubbing_id
    }

    if (!dubbing_id) {
      return NextResponse.json(
        { error: "ID дубляжа не найден" },
        { status: 404 }
      )
    }

    // Проверяем статус
    const status = await checkDubbingStatus(dubbing_id, apiKey)

    // Обновляем статус в БД если есть contentId
    if (contentId && status.status === "completed") {
      await supabaseAdmin
        .from("content")
        .update({
          dubbing_status: "completed",
          dubbed_urls: status.dubbed_file_urls,
        })
        .eq("id", contentId)
    }

    return NextResponse.json({
      success: true,
      status: status.status,
      progress: status.progress || 0,
      dubbedUrls: status.dubbed_file_urls || {},
      error: status.error,
    })
  } catch (error: any) {
    console.error("Ошибка проверки статуса:", error)
    return NextResponse.json(
      { error: error.message || "Ошибка при проверке статуса" },
      { status: 500 }
    )
  }
}