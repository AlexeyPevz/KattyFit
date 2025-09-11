import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateRAGResponse } from "@/lib/rag-engine"

// Интерфейс для унифицированного сообщения
interface UnifiedMessage {
  userId: string
  userName?: string
  text: string
  platform: string
  chatId?: string
  messageId?: string
  attachments?: any[]
}

// Парсеры для разных платформ
const platformParsers = {
  telegram: (body: any): UnifiedMessage => ({
    userId: body.message?.from?.id?.toString() || body.callback_query?.from?.id?.toString(),
    userName: body.message?.from?.first_name || body.callback_query?.from?.first_name,
    text: body.message?.text || body.callback_query?.data || "",
    platform: "telegram",
    chatId: body.message?.chat?.id?.toString(),
    messageId: body.message?.message_id?.toString(),
  }),

  vk: (body: any): UnifiedMessage => {
    const message = body.object?.message || body.object
    return {
      userId: message.from_id?.toString(),
      text: message.text || "",
      platform: "vk",
      messageId: message.id?.toString(),
      attachments: message.attachments,
    }
  },

  instagram: (body: any): UnifiedMessage => {
    const messaging = body.entry?.[0]?.messaging?.[0]
    return {
      userId: messaging?.sender?.id,
      text: messaging?.message?.text || "",
      platform: "instagram",
      messageId: messaging?.message?.mid,
    }
  },

  whatsapp: (body: any): UnifiedMessage => {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    return {
      userId: message?.from,
      userName: body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name,
      text: message?.text?.body || "",
      platform: "whatsapp",
      messageId: message?.id,
    }
  },

  web: (body: any): UnifiedMessage => ({
    userId: body.message?.from?.id?.toString(),
    userName: body.message?.from?.first_name || "Пользователь сайта",
    text: body.message?.text || "",
    platform: "web",
    chatId: body.message?.chat?.id?.toString(),
    messageId: body.message?.message_id?.toString(),
  }),
}

// Функция для отправки сообщений
async function sendMessage(platform: string, userId: string, text: string, extras?: any) {
  const apiKeys = await getApiKeysForPlatform(platform)
  
  switch (platform) {
    case "telegram":
      return sendTelegramMessage(apiKeys.token, userId, text, extras)
    case "vk":
      return sendVKMessage(apiKeys.token, userId, text, extras)
    case "instagram":
      return sendInstagramMessage(apiKeys, userId, text, extras)
    case "whatsapp":
      return sendWhatsAppMessage(apiKeys, userId, text, extras)
    case "web":
      // Для веб-чата ответ отправляется через веб-сокеты или polling
      return { success: true, platform: "web", message: text }
    default:
      throw new Error(`Неподдерживаемая платформа: ${platform}`)
  }
}

// Получение API ключей для платформы
async function getApiKeysForPlatform(platform: string) {
  // 1) Читаем из переменных окружения (v0 / Vercel)
  const envKeys: Record<string, Record<string, string>> = {
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN || "",
      secret_token: process.env.TELEGRAM_SECRET_TOKEN || "",
    },
    vk: {
      token: process.env.VK_API_TOKEN || "",
      confirmation: process.env.VK_CONFIRMATION_CODE || "",
    },
    whatsapp: {
      phone_number_id: process.env.WA_PHONE_NUMBER_ID || "",
      token: process.env.WA_TOKEN || "",
    },
    instagram: {
      token: process.env.INSTAGRAM_TOKEN || "",
      app_secret: process.env.INSTAGRAM_APP_SECRET || "",
    },
  }

  const envSet = envKeys[platform as keyof typeof envKeys]
  if (envSet && Object.values(envSet).some(v => v)) {
    return envSet
  }

  // 2) Legacy fallback: читаем из таблицы api_keys
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("key_name, key_value")
    .eq("service", platform)
    .eq("is_active", true)

  const keys: Record<string, string> = {}
  data?.forEach(item => {
    keys[item.key_name] = item.key_value
  })

  return keys
}

