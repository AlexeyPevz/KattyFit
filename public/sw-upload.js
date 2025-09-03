// Service Worker для фоновой загрузки видео

const CACHE_NAME = 'video-upload-v1'
const UPLOAD_QUEUE = new Map()

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Установлен для фоновой загрузки')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Активирован')
  event.waitUntil(clients.claim())
})

// Обработка сообщений от основного приложения
self.addEventListener('message', async (event) => {
  const { type, uploadId, file, metadata, chunks } = event.data

  switch (type) {
    case 'start-upload':
      // Сохраняем задачу в очередь
      UPLOAD_QUEUE.set(uploadId, {
        file,
        metadata,
        chunks,
        currentChunk: 0,
        retryCount: 0
      })
      
      // Начинаем загрузку
      await processUpload(uploadId)
      break

    case 'pause-upload':
      // Приостанавливаем загрузку
      const task = UPLOAD_QUEUE.get(uploadId)
      if (task) {
        task.paused = true
      }
      break

    case 'resume-upload':
      // Возобновляем загрузку
      const pausedTask = UPLOAD_QUEUE.get(uploadId)
      if (pausedTask) {
        pausedTask.paused = false
        await processUpload(uploadId)
      }
      break
  }
})

// Фоновая синхронизация
self.addEventListener('sync', async (event) => {
  console.log('[SW] Фоновая синхронизация:', event.tag)
  
  if (event.tag.startsWith('upload-')) {
    const uploadId = event.tag.replace('upload-', '')
    event.waitUntil(processUpload(uploadId))
  }
})

// Обработка загрузки
async function processUpload(uploadId) {
  const task = UPLOAD_QUEUE.get(uploadId)
  if (!task || task.paused) return

  try {
    // Загружаем чанки последовательно
    while (task.currentChunk < task.chunks.length) {
      const chunk = task.chunks[task.currentChunk]
      
      if (!chunk.uploaded) {
        await uploadChunk(uploadId, task.currentChunk)
      }
      
      task.currentChunk++
      
      // Обновляем прогресс
      const progress = Math.round((task.currentChunk / task.chunks.length) * 100)
      await notifyProgress(uploadId, progress)
      
      // Проверяем, не приостановлена ли загрузка
      if (task.paused) {
        console.log('[SW] Загрузка приостановлена:', uploadId)
        return
      }
    }

    // Финализируем загрузку
    await finalizeUpload(uploadId, task)
    
    // Удаляем из очереди
    UPLOAD_QUEUE.delete(uploadId)
    
    // Уведомляем об успешном завершении
    await notifyComplete(uploadId)

  } catch (error) {
    console.error('[SW] Ошибка загрузки:', error)
    
    task.retryCount++
    
    if (task.retryCount < 3) {
      // Повторяем через 5 секунд
      setTimeout(() => processUpload(uploadId), 5000)
    } else {
      // Уведомляем об ошибке
      await notifyError(uploadId, error.message)
      UPLOAD_QUEUE.delete(uploadId)
    }
  }
}

// Загрузка одного чанка
async function uploadChunk(uploadId, chunkIndex) {
  const task = UPLOAD_QUEUE.get(uploadId)
  if (!task) throw new Error('Task not found')

  const chunk = task.chunks[chunkIndex]
  const chunkData = task.file.slice(chunk.start, chunk.end)

  const formData = new FormData()
  formData.append('uploadId', uploadId)
  formData.append('chunkIndex', chunkIndex.toString())
  formData.append('totalChunks', task.chunks.length.toString())
  formData.append('chunk', chunkData)

  // Проверяем онлайн статус перед загрузкой
  if (!navigator.onLine) {
    throw new Error('No internet connection')
  }

  // Используем fetch с опцией keepalive для продолжения загрузки при закрытии
  let response
  try {
    response = await fetch('/api/video/upload-chunk', {
      method: 'POST',
      body: formData,
      // Важные опции для фоновой загрузки
      keepalive: true,
      // Добавляем заголовок для идентификации SW запросов
      headers: {
        'X-Upload-Source': 'service-worker'
      },
      // Таймаут для предотвращения вечного ожидания
      signal: AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload timeout')
    }
    throw error
  }

  if (!response.ok) {
    // Специальная обработка для разных статусов
    if (response.status === 507) {
      throw new Error('Server storage full')
    }
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`)
    }
    throw new Error(`Chunk upload failed: ${response.statusText}`)
  }

  const result = await response.json()
  chunk.uploaded = true
  chunk.etag = result.etag

  // Сохраняем состояние в IndexedDB
  await saveChunkState(uploadId, chunkIndex, chunk)
}

// Финализация загрузки
async function finalizeUpload(uploadId, task) {
  const response = await fetch('/api/video/upload-complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Upload-Source': 'service-worker'
    },
    body: JSON.stringify({
      uploadId,
      metadata: {
        ...task.metadata,
        fileName: task.file.name,
        fileType: task.file.type,
        fileSize: task.file.size
      },
      chunks: task.chunks.map(c => ({ 
        index: c.index, 
        etag: c.etag 
      }))
    }),
    keepalive: true
  })

  if (!response.ok) {
    throw new Error('Failed to finalize upload')
  }

  return response.json()
}

// Уведомления
async function notifyProgress(uploadId, progress) {
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage({
      type: 'upload-progress',
      uploadId,
      progress
    })
  })
}

async function notifyComplete(uploadId) {
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage({
      type: 'upload-complete',
      uploadId
    })
  })

  // Показываем системное уведомление
  if (self.registration.showNotification) {
    await self.registration.showNotification('Загрузка завершена', {
      body: 'Видео успешно загружено и готово к использованию',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      vibrate: [200, 100, 200],
      tag: `upload-complete-${uploadId}`,
      requireInteraction: false,
      data: { uploadId }
    })
  }
}

async function notifyError(uploadId, error) {
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage({
      type: 'upload-error',
      uploadId,
      error
    })
  })

  // Показываем уведомление об ошибке
  if (self.registration.showNotification) {
    await self.registration.showNotification('Ошибка загрузки', {
      body: 'Не удалось загрузить видео. Попробуйте позже.',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: `upload-error-${uploadId}`,
      requireInteraction: true,
      actions: [
        { action: 'retry', title: 'Повторить' },
        { action: 'cancel', title: 'Отменить' }
      ],
      data: { uploadId }
    })
  }
}

// Обработка кликов на уведомления
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'retry') {
    const uploadId = event.notification.data.uploadId
    // Перезапускаем загрузку
    event.waitUntil(processUpload(uploadId))
  }
})

// Сохранение состояния в IndexedDB
async function saveChunkState(uploadId, chunkIndex, chunk) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('video-uploads', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['chunks'], 'readwrite')
      const store = transaction.objectStore('chunks')
      
      store.put({
        uploadId,
        index: chunkIndex,
        ...chunk
      })
      
      transaction.oncomplete = resolve
      transaction.onerror = reject
    }
    
    request.onerror = reject
  })
}