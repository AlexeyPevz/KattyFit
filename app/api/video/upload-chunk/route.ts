import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import crypto from "crypto"

// Временное хранилище для чанков с ограничением памяти
const MAX_MEMORY_SIZE = 500 * 1024 * 1024 // 500MB макс
let currentMemoryUsage = 0

const chunkStorage = new Map<string, {
  chunks: Map<number, Buffer>
  metadata: any
  totalChunks: number
  uploadedAt: Date
  totalSize: number
}>()

// Очистка старых загрузок и контроль памяти
const cleanupInterval = setInterval(() => {
  const now = new Date()
  let memoryFreed = 0
  
  for (const [uploadId, data] of chunkStorage.entries()) {
    const age = now.getTime() - data.uploadedAt.getTime()
    if (age > 24 * 60 * 60 * 1000 || currentMemoryUsage > MAX_MEMORY_SIZE) {
      memoryFreed += data.totalSize
      chunkStorage.delete(uploadId)
    }
  }
  
  currentMemoryUsage -= memoryFreed
  
  // Логируем использование памяти
  if (currentMemoryUsage > MAX_MEMORY_SIZE * 0.8) {
    console.warn(`High memory usage in chunk storage: ${(currentMemoryUsage / 1024 / 1024).toFixed(2)}MB`)
  }
}, 60 * 60 * 1000) // Каждый час

// Очистка интервала при завершении процесса
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => clearInterval(cleanupInterval))
}

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

    // Валидация uploadId (защита от path traversal)
    if (!/^upload_[\w\d_-]+$/.test(uploadId)) {
      return NextResponse.json(
        { error: "Неверный формат uploadId" },
        { status: 400 }
      )
    }

    // Проверка размера чанка (макс 10MB)
    const MAX_CHUNK_SIZE = 10 * 1024 * 1024
    if (chunk.size > MAX_CHUNK_SIZE) {
      return NextResponse.json(
        { error: "Размер чанка превышает лимит" },
        { status: 413 }
      )
    }

    // Проверка общего количества чанков (макс 1000)
    if (totalChunks > 1000 || totalChunks < 1) {
      return NextResponse.json(
        { error: "Недопустимое количество чанков" },
        { status: 400 }
      )
    }

    // Преобразуем чанк в Buffer
    const buffer = Buffer.from(await chunk.arrayBuffer())
    
    // Вычисляем ETag для чанка
    const etag = crypto.createHash('md5').update(buffer).digest('hex')

    // Проверяем лимит памяти перед сохранением
    if (currentMemoryUsage + buffer.length > MAX_MEMORY_SIZE) {
      return NextResponse.json(
        { error: "Превышен лимит памяти сервера. Попробуйте позже." },
        { status: 507 } // Insufficient Storage
      )
    }

    // Сохраняем чанк
    if (!chunkStorage.has(uploadId)) {
      chunkStorage.set(uploadId, {
        chunks: new Map(),
        metadata: null,
        totalChunks,
        uploadedAt: new Date(),
        totalSize: 0
      })
    }

    const uploadData = chunkStorage.get(uploadId)!
    
    // Обновляем размер с учетом замены существующего чанка
    const existingChunk = uploadData.chunks.get(chunkIndex)
    if (existingChunk) {
      // Заменяем существующий чанк - обновляем разницу в размере
      const sizeDiff = buffer.length - existingChunk.length
      uploadData.totalSize += sizeDiff
      currentMemoryUsage += sizeDiff
    } else {
      // Новый чанк
      uploadData.totalSize += buffer.length
      currentMemoryUsage += buffer.length
    }
    
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
        uploaded_at: new Date().toISOString() // Всегда UTC
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
  const uploadData = chunkStorage.get(uploadId)
  if (uploadData) {
    // Освобождаем память
    currentMemoryUsage -= uploadData.totalSize
    chunkStorage.delete(uploadId)
    
    // Логируем освобождение памяти
    console.log(`Freed ${(uploadData.totalSize / 1024 / 1024).toFixed(2)}MB from upload ${uploadId}`)
  }
}
