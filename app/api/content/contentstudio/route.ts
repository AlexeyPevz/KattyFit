import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { env } from "@/lib/env"

// Получение API ключа ContentStudio только из env (v0)
async function getContentStudioKey(): Promise<string | null> {
  return env.contentStudioApiKey
}

// Генерация обложек через ContentStudio AI
async function generateThumbnails(apiKey: string, params: any) {
  const { SmartAPI } = await import("@/lib/smart-proxy")
  
  const response = await SmartAPI.contentstudioRequest("/ai/thumbnails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      video_url: params.videoUrl,
      title: params.title,
      subtitle: params.subtitle,
      formats: params.formats || ["16:9", "9:16"],
      languages: params.languages || ["ru"],
      style: params.style || "modern",
      brand_colors: params.brandColors || ["#8b5cf6", "#ec4899"],
    }),
  })

  if (!response.ok) {
    throw new Error("Ошибка генерации обложек")
  }

  return response.json()
}

// Публикация через ContentStudio
async function publishContent(apiKey: string, params: any) {
  const { SmartAPI } = await import("@/lib/smart-proxy")
  
  const response = await SmartAPI.contentstudioRequest("/posts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      content: params.content,
      media: params.media,
      accounts: params.accounts,
      scheduled_at: params.scheduledAt,
      is_draft: params.isDraft || false,
    }),
  })

  if (!response.ok) {
    throw new Error("Ошибка публикации")
  }

  return response.json()
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
        // Получение списка подключенных аккаунтов
        const { SmartAPI } = await import("@/lib/smart-proxy")
        const accountsResponse = await SmartAPI.contentstudioRequest("/accounts", {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
          },
        })
        result = await accountsResponse.json()
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
  } catch (error: any) {
    console.error("ContentStudio API error:", error)
    return NextResponse.json(
      { error: error.message || "Ошибка ContentStudio API" },
      { status: 500 }
    )
  }
}
