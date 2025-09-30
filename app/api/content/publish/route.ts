import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import logger from "@/lib/logger"

interface PublishRequest {
  contentId: string
  platforms: string[]
  languages: string[]
  scheduledAt?: string
  scheduleMap?: Record<string, string>
}

// Получение API ключей из БД
async function getApiKey(service: string): Promise<string | null> {
  const envMap: Record<string, string> = {
    vk: "VK_API_TOKEN",
    telegram: "TELEGRAM_BOT_TOKEN",
    telegram_chat_id: "TELEGRAM_CHAT_ID",
    contentstudio: "CONTENTSTUDIO_API_KEY",
  }

  const envName = envMap[service]
  if (envName && process.env[envName]) {
    return process.env[envName] as string
  }

  // fallback legacy
  const { data } = await supabaseAdmin
    .from("api_keys")
    .select("key_value")
    .eq("service", service)
    .eq("is_active", true)
    .single()

  return data?.key_value || null
}

// Публикация в VK
async function publishToVK(content: Record<string, unknown>, language: string) {
  const vkToken = await getApiKey("vk")
  if (!vkToken) {
    throw new Error("VK API token не настроен")
  }
  // Базовая публикация текста со ссылкой/обложкой (messages.send как пост-заглушка)
  const message = `${content.title}${content.url ? `\n${content.url}` : ''}`
  const params = new URLSearchParams({
    access_token: vkToken,
    v: '5.131',
    message,
    random_id: Date.now().toString(),
    // Для реальной стены нужен wall.post с owner_id/group_id
  })
  const res = await fetch(`https://api.vk.com/method/messages.send?${params.toString()}`)
  const data = await res.json()
  if (data.error) {
    throw new Error(`VK error: ${data.error.error_msg}`)
  }
  return { success: true, url: 'https://vk.com/im' }
}

// Публикация в Telegram
async function publishToTelegram(content: Record<string, unknown>, language: string) {
  const telegramToken = await getApiKey("telegram")
  const telegramChatId = await getApiKey("telegram_chat_id")
  
  if (!telegramToken || !telegramChatId) {
    throw new Error("Telegram не настроен")
  }

  const text = `${content.title}${content.url ? `\n${content.url}` : ''}`
  const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegramChatId, text })
  })
  const data = await res.json()
  if (!res.ok || !data.ok) {
    throw new Error(data.description || 'Telegram sendMessage failed')
  }
  const msgId = data.result?.message_id
  return { success: true, url: `https://t.me/c/${telegramChatId}/${msgId || ''}` }
}

// Публикация в YouTube (требует OAuth)
async function publishToYouTube(content: Record<string, unknown>, language: string) {
  const { data: integration } = await supabaseAdmin
    .from("integrations")
    .select("config")
    .eq("service", "youtube")
    .eq("is_active", true)
    .single()

  if (!integration?.config?.access_token) {
    throw new Error("YouTube OAuth не настроен")
  }

  // YouTube публикация через API v3 (требует OAuth)
  // Проверяем наличие OAuth credentials
  const youtubeClientId = process.env.YOUTUBE_CLIENT_ID
  const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET
  const youtubeRefreshToken = process.env.YOUTUBE_REFRESH_TOKEN

  if (!youtubeClientId || !youtubeClientSecret || !youtubeRefreshToken) {
    throw new Error("YouTube OAuth credentials не настроены. Настройте YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET и YOUTUBE_REFRESH_TOKEN в переменных окружения.")
  }

  // Получаем access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: youtubeClientId,
      client_secret: youtubeClientSecret,
      refresh_token: youtubeRefreshToken,
      grant_type: 'refresh_token'
    })
  })

  if (!tokenResponse.ok) {
    throw new Error('Не удалось получить YouTube access token')
  }

  const { access_token } = await tokenResponse.json()

  // Публикуем видео
  const videoTitle = (content.title as string) || 'Untitled Video'
  const videoDescription = (content.description as string) || ''
  
  const uploadResponse = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: (content.tags as string[]) || [],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: 'public',
        publishAt: (content.scheduled_at as string) || undefined
      }
    })
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    throw new Error(`YouTube upload failed: ${error}`)
  }

  const youtubeData = await uploadResponse.json()
  
  return {
    platform: 'youtube',
    videoId: youtubeData.id,
    url: `https://www.youtube.com/watch?v=${youtubeData.id}`,
    publishedAt: youtubeData.snippet?.publishedAt
  }
}

