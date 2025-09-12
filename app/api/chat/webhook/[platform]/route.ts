import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateRAGResponse } from "@/lib/rag-engine"
import logger from "@/lib/logger"

// Интерфейс для унифицированного сообщения
interface UnifiedMessage {
  userId: string
  userName?: string
  text: string
  platform: string
  chatId?: string
  messageId?: string
  attachments?: Array<Record<string, unknown>>
}

// Парсеры для разных платформ
const platformParsers = {
  telegram: (body: Record<string, unknown>): UnifiedMessage => {
    const message = body.message as Record<string, unknown> | undefined
    const callbackQuery = body.callback_query as Record<string, unknown> | undefined
    return {
      userId: (message?.from as Record<string, unknown>)?.id?.toString() || 
              (callbackQuery?.from as Record<string, unknown>)?.id?.toString() || "",
      userName: (message?.from as Record<string, unknown>)?.first_name as string || 
                (callbackQuery?.from as Record<string, unknown>)?.first_name as string,
      text: (message?.text as string) || (callbackQuery?.data as string) || "",
      platform: "telegram",
      chatId: (message?.chat as Record<string, unknown>)?.id?.toString(),
      messageId: (message?.message_id as string)?.toString(),
    }
  },

  vk: (body: Record<string, unknown>): UnifiedMessage => {
    const object = body.object as Record<string, unknown> | undefined
    const message = (object?.message as Record<string, unknown>) || object
    return {
      userId: (message?.from_id as number)?.toString(),
      text: (message?.text as string) || "",
      platform: "vk",
      messageId: (message?.id as number)?.toString(),
      attachments: message?.attachments as Array<Record<string, unknown>>,
    }
  },

  instagram: (body: Record<string, unknown>): UnifiedMessage => {
    const entry = body.entry as Array<Record<string, unknown>> | undefined
    const messaging = entry?.[0]?.messaging as Array<Record<string, unknown>> | undefined
    const messageData = messaging?.[0]
    return {
      userId: (messageData?.sender as Record<string, unknown>)?.id as string,
      text: ((messageData?.message as Record<string, unknown>)?.text as string) || "",
      platform: "instagram",
      messageId: (messageData?.message as Record<string, unknown>)?.mid as string,
    }
  },

  whatsapp: (body: Record<string, unknown>): UnifiedMessage => {
    const entry = body.entry as Array<Record<string, unknown>> | undefined
    const changes = entry?.[0]?.changes as Array<Record<string, unknown>> | undefined
    const value = changes?.[0]?.value as Record<string, unknown> | undefined
    const messages = value?.messages as Array<Record<string, unknown>> | undefined
    const message = messages?.[0]
    const contacts = value?.contacts as Array<Record<string, unknown>> | undefined
    const contact = contacts?.[0]
    const profile = contact?.profile as Record<string, unknown> | undefined
    const text = message?.text as Record<string, unknown> | undefined
    
    return {
      userId: (message?.from as string) || "",
      userName: (profile?.name as string) || "",
      text: (text?.body as string) || "",
      platform: "whatsapp",
      messageId: (message?.id as string) || "",
    }
  },

  web: (body: Record<string, unknown>): UnifiedMessage => {
    const message = body.message as Record<string, unknown> | undefined
    const from = message?.from as Record<string, unknown> | undefined
    const chat = message?.chat as Record<string, unknown> | undefined
    return {
      userId: from?.id?.toString() || "",
      userName: (from?.first_name as string) || "Пользователь сайта",
      text: (message?.text as string) || "",
      platform: "web",
      chatId: chat?.id?.toString() || "",
      messageId: (message?.message_id as string)?.toString() || "",
    }
  },
}

// Функция для отправки сообщений
async function sendMessage(platform: string, userId: string, text: string, extras?: Record<string, unknown>) {
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
async function sendTelegramMessage(token: string, chatId: string, text: string, extras?: Record<string, unknown>) {
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
async function sendVKMessage(token: string, userId: string, text: string, extras?: Record<string, unknown>) {
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
async function sendInstagramMessage(keys: Record<string, unknown>, userId: string, text: string, extras?: Record<string, unknown>) {
  // Здесь будет интеграция с Instagram Messaging API
  // Пока возвращаем заглушку
  return { success: true, platform: "instagram", message: "Not implemented yet" }
}

// Отправка в WhatsApp
async function sendWhatsAppMessage(keys: Record<string, unknown>, to: string, text: string, extras?: Record<string, unknown>) {
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
    userContext: {},
    conversationId: 'unknown'
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
    logger.error("Webhook error", { error: error instanceof Error ? error.message : String(error) })
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
  const { searchParams } = request.nextUrl

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
