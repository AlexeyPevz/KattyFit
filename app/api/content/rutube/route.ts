import { NextRequest, NextResponse } from "next/server"

// Временное хранилище (используйте БД в реальном приложении)
const contentStore: any[] = []

// Функция для извлечения ID видео из ссылки RuTube
function extractRutubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const videoIndex = pathParts.indexOf("video")
    if (videoIndex !== -1 && pathParts[videoIndex + 1]) {
      return pathParts[videoIndex + 1]
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, title, description, type, enableTranslation, targetLanguages } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL не указан" },
        { status: 400 }
      )
    }

    const videoId = extractRutubeVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: "Неверный формат ссылки RuTube" },
        { status: 400 }
      )
    }

    // В реальном приложении здесь будет вызов API RuTube для получения метаданных
    // Сейчас используем моковые данные
    const mockMetadata = {
      title: title || "Видео с RuTube",
      description: description || "",
      duration: Math.floor(Math.random() * 3600) + 60, // Случайная длительность от 1 до 61 минуты
      thumbnail: `/images/trainer-studio.jpg`, // В реальности будет URL превью с RuTube
      embedUrl: `https://rutube.ru/play/embed/${videoId}`,
    }

    // Создаем запись о контенте
    const content = {
      id: Date.now().toString(),
      title: mockMetadata.title,
      description: mockMetadata.description,
      type: type || (mockMetadata.duration > 180 ? "lesson" : "short"),
      platform: "rutube",
      videoId,
      url,
      embedUrl: mockMetadata.embedUrl,
      duration: mockMetadata.duration,
      status: "processing",
      languages: ["ru"],
      targetLanguages: enableTranslation ? targetLanguages : [],
      platforms: ["rutube"],
      views: 0,
      thumbnail: mockMetadata.thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    contentStore.push(content)

    // Имитируем обработку
    setTimeout(() => {
      const contentIndex = contentStore.findIndex(c => c.id === content.id)
      if (contentIndex !== -1) {
        contentStore[contentIndex].status = "draft"
      }
    }, 2000)

    return NextResponse.json({
      success: true,
      content: content,
      metadata: mockMetadata,
    })
  } catch (error) {
    console.error("Ошибка обработки RuTube URL:", error)
    return NextResponse.json(
      { error: "Ошибка при обработке ссылки" },
      { status: 500 }
    )
  }
}