// Конфигурация платформ
const PLATFORM_CONFIG = {
  vk: {
    name: "VKontakte",
    publisher: publishToVK,
    requiresAuth: true,
  },
  telegram: {
    name: "Telegram",
    publisher: publishToTelegram,
    requiresAuth: true,
  },
  rutube: {
    name: "RuTube",
    publisher: async (content: Record<string, unknown>) => ({
      success: true,
      url: content.url, // Уже опубликовано на RuTube
    }),
    requiresAuth: false,
  },
  youtube: {
    name: "YouTube",
    publisher: publishToYouTube,
    requiresAuth: true,
    requiresOAuth: true,
  },
  instagram: {
    name: "Instagram",
    publisher: async () => {
      throw new Error("Instagram требует Business аккаунт")
    },
    requiresAuth: true,
    requiresBusinessAccount: true,
  },
  tiktok: {
    name: "TikTok",
    publisher: async () => {
      throw new Error("TikTok требует Business аккаунт")
    },
    requiresAuth: true,
    requiresBusinessAccount: true,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { contentId, platforms, languages, scheduledAt, scheduleMap }: PublishRequest = await request.json()

    if (!contentId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "Необходимо указать контент и платформы для публикации" },
        { status: 400 }
      )
    }

    // Получаем контент из БД
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

    const publishTasks: Array<{ platform: string; task: Promise<unknown> }> = []
    const errors: string[] = []

    // Создаем задачи публикации для каждой платформы и языка
    for (const platform of platforms) {
      const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
      
      if (!config) {
        errors.push(`Платформа ${platform} не поддерживается`)
        continue
      }

      for (const language of languages) {
        try {
          // Создаем запись о публикации
          const { data: publication, error: pubError } = await supabaseAdmin
            .from("publications")
            .insert({
              content_id: contentId,
              platform,
              language,
              status: "pending",
              scheduled_at: (scheduleMap && scheduleMap[platform]) || scheduledAt || new Date().toISOString(),
            })
            .select()
            .single()

          if (pubError) {
            errors.push(`Ошибка создания задачи для ${platform} (${language})`)
            continue
          }

          publishTasks.push(publication)

          // Если времени нет — публикуем сразу; иначе оставляем задачу планировщику
          const shouldPublishNow = !(scheduleMap && scheduleMap[platform]) && !scheduledAt
          if (shouldPublishNow) {
            config.publisher(content, language)
              .then(async (result) => {
                await supabaseAdmin
                  .from("publications")
                  .update({
                    status: "published",
                    url: result?.url || '',
                    published_at: new Date().toISOString(),
                  })
                  .eq("id", publication.id)
              })
              .catch(async (error) => {
                await supabaseAdmin
                  .from("publications")
                  .update({
                    status: "failed",
                    error: error.message,
                  })
                  .eq("id", publication.id)
              })
          }
        } catch (error: Error | unknown) {
          errors.push(`${platform}: ${(error as Error).message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      publishTasks,
      errors,
      message: errors.length > 0 
        ? `Публикация запланирована с ошибками: ${errors.join(", ")}`
        : "Публикация успешно запланирована",
    })
  } catch (error) {
    logger.error("Ошибка планирования публикации", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка при планировании публикации" },
      { status: 500 }
    )
  }
}

// Получение статуса публикаций
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const contentId = searchParams.get("contentId")

  try {
    let query = supabaseAdmin
      .from("publications")
      .select("*")
      .order("created_at", { ascending: false })

    if (contentId) {
      query = query.eq("content_id", contentId)
    }

    const { data: publications, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      publications: publications || [],
    })
  } catch (error) {
    logger.error("Ошибка загрузки публикаций", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка загрузки публикаций" },
      { status: 500 }
    )
  }
}
