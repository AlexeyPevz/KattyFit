// Клиентская библиотека для фоновой загрузки видео

interface UploadTask {
  id: string
  file: File
  metadata: {
    title: string
    description: string
    courseId?: string
    lessonId?: string
  }
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  chunks: ChunkInfo[]
  createdAt: Date
  retryCount: number
}

interface ChunkInfo {
  index: number
  start: number
  end: number
  uploaded: boolean
  etag?: string
}

export class BackgroundUploadManager {
  private static instance: BackgroundUploadManager
  private tasks: Map<string, UploadTask> = new Map()
  private worker: ServiceWorker | null = null
  private db: IDBDatabase | null = null
  
  // Настройки
  private readonly CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks
  private readonly MAX_RETRIES = 3
  private readonly DB_NAME = 'video-uploads'
  private readonly DB_VERSION = 1

  private constructor() {
    this.initializeDB()
    this.registerServiceWorker()
  }

  static getInstance(): BackgroundUploadManager {
    if (!BackgroundUploadManager.instance) {
      BackgroundUploadManager.instance = new BackgroundUploadManager()
    }
    return BackgroundUploadManager.instance
  }

  // Инициализация IndexedDB для хранения задач
  private async initializeDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.loadPendingTasks()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('uploads')) {
          const store = db.createObjectStore('uploads', { keyPath: 'id' })
          store.createIndex('status', 'status', { unique: false })
        }

        if (!db.objectStoreNames.contains('chunks')) {
          const store = db.createObjectStore('chunks', { keyPath: ['uploadId', 'index'] })
          store.createIndex('uploadId', 'uploadId', { unique: false })
        }
      }
    })
  }

  // Регистрация Service Worker
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-upload.js')
        this.worker = registration.active || registration.installing || registration.waiting
        
        // Слушаем сообщения от Service Worker
        navigator.serviceWorker.addEventListener('message', this.handleWorkerMessage.bind(this))
        
        console.log('Service Worker зарегистрирован для фоновой загрузки')
      } catch (error) {
        console.error('Ошибка регистрации Service Worker:', error)
      }
    }
  }

  // Обработка сообщений от Service Worker
  private handleWorkerMessage(event: MessageEvent) {
    const { type, uploadId, progress, error } = event.data

    switch (type) {
      case 'upload-progress':
        this.updateProgress(uploadId, progress)
        break
      case 'upload-complete':
        this.markComplete(uploadId)
        break
      case 'upload-error':
        this.handleError(uploadId, error)
        break
      case 'chunk-uploaded':
        this.markChunkUploaded(uploadId, event.data.chunkIndex)
        break
    }
  }

  // Создание новой задачи загрузки
  async createUploadTask(file: File, metadata: any): Promise<string> {
    const uploadId = this.generateUploadId()
    
    // Разбиваем файл на чанки
    const chunks = this.createChunks(file)
    
    const task: UploadTask = {
      id: uploadId,
      file,
      metadata,
      progress: 0,
      status: 'pending',
      chunks,
      createdAt: new Date(),
      retryCount: 0
    }

    // Сохраняем в память и БД
    this.tasks.set(uploadId, task)
    await this.saveTaskToDB(task)

    // Начинаем загрузку
    this.startUpload(uploadId)

    return uploadId
  }

  // Разбивка файла на чанки
  private createChunks(file: File): ChunkInfo[] {
    const chunks: ChunkInfo[] = []
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.CHUNK_SIZE
      const end = Math.min(start + this.CHUNK_SIZE, file.size)
      
      chunks.push({
        index: i,
        start,
        end,
        uploaded: false
      })
    }

    return chunks
  }

  // Начало загрузки
  private async startUpload(uploadId: string) {
    const task = this.tasks.get(uploadId)
    if (!task) return

    // Обновляем статус
    task.status = 'uploading'
    await this.saveTaskToDB(task)

    // Если есть Service Worker, используем его
    if (this.worker && 'BackgroundSync' in window) {
      // Регистрируем фоновую синхронизацию
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(`upload-${uploadId}`)
      
      // Отправляем данные в Service Worker
      this.worker.postMessage({
        type: 'start-upload',
        uploadId,
        file: task.file,
        metadata: task.metadata,
        chunks: task.chunks
      })
    } else {
      // Fallback: загружаем в основном потоке
      this.uploadInForeground(uploadId)
    }
  }

  // Загрузка в основном потоке (fallback)
  private async uploadInForeground(uploadId: string) {
    const task = this.tasks.get(uploadId)
    if (!task) return

    for (const chunk of task.chunks) {
      if (chunk.uploaded) continue

      try {
        await this.uploadChunk(uploadId, chunk.index)
        
        // Проверяем, не закрыли ли страницу
        if (!navigator.onLine) {
          // Сохраняем состояние и ждем восстановления соединения
          break
        }
      } catch (error) {
        console.error(`Ошибка загрузки чанка ${chunk.index}:`, error)
        
        if (task.retryCount < this.MAX_RETRIES) {
          task.retryCount++
          setTimeout(() => this.uploadInForeground(uploadId), 5000)
          return
        }
      }
    }

    // Проверяем, все ли чанки загружены
    if (task.chunks.every(c => c.uploaded)) {
      await this.finalizeUpload(uploadId)
    }
  }

  // Загрузка одного чанка
  private async uploadChunk(uploadId: string, chunkIndex: number): Promise<void> {
    const task = this.tasks.get(uploadId)
    if (!task) throw new Error('Task not found')

    const chunk = task.chunks[chunkIndex]
    const chunkData = task.file.slice(chunk.start, chunk.end)

    const formData = new FormData()
    formData.append('uploadId', uploadId)
    formData.append('chunkIndex', chunkIndex.toString())
    formData.append('totalChunks', task.chunks.length.toString())
    formData.append('chunk', chunkData)

    const response = await fetch('/api/video/upload-chunk', {
      method: 'POST',
      body: formData,
      // Важно: не отменяем запрос при закрытии страницы
      keepalive: true
    })

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    chunk.uploaded = true
    chunk.etag = result.etag

    // Обновляем прогресс
    this.updateProgress(uploadId, this.calculateProgress(task))
    
    // Сохраняем состояние чанка
    await this.saveChunkState(uploadId, chunk)
  }

  // Финализация загрузки
  private async finalizeUpload(uploadId: string): Promise<void> {
    const task = this.tasks.get(uploadId)
    if (!task) return

    const response = await fetch('/api/video/upload-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uploadId,
        metadata: task.metadata,
        chunks: task.chunks.map(c => ({ index: c.index, etag: c.etag }))
      })
    })

    if (response.ok) {
      this.markComplete(uploadId)
    } else {
      throw new Error('Failed to finalize upload')
    }
  }

  // Вспомогательные методы
  private calculateProgress(task: UploadTask): number {
    const uploadedChunks = task.chunks.filter(c => c.uploaded).length
    return Math.round((uploadedChunks / task.chunks.length) * 100)
  }

  private updateProgress(uploadId: string, progress: number) {
    const task = this.tasks.get(uploadId)
    if (task) {
      task.progress = progress
      this.notifyProgress(uploadId, progress)
    }
  }

  private async markComplete(uploadId: string) {
    const task = this.tasks.get(uploadId)
    if (task) {
      task.status = 'completed'
      task.progress = 100
      await this.saveTaskToDB(task)
      this.notifyComplete(uploadId)
    }
  }

  private async handleError(uploadId: string, error: any) {
    const task = this.tasks.get(uploadId)
    if (task) {
      task.status = 'failed'
      await this.saveTaskToDB(task)
      this.notifyError(uploadId, error)
    }
  }

  // События для UI
  private notifyProgress(uploadId: string, progress: number) {
    window.dispatchEvent(new CustomEvent('upload-progress', {
      detail: { uploadId, progress }
    }))
  }

  private notifyComplete(uploadId: string) {
    window.dispatchEvent(new CustomEvent('upload-complete', {
      detail: { uploadId }
    }))
    
    // Показываем уведомление
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Загрузка завершена', {
        body: 'Видео успешно загружено',
        icon: '/icon-192.png'
      })
    }
  }

  private notifyError(uploadId: string, error: any) {
    window.dispatchEvent(new CustomEvent('upload-error', {
      detail: { uploadId, error }
    }))
  }

  // Сохранение в БД
  private async saveTaskToDB(task: UploadTask) {
    if (!this.db) return

    const transaction = this.db.transaction(['uploads'], 'readwrite')
    const store = transaction.objectStore('uploads')
    
    // Сохраняем без файла (файл храним отдельно)
    const taskData = {
      ...task,
      file: {
        name: task.file.name,
        size: task.file.size,
        type: task.file.type
      }
    }
    
    store.put(taskData)
  }

  private async saveChunkState(uploadId: string, chunk: ChunkInfo) {
    if (!this.db) return

    const transaction = this.db.transaction(['chunks'], 'readwrite')
    const store = transaction.objectStore('chunks')
    
    store.put({
      uploadId,
      ...chunk
    })
  }

  // Загрузка незавершенных задач при старте
  private async loadPendingTasks() {
    if (!this.db) return

    const transaction = this.db.transaction(['uploads'], 'readonly')
    const store = transaction.objectStore('uploads')
    const index = store.index('status')
    
    const request = index.openCursor(IDBKeyRange.only('uploading'))
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        const task = cursor.value
        // Восстанавливаем загрузку
        console.log('Восстанавливаем загрузку:', task.id)
        this.resumeUpload(task.id)
        cursor.continue()
      }
    }
  }

  // Возобновление загрузки
  async resumeUpload(uploadId: string) {
    // Загружаем данные задачи из БД
    // Проверяем какие чанки уже загружены
    // Продолжаем с последнего незагруженного
    this.startUpload(uploadId)
  }

  // Остановка загрузки
  async pauseUpload(uploadId: string) {
    const task = this.tasks.get(uploadId)
    if (task && task.status === 'uploading') {
      task.status = 'pending'
      await this.saveTaskToDB(task)
    }
  }

  // Получение статуса
  getUploadStatus(uploadId: string): UploadTask | undefined {
    return this.tasks.get(uploadId)
  }

  getAllUploads(): UploadTask[] {
    return Array.from(this.tasks.values())
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}

// Экспорт синглтона
export const uploadManager = BackgroundUploadManager.getInstance()