// Сервис для умной загрузки видео с учетом доступности API

import logger from './logger'

interface VideoUploadConfig {
  useProxy: boolean
  proxyUrl?: string
  platforms: ('youtube' | 'vk' | 'rutube')[]
  fallbackToVK: boolean
}

interface UploadResult {
  platform: string
  success: boolean
  videoId?: string
  url?: string
  embedUrl?: string
  error?: string
}

export class VideoUploadService {
  private config: VideoUploadConfig

  constructor(config: VideoUploadConfig) {
    this.config = config
  }

  async uploadVideo(
    file: File,
    metadata: {
      title: string
      description: string
      tags?: string[]
      isPrivate?: boolean
    }
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    // Определяем доступные платформы
    const availablePlatforms = await this.checkPlatformAvailability()

    // Загружаем на доступные платформы
    for (const platform of this.config.platforms) {
      if (!availablePlatforms[platform]) {
        logger.info(`Пропускаем ${platform} - недоступна`)
        continue
      }

      try {
        const result = await this.uploadToPlatform(platform, file, metadata)
        results.push(result)
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Если ничего не загрузилось и включен fallback на VK
    if (results.every(r => !r.success) && this.config.fallbackToVK) {
      try {
        const vkResult = await this.uploadToPlatform('vk', file, metadata)
        results.push(vkResult)
      } catch (error) {
        logger.error('Fallback to VK failed', { error: error instanceof Error ? error.message : String(error) })
      }
    }

    return results
  }

  private async checkPlatformAvailability(): Promise<Record<string, boolean>> {
    const availability: Record<string, boolean> = {
      vk: true, // VK всегда доступен из России
      rutube: true, // RuTube тоже
      youtube: false // YouTube по умолчанию недоступен
    }

    // Проверяем YouTube через прокси если настроен
    if (this.config.useProxy && this.config.proxyUrl) {
      try {
        const response = await fetch(`${this.config.proxyUrl}/health/youtube`)
        availability.youtube = response.ok
      } catch {
        availability.youtube = false
      }
    }

    return availability
  }

  private async uploadToPlatform(
    platform: string,
    file: File,
    metadata: Record<string, unknown>
  ): Promise<UploadResult> {
    switch (platform) {
      case 'vk':
        return this.uploadToVK(file, metadata)
      case 'youtube':
        return this.uploadToYouTube(file, metadata)
      case 'rutube':
        return this.uploadToRuTube(file, metadata)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private async uploadToVK(file: File, metadata: Record<string, unknown>): Promise<UploadResult> {
    // Реализация загрузки на VK
    // Используем прямой API без прокси
    const vkToken = process.env.VK_API_TOKEN
    const vkGroupId = process.env.VK_GROUP_ID

    if (!vkToken || !vkGroupId) {
      throw new Error('VK credentials not configured')
    }

    // ... код загрузки на VK ...

    return {
      platform: 'vk',
      success: true,
      videoId: 'vk_video_id',
      url: 'https://vk.com/video...',
      embedUrl: 'https://vk.com/video_ext.php?...'
    }
  }

  private async uploadToYouTube(file: File, metadata: Record<string, unknown>): Promise<UploadResult> {
    // Если есть прокси, используем его
    if (this.config.useProxy && this.config.proxyUrl) {
      const response = await fetch(`${this.config.proxyUrl}/youtube/upload`, {
        method: 'POST',
        body: this.createFormData(file, metadata)
      })

      if (!response.ok) {
        throw new Error('Proxy upload failed')
      }

      return await response.json()
    }

    // Прямая загрузка (работает только с VPN)
    // ... код прямой загрузки ...

    return {
      platform: 'youtube',
      success: true,
      videoId: 'youtube_video_id',
      url: 'https://youtube.com/watch?v=...',
      embedUrl: 'https://youtube.com/embed/...'
    }
  }

  private async uploadToRuTube(file: File, metadata: Record<string, unknown>): Promise<UploadResult> {
    // RuTube как альтернатива для России
    const rutubeToken = process.env.RUTUBE_API_TOKEN

    if (!rutubeToken) {
      throw new Error('RuTube credentials not configured')
    }

    // ... код загрузки на RuTube ...

    return {
      platform: 'rutube',
      success: true,
      videoId: 'rutube_video_id',
      url: 'https://rutube.ru/video/...',
      embedUrl: 'https://rutube.ru/play/embed/...'
    }
  }

  private createFormData(file: File, metadata: Record<string, unknown>): FormData {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', metadata.title)
    formData.append('description', metadata.description || '')
    formData.append('isPrivate', metadata.isPrivate ? '1' : '0')
    
    if (metadata.tags) {
      formData.append('tags', metadata.tags.join(','))
    }

    return formData
  }
}

// Фабрика для создания сервиса с нужной конфигурацией
export function createVideoUploadService(): VideoUploadService {
  const isProduction = process.env.NODE_ENV === 'production'
  const hasProxy = !!process.env.VIDEO_PROXY_URL

  return new VideoUploadService({
    useProxy: hasProxy,
    proxyUrl: process.env.VIDEO_PROXY_URL,
    platforms: ['vk', 'youtube', 'rutube'],
    fallbackToVK: true // Всегда пытаемся загрузить на VK как запасной вариант
  })
}
