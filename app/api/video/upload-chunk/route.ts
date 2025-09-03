import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import crypto from "crypto"

// Временное хранилище для чанков (в продакшене использовать Redis/БД)
const chunkStorage = new Map<string, {
  chunks: Map<number, Buffer>
  metadata: any
  totalChunks: number
  uploadedAt: Date
}>()

// Очистка старых загрузок (запускать периодически)
setInterval(() => {
  const now = new Date()
  for (const [uploadId, data] of chunkStorage.entries()) {
    const age = now.getTime() - data.uploadedAt.getTime()
    if (age > 24 * 60 * 60 * 1000) { // 24 часа
      chunkStorage.delete(uploadId)
    }
  }
}, 60 * 60 * 1000) // Каждый час

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const uploadId = formData.get("uploadId") as string
    const chunkIndex = parseInt(formData.get("chunkIndex") as string)
    const totalChunks = parseInt(formData.get("totalChunks") as string)
    const chunk = formData.get("chunk") as File

    if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !chunk) {
      return NextResponse.json(
        { error: "Недостаточно данных" },
        { status: 400 }
      )
    }

    // Преобразуем чанк в Buffer
    const buffer = Buffer.from(await chunk.arrayBuffer())
    
    // Вычисляем ETag для чанка
    const etag = crypto.createHash('md5').update(buffer).digest('hex')

    // Сохраняем чанк
    if (!chunkStorage.has(uploadId)) {
      chunkStorage.set(uploadId, {
        chunks: new Map(),
        metadata: null,
        totalChunks,
        uploadedAt: new Date()
      })
    }

    const uploadData = chunkStorage.get(uploadId)!
    uploadData.chunks.set(chunkIndex, buffer)

    // Проверяем, все ли чанки загружены
    const isComplete = uploadData.chunks.size === totalChunks

    // Сохраняем информацию о чанке в БД для восстановления
    await saveChunkInfo(uploadId, chunkIndex, etag, chunk.size)

    return NextResponse.json({
      success: true,
      uploadId,
      chunkIndex,
      etag,
      isComplete,
      uploadedChunks: uploadData.chunks.size,
      totalChunks
    })

  } catch (error) {
    console.error("Ошибка загрузки чанка:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки чанка" },
      { status: 500 }
    )
  }
}

// Сохранение информации о чанке в БД
async function saveChunkInfo(
  uploadId: string, 
  chunkIndex: number, 
  etag: string, 
  size: number
) {
  try {
    // Сохраняем в таблицу upload_chunks для возможности восстановления
    const { error } = await supabaseAdmin
      .from("upload_chunks")
      .upsert({
        upload_id: uploadId,
        chunk_index: chunkIndex,
        etag,
        size,
        uploaded_at: new Date().toISOString()
      }, {
        onConflict: "upload_id,chunk_index"
      })

    if (error) {
      console.error("Ошибка сохранения информации о чанке:", error)
    }
  } catch (error) {
    console.error("Ошибка БД при сохранении чанка:", error)
  }
}

// GET запрос для проверки статуса загрузки
export async function GET(request: NextRequest) {
  try {
    const uploadId = request.nextUrl.searchParams.get("uploadId")
    
    if (!uploadId) {
      return NextResponse.json(
        { error: "Upload ID не указан" },
        { status: 400 }
      )
    }

    // Проверяем в памяти
    const memoryData = chunkStorage.get(uploadId)
    
    // Проверяем в БД
    const { data: dbChunks, error } = await supabaseAdmin
      .from("upload_chunks")
      .select("chunk_index, etag, size")
      .eq("upload_id", uploadId)
      .order("chunk_index")

    if (error) {
      throw error
    }

    return NextResponse.json({
      uploadId,
      uploadedChunks: memoryData?.chunks.size || dbChunks?.length || 0,
      totalChunks: memoryData?.totalChunks || 0,
      chunks: dbChunks || [],
      inMemory: !!memoryData
    })

  } catch (error) {
    console.error("Ошибка получения статуса:", error)
    return NextResponse.json(
      { error: "Ошибка получения статуса" },
      { status: 500 }
    )
  }
}

// Экспорт для использования в upload-complete
export function getUploadedChunks(uploadId: string): Buffer[] | null {
  const uploadData = chunkStorage.get(uploadId)
  if (!uploadData || uploadData.chunks.size !== uploadData.totalChunks) {
    return null
  }

  // Собираем чанки в правильном порядке
  const chunks: Buffer[] = []
  for (let i = 0; i < uploadData.totalChunks; i++) {
    const chunk = uploadData.chunks.get(i)
    if (!chunk) return null
    chunks.push(chunk)
  }

  return chunks
}

// Очистка после завершения
export function cleanupUpload(uploadId: string) {
  chunkStorage.delete(uploadId)
}