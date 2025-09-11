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
}, 5 * 60 * 1000) // Каждые 5 минут

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

export function cleanupUpload(uploadId: string): void {
  const uploadData = chunkStorage.get(uploadId)
  if (uploadData) {
    currentMemoryUsage -= uploadData.totalSize
    chunkStorage.delete(uploadId)
  }
}

export function storeChunk(uploadId: string, chunkIndex: number, chunk: Buffer, metadata: any, totalChunks: number): void {
  let uploadData = chunkStorage.get(uploadId)
  
  if (!uploadData) {
    uploadData = {
      chunks: new Map(),
      metadata,
      totalChunks,
      uploadedAt: new Date(),
      totalSize: 0
    }
    chunkStorage.set(uploadId, uploadData)
  }
  
  uploadData.chunks.set(chunkIndex, chunk)
  uploadData.totalSize += chunk.length
  currentMemoryUsage += chunk.length
}

export function getUploadProgress(uploadId: string): number {
  const uploadData = chunkStorage.get(uploadId)
  if (!uploadData) return 0
  
  return (uploadData.chunks.size / uploadData.totalChunks) * 100
}