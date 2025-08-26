import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

// Временное хранилище для контента (в реальном приложении используйте БД)
const contentStore: any[] = []

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const enableTranslation = formData.get("enableTranslation") === "true"
    const targetLanguages = JSON.parse(formData.get("targetLanguages") as string || "[]")

    if (!file) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 400 }
      )
    }

    // В реальном приложении загружайте файлы в облачное хранилище
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Создаем уникальное имя файла
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = `${uniqueSuffix}-${file.name}`
    const filepath = path.join(process.cwd(), "public", "uploads", filename)

    // Сохраняем файл (в реальном приложении используйте S3 или подобное)
    // await writeFile(filepath, buffer)

    // Создаем запись о контенте
    const content = {
      id: Date.now().toString(),
      title,
      description,
      type,
      filename,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      status: "processing",
      languages: ["ru"],
      targetLanguages: enableTranslation ? targetLanguages : [],
      platforms: [],
      views: 0,
      thumbnail: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    contentStore.push(content)

    // Запускаем обработку (в реальном приложении это будет в фоновой задаче)
    setTimeout(() => {
      const contentIndex = contentStore.findIndex(c => c.id === content.id)
      if (contentIndex !== -1) {
        contentStore[contentIndex].status = "draft"
      }
    }, 3000)

    return NextResponse.json({
      success: true,
      content: content,
    })
  } catch (error) {
    console.error("Ошибка загрузки:", error)
    return NextResponse.json(
      { error: "Ошибка при загрузке файла" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    content: contentStore,
  })
}