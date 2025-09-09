import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    // Получаем все интеграции
    const { data: integrations, error: intError } = await supabaseAdmin
      .from("integrations")
      .select("*")
      .order("service")

    if (intError) throw intError

    // Проверяем наличие ключей в env (v0)
    const envStatus = {
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
        connected: envStatus.elevenlabs,
        hasApiKey: envStatus.elevenlabs,
      },
      {
        id: "openai",
        service: "openai",
        name: "OpenAI",
        icon: "🤖",
        requiresOAuth: false,
        connected: envStatus.openai,
        hasApiKey: envStatus.openai,
      },
      {
        id: "vk",
        service: "vk",
        name: "VKontakte",
        icon: "📱",
        requiresOAuth: false,
        connected: envStatus.vk,
        hasApiKey: envStatus.vk,
      },
      {
        id: "telegram",
        service: "telegram",
        name: "Telegram Bot",
        icon: "✈️",
        requiresOAuth: false,
        connected: envStatus.telegram,
        hasApiKey: envStatus.telegram,
      },
    ]

    return NextResponse.json({
      success: true,
      services,
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