// Отправка в Telegram
async function sendTelegramMessage(token: string, chatId: string, text: string, extras?: any) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...extras,
    }),
  })

  return response.json()
}

// Отправка в VK
async function sendVKMessage(token: string, userId: string, text: string, extras?: any) {
  const params = new URLSearchParams({
    access_token: token,
    user_id: userId,
    message: text,
    random_id: Date.now().toString(),
    v: "5.131",
    ...extras,
  })

  const response = await fetch(`https://api.vk.com/method/messages.send?${params}`)
  return response.json()
}

// Отправка в Instagram (через ContentStudio или Meta API)
async function sendInstagramMessage(keys: any, userId: string, text: string, extras?: any) {
  // Здесь будет интеграция с Instagram Messaging API
  // Пока возвращаем заглушку
  return { success: true, platform: "instagram", message: "Not implemented yet" }
}

// Отправка в WhatsApp
async function sendWhatsAppMessage(keys: any, to: string, text: string, extras?: any) {
  const response = await fetch(
    `https://graph.facebook.com/v17.0/${keys.phone_number_id}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${keys.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
        ...extras,
      }),
    }
  )

  return response.json()
}

// Обертка для вызова RAG движка
async function generateChatResponse(message: UnifiedMessage) {
  // Получаем историю диалога
  const { data: history } = await supabaseAdmin
    .from("chat_messages")
    .select("*")
    .eq("user_id", message.userId)
    .eq("platform", message.platform)
    .order("created_at", { ascending: false })
    .limit(10)

  // Вызываем RAG движок
  const response = await generateRAGResponse({
    userMessage: message.text,
    chatHistory: history || [],
    platform: message.platform,
    userName: message.userName,
  })

  return response
}

// Основной обработчик webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params
    const body = await request.json()

    // Проверяем, поддерживается ли платформа
    if (!platformParsers[platform as keyof typeof platformParsers]) {
      return NextResponse.json(
        { error: "Неподдерживаемая платформа" },
        { status: 400 }
      )
    }

    // Парсим сообщение
    const message = platformParsers[platform as keyof typeof platformParsers](body)

    // Сохраняем входящее сообщение
    await supabaseAdmin.from("chat_messages").insert({
      user_id: message.userId,
      platform: message.platform,
      message_type: "incoming",
      text: message.text,
      raw_data: body,
    })

    // Генерируем ответ
    const response = await generateChatResponse(message)

    // Отправляем ответ
    await sendMessage(platform, message.userId, response, {
      reply_to_message_id: message.messageId,
    })

    // Сохраняем исходящее сообщение
    await supabaseAdmin.from("chat_messages").insert({
      user_id: message.userId,
      platform: message.platform,
      message_type: "outgoing",
      text: response,
    })

    // Платформы ожидают быстрый ответ
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Обработчик GET для верификации webhook (требуется для некоторых платформ)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const { searchParams } = new URL(request.url)

  switch (platform) {
    case "telegram":
      // Telegram не требует верификации
      return NextResponse.json({ ok: true })

    case "vk":
      // VK Callback API верификация
      const confirmation = searchParams.get("confirmation")
      if (confirmation) {
        // Берём код подтверждения из api_keys(service=vk, key_name=confirmation)
        const { data } = await supabaseAdmin
          .from("api_keys")
          .select("key_value")
          .eq("service", "vk")
          .eq("key_name", "confirmation")
          .single()

        const code = data?.key_value || ""
        return new Response(code, {
          headers: { "Content-Type": "text/plain" },
        })
      }
      break

    case "whatsapp":
    case "instagram":
      // Meta webhook верификация
      const mode = searchParams.get("hub.mode")
      const token = searchParams.get("hub.verify_token")
      const challenge = searchParams.get("hub.challenge")

      if (mode === "subscribe" && token === process.env.META_WEBHOOK_TOKEN) {
        return new Response(challenge)
      }
      break

    case "web":
      // Веб-чат не требует верификации
      return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
