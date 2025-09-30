import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { env } from "@/lib/env"
import logger from "@/lib/logger"

// Получение API ключа ContentStudio только из env (v0)
async function getContentStudioKey(): Promise<string | null> {
  return process.env.CONTENTSTUDIO_API_KEY || null
}

// Генерация обложек через ContentStudio AI
async function generateThumbnails(apiKey: string, params: Record<string, unknown>) {
  // ContentStudio API v2 для генерации обложек
  // Используем их AI Image Generator endpoint
  
  const response = await fetch("https://api.contentstudio.io/v2/images/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `${params.title} - ${params.subtitle}`,
      style: params.style || "modern",
      aspect_ratio: (Array.isArray(params.formats) && params.formats.includes("16:9")) ? "16:9" : "1:1",
      brand_colors: params.brandColors || ["#8b5cf6", "#ec4899"],
      num_images: 4, // Генерируем 4 варианта
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error("ContentStudio thumbnail generation failed", { error })
    
    // Fallback: используем Unsplash или placeholder
    const fallbackUrl = `https://via.placeholder.com/1280x720/8b5cf6/ffffff?text=${encodeURIComponent(params.title as string)}`
    
    return {
      thumbnails: {
        ru: fallbackUrl,
        en: fallbackUrl,
      }
    }
  }

  const data = await response.json()
  
  // Возвращаем сгенерированные обложки
  return {
    thumbnails: data.images?.reduce((acc: Record<string, string>, img: { url: string }, idx: number) => {
      const langs = params.languages as string[] || ["ru"]
      if (langs[idx]) {
        acc[langs[idx]] = img.url
      }
      return acc
    }, {}) || {}
  }
}

// Публикация через ContentStudio
async function publishContent(apiKey: string, params: Record<string, unknown>) {
  // ContentStudio API v2 для публикации контента
  // Документация: https://developers.contentstudio.io/docs/post-to-social-channels
  
  const response = await fetch("https://api.contentstudio.io/v2/posts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: params.content,
      media_urls: Array.isArray(params.media) ? params.media : [params.media],
      social_accounts: params.accounts, // Array of account IDs
      schedule_time: params.scheduledAt,
      status: params.isDraft ? "draft" : "scheduled",
      variations: params.variations || [], // Для разных языков
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error("ContentStudio publish failed", { error })
    throw new Error(`Ошибка публикации: ${error}`)
  }

  const data = await response.json()
  
  return {
    publications: data.posts?.map((post: { 
      id: string
      social_account: { platform: string }
      status: string
      url?: string
      language?: string 
    }) => ({
      id: post.id,
      platform: post.social_account?.platform || "unknown",
      status: post.status,
      url: post.url,
      scheduled_at: params.scheduledAt,
      language: post.language || (params.language as string) || "ru"
    })) || []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json()

    const apiKey = await getContentStudioKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: "ContentStudio API ключ не настроен" },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case "generateThumbnails":
        result = await generateThumbnails(apiKey, params)
        
        // Сохраняем обложки в БД
        if (params.contentId && result.thumbnails) {
          for (const [lang, url] of Object.entries(result.thumbnails)) {
            await supabaseAdmin
              .from("thumbnails")
              .upsert({
                content_id: params.contentId,
                language: lang,
                url: url as string,
                type: "ai_generated",
              }, {
                onConflict: "content_id,language"
              })
          }
        }
        break

      case "publish":
        // Получаем информацию о контенте
        const { data: content } = await supabaseAdmin
          .from("content")
          .select("*")
          .eq("id", params.contentId)
          .single()

        if (!content) {
          throw new Error("Контент не найден")
        }

        // Подготавливаем данные для публикации
        const publishParams = {
          content: params.description || content.description,
          media: params.media || [content.thumbnail],
          accounts: params.platforms,
          scheduledAt: params.scheduledAt,
        }

        result = await publishContent(apiKey, publishParams)

        // Сохраняем результаты публикации
        for (const publication of result.publications || []) {
          await supabaseAdmin
            .from("publications")
            .insert({
              content_id: params.contentId,
              platform: publication.platform,
              language: publication.language || "ru",
              status: publication.status,
              url: publication.url,
              scheduled_at: publication.scheduled_at,
              external_id: publication.id,
            })
        }
        break

      case "getAccounts":
        // Получение списка подключенных аккаунтов через ContentStudio API v2
        const accountsResponse = await fetch("https://api.contentstudio.io/v2/social-accounts", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        })
        
        if (!accountsResponse.ok) {
          const error = await accountsResponse.text()
          logger.error("Failed to get ContentStudio accounts", { error })
          result = { accounts: [] }
        } else {
          const accountsData = await accountsResponse.json()
          result = {
            accounts: accountsData.social_accounts?.map((acc: { 
              id: string
              platform: string
              username: string
              is_active: boolean
            }) => ({
              id: acc.id,
              platform: acc.platform,
              username: acc.username,
              isActive: acc.is_active,
            })) || []
          }
        }
        break

      default:
        return NextResponse.json(
          { error: "Неизвестное действие" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: Error | unknown) {
    logger.error("ContentStudio API error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: (error as Error).message || "Ошибка ContentStudio API" },
      { status: 500 }
    )
  }
}
