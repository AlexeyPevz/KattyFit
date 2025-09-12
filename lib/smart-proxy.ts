// Умная маршрутизация для интеграции с существующими API
// Автоматически определяет, нужен ли прокси для запроса

import { proxyManager, makeProxiedRequest } from './proxy-manager'
import logger from './logger'

// Обертка для fetch с автоматическим проксированием
export async function smartFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Проверяем, нужен ли прокси для этого URL
  if (proxyManager.needsProxy(url)) {
    try {
      // Пытаемся выполнить запрос через прокси
      return await makeProxiedRequest(url, options)
    } catch (error) {
      logger.warn(`Proxy request failed for ${url}, falling back to direct`, { error: error instanceof Error ? error.message : String(error) })
      // Fallback на прямой запрос
      return fetch(url, options)
    }
  } else {
    // Прямой запрос для российских сервисов
    return fetch(url, options)
  }
}

// Специализированные функции для разных сервисов
export class SmartAPI {
  // YouTube API с автоматическим проксированием
  static async youtubeRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://www.googleapis.com/youtube/v3'
    const url = `${baseUrl}${endpoint}`
    
    return smartFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  // Instagram API через прокси
  static async instagramRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://graph.facebook.com/v17.0'
    const url = `${baseUrl}${endpoint}`
    
    return smartFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  // TikTok API через прокси
  static async tiktokRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://open-api.tiktok.com'
    const url = `${baseUrl}${endpoint}`
    
    return smartFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  // OpenAI API через прокси
  static async openaiRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://api.openai.com/v1'
    const url = `${baseUrl}${endpoint}`
    
    return smartFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  // ElevenLabs API через прокси
  static async elevenlabsRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://api.elevenlabs.io/v1'
    const url = `${baseUrl}${endpoint}`
    
    return smartFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  // ContentStudio API через прокси
  static async contentstudioRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://app.contentstudio.io/api/v1'
    const url = `${baseUrl}${endpoint}`
    
    return smartFetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }
}

// Утилиты для работы с прокси
export class ProxyUtils {
  // Проверка доступности сервиса
  static async checkService(serviceUrl: string): Promise<{
    available: boolean
    viaProxy: boolean
    responseTime?: number
    error?: string
  }> {
    try {
      const startTime = Date.now()
      const response = await smartFetch(serviceUrl, { method: 'HEAD' })
      const responseTime = Date.now() - startTime

      return {
        available: response.ok,
        viaProxy: proxyManager.needsProxy(serviceUrl),
        responseTime
      }
    } catch (error) {
      return {
        available: false,
        viaProxy: proxyManager.needsProxy(serviceUrl),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Получение статуса всех прокси
  static getProxyStatus() {
    return proxyManager.getStats()
  }

  // Проверка здоровья всех прокси
  static async healthCheckAll() {
    await proxyManager.healthCheckAll()
    return proxyManager.getStats()
  }

  // Получение информации о том, какой прокси используется для URL
  static getProxyInfo(url: string) {
    const proxy = proxyManager.selectProxy(url)
    return {
      needsProxy: proxyManager.needsProxy(url),
      selectedProxy: proxy ? {
        id: proxy.id,
        name: proxy.name,
        type: proxy.type,
        isHealthy: proxy.isHealthy
      } : null
    }
  }
}

// Экспорт для использования в API маршрутах
export { proxyManager, makeProxiedRequest }
