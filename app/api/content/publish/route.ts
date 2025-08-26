import { NextRequest, NextResponse } from "next/server"

interface PublishRequest {
  contentId: string
  platforms: string[]
  languages: string[]
  scheduledAt?: string
}

// Конфигурация платформ
const PLATFORM_CONFIG = {
  vk: {
    name: "VKontakte",
    requiresAuth: true,
    supportsVideo: true,
    maxVideoSize: 5 * 1024 * 1024 * 1024, // 5GB
    supportedFormats: ["mp4", "avi", "mov"],
  },
  telegram: {
    name: "Telegram",
    requiresAuth: true,
    supportsVideo: true,
    maxVideoSize: 2 * 1024 * 1024 * 1024, // 2GB
    supportedFormats: ["mp4"],
  },
  rutube: {
    name: "RuTube",
    requiresAuth: true,
    supportsVideo: true,
    maxVideoSize: 10 * 1024 * 1024 * 1024, // 10GB
    supportedFormats: ["mp4", "avi", "mov", "mkv"],
  },
  youtube: {
    name: "YouTube",
    requiresAuth: true,
    requiresOAuth: true,
    supportsVideo: true,
    maxVideoSize: 128 * 1024 * 1024 * 1024, // 128GB
    supportedFormats: ["mp4", "avi", "mov", "wmv", "flv", "3gpp", "webm"],
  },
  instagram: {
    name: "Instagram",
    requiresAuth: true,
    supportsVideo: true,
    maxVideoSize: 100 * 1024 * 1024, // 100MB для постов, 650MB для IGTV
    maxDuration: 60, // секунды для постов
    supportedFormats: ["mp4", "mov"],
  },
  tiktok: {
    name: "TikTok",
    requiresAuth: true,
    requiresBusinessAccount: true,
    supportsVideo: true,
    maxVideoSize: 287 * 1024 * 1024, // 287MB
    maxDuration: 180, // 3 минуты
    supportedFormats: ["mp4", "mov"],
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

    // Проверяем доступность платформ
    const unavailablePlatforms: string[] = []
    const publishTasks: any[] = []

    for (const platform of platforms) {
      const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
      
      if (!config) {
        unavailablePlatforms.push(platform)
        continue
      }

      // Проверяем наличие необходимых учетных данных
      if (config.requiresOAuth) {
        // TODO: Проверить наличие OAuth токенов
        const hasOAuth = false // Заглушка
        if (!hasOAuth) {
          unavailablePlatforms.push(`${platform} (требуется OAuth авторизация)`)
          continue
        }
      }

      if (config.requiresBusinessAccount) {
        // TODO: Проверить наличие бизнес-аккаунта
        const hasBusinessAccount = false // Заглушка
        if (!hasBusinessAccount) {
          unavailablePlatforms.push(`${platform} (требуется бизнес-аккаунт)`)
          continue
        }
      }

      // Создаем задачу публикации для каждой платформы и языка
      for (const language of languages) {
        publishTasks.push({
          id: `${Date.now()}-${platform}-${language}`,
          contentId,
          platform,
          language,
          status: "pending",
          scheduledAt: scheduledAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        })
      }
    }

    // В реальном приложении здесь будет добавление задач в очередь публикации
    // Сейчас просто возвращаем результат
    
    return NextResponse.json({
      success: true,
      publishTasks,
      unavailablePlatforms,
      message: unavailablePlatforms.length > 0 
        ? `Публикация запланирована. Недоступные платформы: ${unavailablePlatforms.join(", ")}`
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

  // В реальном приложении здесь будет запрос к БД
  // Сейчас возвращаем моковые данные
  const mockPublications = [
    {
      id: "1",
      contentId: "1",
      platform: "rutube",
      language: "ru",
      status: "published",
      url: "https://rutube.ru/video/example",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "2",
      contentId: "1",
      platform: "vk",
      language: "ru",
      status: "processing",
      scheduledAt: new Date().toISOString(),
    },
  ]

  const publications = contentId 
    ? mockPublications.filter(p => p.contentId === contentId)
    : mockPublications

  return NextResponse.json({
    success: true,
    publications,
  })
}