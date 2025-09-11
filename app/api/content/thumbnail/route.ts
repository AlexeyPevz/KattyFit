import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"

export const POST = apiHandler(async (request: NextRequest) => {
  const { contentId, prompt, style } = await request.json()

  if (!contentId || !prompt) {
    return NextResponse.json(
      { error: "Необходимы contentId и prompt" },
      { status: 400 }
    )
  }

  try {
    // В реальном приложении здесь был бы вызов AI сервиса для генерации изображений
    // Например, DALL-E, Midjourney API, или Stable Diffusion
    
    // Для демо возвращаем случайные изображения
    const thumbnails = [
      `https://picsum.photos/400/225?random=${Date.now()}&style=${style}`,
      `https://picsum.photos/400/225?random=${Date.now() + 1}&style=${style}`,
      `https://picsum.photos/400/225?random=${Date.now() + 2}&style=${style}`,
      `https://picsum.photos/400/225?random=${Date.now() + 3}&style=${style}`,
    ]

    return NextResponse.json({
      success: true,
      thumbnails,
      prompt,
      style,
    })
  } catch (error) {
    console.error("Ошибка генерации обложек:", error)
    return NextResponse.json(
      { error: "Ошибка генерации обложек" },
      { status: 500 }
    )
  }
})

export const PUT = apiHandler(async (request: NextRequest) => {
  const { contentId, thumbnailUrl } = await request.json()

  if (!contentId || !thumbnailUrl) {
    return NextResponse.json(
      { error: "Необходимы contentId и thumbnailUrl" },
      { status: 400 }
    )
  }

  try {
    // Обновляем запись контента с новой обложкой
    const { error } = await supabaseAdmin
      .from("content")
      .update({ thumbnail: thumbnailUrl })
      .eq("id", contentId)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Обложка сохранена",
    })
  } catch (error) {
    console.error("Ошибка сохранения обложки:", error)
    return NextResponse.json(
      { error: "Ошибка сохранения обложки" },
      { status: 500 }
    )
  }
})
