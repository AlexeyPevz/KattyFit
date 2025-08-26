import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

interface PublishRequest {
  contentId: string
  platforms: string[]
  languages: string[]
  scheduledAt?: string
}

// Получение API ключей из БД
async function getApiKey(service: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("key_value")
    .eq("service", service)
    .eq("is_active", true)
    .single()
  
  return data?.key_value || null
}

// Публикация в VK
async function publishToVK(content: any, language: string) {
  const vkToken = await getApiKey("vk")
  if (!vkToken) {
    throw new Error("VK API token не настроен")
  }

  // TODO: Реализовать публикацию через VK API
  // Пока возвращаем заглушку
  return {
    success: true,
    url: `https://vk.com/video-123456789_${Date.now()}`,
  }
}

// Публикация в Telegram
async function publishToTelegram(content: any, language: string) {
  const telegramToken = await getApiKey("telegram")
  const telegramChatId = await getApiKey("telegram_chat_id")
  
  if (!telegramToken || !telegramChatId) {
    throw new Error("Telegram не настроен")
  }

  // TODO: Реализовать публикацию через Telegram Bot API
  // Пока возвращаем заглушку
  return {
    success: true,
    url: `https://t.me/channel/${Date.now()}`,
  }
}

// Публикация в YouTube (требует OAuth)
async function publishToYouTube(content: any, language: string) {
  const { data: integration } = await supabase
    .from("integrations")
    .select("config")
    .eq("service", "youtube")
    .eq("is_active", true)
    .single()

  if (!integration?.config?.access_token) {
    throw new Error("YouTube OAuth не настроен")
  }

  // TODO: Реализовать публикацию через YouTube Data API v3
  throw new Error("YouTube публикация требует OAuth авторизации")
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
    publisher: async (content: any) => ({
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
    const { contentId, platforms, languages, scheduledAt }: PublishRequest = await request.json()

    if (!contentId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "Необходимо указать контент и платформы для публикации" },
        { status: 400 }
      )
    }

    // Получаем контент из БД
    const { data: content, error: contentError } = await supabase
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

    const publishTasks: any[] = []
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
          const { data: publication, error: pubError } = await supabase
            .from("publications")
            .insert({
              content_id: contentId,
              platform,
              language,
              status: "pending",
              scheduled_at: scheduledAt || new Date().toISOString(),
            })
            .select()
            .single()

          if (pubError) {
            errors.push(`Ошибка создания задачи для ${platform} (${language})`)
            continue
          }

          publishTasks.push(publication)

          // Запускаем публикацию асинхронно
          config.publisher(content, language)
            .then(async (result) => {
              await supabase
                .from("publications")
                .update({
                  status: "published",
                  url: result.url,
                  published_at: new Date().toISOString(),
                })
                .eq("id", publication.id)
            })
            .catch(async (error) => {
              await supabase
                .from("publications")
                .update({
                  status: "failed",
                  error: error.message,
                })
                .eq("id", publication.id)
            })
        } catch (error: any) {
          errors.push(`${platform}: ${error.message}`)
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
    console.error("Ошибка планирования публикации:", error)
    return NextResponse.json(
      { error: "Ошибка при планировании публикации" },
      { status: 500 }
    )
  }
}

// Получение статуса публикаций
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get("contentId")

  try {
    let query = supabase
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
    console.error("Ошибка загрузки публикаций:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки публикаций" },
      { status: 500 }
    )
  }
}