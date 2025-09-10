import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    // В preview режиме v0 Supabase может быть недоступен
    const isPreview = request.headers.get('x-vercel-preview') || request.headers.get('x-v0-preview')
    
    let integrations = []
    if (!isPreview) {
      // Получаем все интеграции только если не в preview режиме
      const { data, error: intError } = await supabaseAdmin
        .from("integrations")
        .select("*")
        .order("service")

      if (intError) throw intError
      integrations = data || []
    }

    // Проверяем наличие ключей в env (v0)
    const apiKeysStatus = {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      vk: !!process.env.VK_API_TOKEN,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      tiktok: !!process.env.TIKTOK_API_KEY,
      contentstudio: !!process.env.CONTENTSTUDIO_API_KEY,
    }

    // Объединяем данные
    const services = [
      {
        id: "youtube",
        service: "youtube",
        name: "YouTube",
        icon: "🎬",
        requiresOAuth: true,
        connected: integrations?.find(i => i.service === "youtube")?.is_active || false,
        hasApiKey: false,
      },
      {
        id: "tiktok",
        service: "tiktok", 
        name: "TikTok Business",
        icon: "🎵",
        requiresOAuth: true,
        requiresBusinessAccount: true,
        connected: integrations?.find(i => i.service === "tiktok")?.is_active || false,
        hasApiKey: envStatus.tiktok,
      },
      {
        id: "elevenlabs",
        service: "elevenlabs",
        name: "ElevenLabs",
        icon: "🎙️",
        requiresOAuth: false,
        connected: apiKeysStatus.elevenlabs,
        hasApiKey: apiKeysStatus.elevenlabs,
      },
      {
        id: "openai",
        service: "openai",
        name: "OpenAI",
        icon: "🤖",
        requiresOAuth: false,
        connected: apiKeysStatus.openai,
        hasApiKey: apiKeysStatus.openai,
      },
      {
        id: "vk",
        service: "vk",
        name: "VKontakte",
        icon: "📱",
        requiresOAuth: false,
        connected: apiKeysStatus.vk,
        hasApiKey: apiKeysStatus.vk,
      },
      {
        id: "telegram",
        service: "telegram",
        name: "Telegram Bot",
        icon: "✈️",
        requiresOAuth: false,
        connected: apiKeysStatus.telegram,
        hasApiKey: apiKeysStatus.telegram,
      },
    ]

    // Добавляем проверку статуса окружения для v0 preview
    const envStatus = {
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      auth: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
      push: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      ai: !!(process.env.YANDEXGPT_API_KEY || process.env.OPENAI_API_KEY),
      payments: !!(process.env.NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID && process.env.CLOUDPAYMENTS_SECRET),
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      vk: !!process.env.VK_API_TOKEN,
      whatsapp: !!(process.env.WA_PHONE_NUMBER_ID && process.env.WA_TOKEN),
    }

    return NextResponse.json({
      success: true,
      services,
      ...envStatus, // Добавляем статус окружения
    })
  } catch (error) {
    console.error("Ошибка загрузки интеграций:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки интеграций" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { service, type, credentials } = await request.json()

    if (type === "oauth") {
      // Сохраняем OAuth конфигурацию
      const { error } = await supabaseAdmin
        .from("integrations")
        .upsert({
          service,
          config: credentials,
          is_active: true,
        }, {
          onConflict: "service"
        })

      if (error) throw error
    } else {
      // Сохраняем API ключи
      const updates = []
      
      if (credentials.apiKey) {
        updates.push({
          service,
          key_name: "api_key",
          key_value: credentials.apiKey,
          is_active: true,
        })
      }

      if (credentials.clientId) {
        updates.push({
          service,
          key_name: "client_id", 
          key_value: credentials.clientId,
          is_active: true,
        })
      }

      if (credentials.clientSecret) {
        updates.push({
          service,
          key_name: "client_secret",
          key_value: credentials.clientSecret,
          is_active: true,
        })
      }

      for (const update of updates) {
        const { error } = await supabaseAdmin
          .from("api_keys")
          .upsert(update, {
            onConflict: "service,key_name"
          })

        if (error) throw error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Интеграция ${service} успешно настроена`,
    })
  } catch (error) {
    console.error("Ошибка сохранения интеграции:", error)
    return NextResponse.json(
      { error: "Ошибка сохранения интеграции" },
      { status: 500 }
    )
  }
}
