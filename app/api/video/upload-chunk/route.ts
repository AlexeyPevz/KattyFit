import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { storeChunk, getUploadProgress } from "@/lib/upload-chunks"
import crypto from "crypto"
import logger from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const uploadId = formData.get("uploadId") as string
    const chunkIndex = parseInt(formData.get("chunkIndex") as string)
    const totalChunks = parseInt(formData.get("totalChunks") as string)
    const metadata = JSON.parse(formData.get("metadata") as string || "{}")

    if (!file || !uploadId || chunkIndex === undefined || totalChunks === undefined) {
      return NextResponse.json(
        { error: "Отсутствуют обязательные параметры" },
        { status: 400 }
      )
    }

    // Конвертируем File в Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Сохраняем чанк
    storeChunk(uploadId, chunkIndex, buffer, metadata, totalChunks)

    // Проверяем прогресс
    const progress = getUploadProgress(uploadId)

    return NextResponse.json({
      success: true,
      chunkIndex,
      progress,
      message: `Чанк ${chunkIndex + 1}/${totalChunks} загружен`
    })

  } catch (error: any) {
    logger.error("Ошибка загрузки чанка", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка загрузки чанка" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get("uploadId")

    if (!uploadId) {
      return NextResponse.json(
        { error: "Не указан uploadId" },
        { status: 400 }
      )
    }

    const progress = getUploadProgress(uploadId)

    return NextResponse.json({
      uploadId,
      progress,
      status: progress === 100 ? "completed" : "uploading"
    })

  } catch (error: any) {
    logger.error("Ошибка получения прогресса", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка получения прогресса" },
      { status: 500 }
    )
  }
}
