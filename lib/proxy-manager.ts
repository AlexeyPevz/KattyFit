// Универсальная система управления прокси
// Поддержка ASOCKS.COM, Beget VPS и других провайдеров

export interface ProxyConfig {
  id: string
  name: string
  type: 'asocks' | 'beget' | 'custom'
  host: string
  port: number
  username?: string
  password?: string
  isActive: boolean
  priority: number // 1 = высший приоритет
  allowedServices: string[] // Какие сервисы проксировать
  healthCheckUrl?: string
  lastChecked?: Date | string
  isHealthy?: boolean
  responseTime?: number
}

export interface ProxyRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

export interface ProxyResponse {
  success: boolean
  data?: any
  error?: string
  proxyUsed?: string
  responseTime?: number
}

// Список заблокированных в РФ сервисов
const BLOCKED_SERVICES = [
  'youtube.com',
  'youtu.be', 
  'googleapis.com',
  'googleusercontent.com',
  'instagram.com',
  'facebook.com',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'discord.com',
  'telegram.org',
  'openai.com',
  'anthropic.com',
  'claude.ai'
]

class ProxyManager {
  private proxies: Map<string, ProxyConfig> = new Map()
  private currentProxy: string | null = null

  constructor() {
    this.loadProxiesFromEnv()
  }

  // Загрузка прокси из переменных окружения
  private loadProxiesFromEnv() {
    // ASOCKS прокси
    const asocksHost = process.env.ASOCKS_HOST
    const asocksPort = process.env.ASOCKS_PORT
    const asocksUser = process.env.ASOCKS_USERNAME
    const asocksPass = process.env.ASOCKS_PASSWORD

    if (asocksHost && asocksPort) {
      this.addProxy({
        id: 'asocks-main',
        name: 'ASOCKS Main',
        type: 'asocks',
        host: asocksHost,
        port: parseInt(asocksPort),
        username: asocksUser,
        password: asocksPass,
        isActive: true,
        priority: 1,
        allowedServices: ['youtube.com', 'googleapis.com', 'instagram.com', 'tiktok.com'],
        healthCheckUrl: 'https://httpbin.org/ip'
      })
    }

    // Beget VPS прокси
    const begetHost = process.env.BEGET_PROXY_HOST
    const begetPort = process.env.BEGET_PROXY_PORT
    const begetApiKey = process.env.BEGET_PROXY_API_KEY

    if (begetHost && begetPort) {
      this.addProxy({
        id: 'beget-vps',
        name: 'Beget VPS',
        type: 'beget',
        host: begetHost,
        port: parseInt(begetPort),
        isActive: true,
        priority: 2,
        allowedServices: ['youtube.com', 'googleapis.com'],
        healthCheckUrl: `${begetHost}:${begetPort}/health/youtube`
      })
    }

    // Custom прокси
    const customHost = process.env.CUSTOM_PROXY_HOST
    const customPort = process.env.CUSTOM_PROXY_PORT
    const customUser = process.env.CUSTOM_PROXY_USERNAME
    const customPass = process.env.CUSTOM_PROXY_PASSWORD

    if (customHost && customPort) {
      this.addProxy({
        id: 'custom-proxy',
        name: 'Custom Proxy',
        type: 'custom',
        host: customHost,
        port: parseInt(customPort),
        username: customUser,
        password: customPass,
        isActive: true,
        priority: 3,
        allowedServices: ['youtube.com', 'googleapis.com', 'instagram.com'],
        healthCheckUrl: 'https://httpbin.org/ip'
      })
    }
  }

  // Добавление прокси
  addProxy(config: ProxyConfig) {
    this.proxies.set(config.id, config)
  }

  // Обновление прокси
  updateProxy(id: string, updates: Partial<ProxyConfig>) {
    const proxy = this.proxies.get(id)
    if (proxy) {
      this.proxies.set(id, { ...proxy, ...updates })
    }
  }

  // Удаление прокси
  removeProxy(id: string) {
    this.proxies.delete(id)
  }

  // Получение всех прокси
  getAllProxies(): ProxyConfig[] {
    return Array.from(this.proxies.values()).sort((a, b) => a.priority - b.priority)
  }

  // Получение активных прокси
  getActiveProxies(): ProxyConfig[] {
    return this.getAllProxies().filter(p => p.isActive)
  }

  // Проверка, нужен ли прокси для URL
  needsProxy(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      return BLOCKED_SERVICES.some(service => 
        hostname.includes(service.toLowerCase())
      )
    } catch {
      return false
    }
  }

  // Выбор лучшего прокси для сервиса
  selectProxy(url: string): ProxyConfig | null {
    if (!this.needsProxy(url)) {
      return null
    }

    const activeProxies = this.getActiveProxies()
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Ищем прокси, который поддерживает этот сервис
    const suitableProxies = activeProxies.filter(proxy => 
      proxy.allowedServices.some(service => 
        hostname.includes(service.toLowerCase())
      )
    )

    if (suitableProxies.length === 0) {
      return null
    }

    // Выбираем прокси с наивысшим приоритетом и лучшим здоровьем
    return suitableProxies.sort((a, b) => {
      // Сначала по здоровью
      if (a.isHealthy && !b.isHealthy) return -1
      if (!a.isHealthy && b.isHealthy) return 1
      
      // Потом по приоритету
      return a.priority - b.priority
    })[0]
  }

  // Выполнение запроса через прокси
  async makeRequest(request: ProxyRequest): Promise<ProxyResponse> {
    const proxy = this.selectProxy(request.url)
    
    if (!proxy) {
      // Прямой запрос без прокси
      return this.directRequest(request)
    }

    try {
      const startTime = Date.now()
      
      let response: Response
      
      if (proxy.type === 'asocks') {
        response = await this.asocksRequest(proxy, request)
      } else if (proxy.type === 'beget') {
        response = await this.begetRequest(proxy, request)
      } else {
        response = await this.customProxyRequest(proxy, request)
      }

      const responseTime = Date.now() - startTime
      
      // Обновляем статистику прокси
      this.updateProxy(proxy.id, {
        lastChecked: new Date(),
        isHealthy: response.ok,
        responseTime
      })

      const data = await response.json().catch(() => null)

      return {
        success: response.ok,
        data,
        proxyUsed: proxy.name,
        responseTime
      }
    } catch (error) {
      // Помечаем прокси как нездоровый
      this.updateProxy(proxy.id, {
        lastChecked: new Date(),
        isHealthy: false
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        proxyUsed: proxy.name
      }
    }
  }

  // Прямой запрос без прокси
  private async directRequest(request: ProxyRequest): Promise<ProxyResponse> {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      })

      const data = await response.json().catch(() => null)

      return {
        success: response.ok,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Direct request failed'
      }
    }
  }

  // ASOCKS прокси запрос
  async asocksRequest(proxy: ProxyConfig, request: ProxyRequest): Promise<Response> {
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
    
    // Используем HttpsProxyAgent для Node.js
    const { HttpsProxyAgent } = await import('https-proxy-agent')
    
    // Создаем прокси URL для fetch
    const proxyAgent = new HttpsProxyAgent(proxyUrl)
    
    return fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      // @ts-ignore - Node.js fetch не поддерживает agent, но это работает в некоторых средах
      agent: proxyAgent
    })
  }

  // Beget VPS прокси запрос
  async begetRequest(proxy: ProxyConfig, request: ProxyRequest): Promise<Response> {
    const proxyUrl = `http://${proxy.host}:${proxy.port}`
    
    // Beget прокси работает как обычный HTTP прокси
    const { HttpsProxyAgent } = await import('https-proxy-agent')
    
    const proxyAgent = new HttpsProxyAgent(proxyUrl)
    
    return fetch(request.url, {
      method: request.method,
      headers: {
        ...request.headers,
        'X-Proxy-API-Key': process.env.BEGET_PROXY_API_KEY || '',
        'X-Original-URL': request.url
      },
      body: request.body,
      // @ts-ignore
      agent: proxyAgent
    })
  }

  // Custom прокси запрос
  async customProxyRequest(proxy: ProxyConfig, request: ProxyRequest): Promise<Response> {
    const proxyUrl = proxy.username && proxy.password 
      ? `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
      : `http://${proxy.host}:${proxy.port}`
    
    const { HttpsProxyAgent } = await import('https-proxy-agent')
    
    const proxyAgent = new HttpsProxyAgent(proxyUrl)
    
    return fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      // @ts-ignore
      agent: proxyAgent
    })
  }

  // Проверка здоровья всех прокси
  async healthCheckAll(): Promise<void> {
    const activeProxies = this.getActiveProxies()
    
    await Promise.allSettled(
      activeProxies.map(proxy => this.healthCheck(proxy.id))
    )
  }

  // Проверка здоровья конкретного прокси
  async healthCheck(proxyId: string): Promise<boolean> {
    const proxy = this.proxies.get(proxyId)
    if (!proxy || !proxy.healthCheckUrl) {
      return false
    }

    try {
      const startTime = Date.now()
      const response = await this.makeRequest({
        url: proxy.healthCheckUrl,
        method: 'GET',
        timeout: 10000
      })

      const responseTime = Date.now() - startTime
      const isHealthy = response.success && responseTime < 5000

      this.updateProxy(proxyId, {
        lastChecked: new Date(),
        isHealthy,
        responseTime
      })

      return isHealthy
    } catch {
      this.updateProxy(proxyId, {
        lastChecked: new Date(),
        isHealthy: false
      })
      return false
    }
  }

  // Получение статистики прокси
  getStats() {
    const proxies = this.getAllProxies()
    const active = proxies.filter(p => p.isActive)
    const healthy = active.filter(p => p.isHealthy)
    
    return {
      total: proxies.length,
      active: active.length,
      healthy: healthy.length,
      proxies: proxies.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        isActive: p.isActive,
        isHealthy: p.isHealthy,
        responseTime: p.responseTime,
        lastChecked: p.lastChecked
      }))
    }
  }
}

// Экспорт синглтона
export const proxyManager = new ProxyManager()

// Утилиты для работы с прокси
export async function makeProxiedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const proxy = proxyManager.selectProxy(url)
  
  if (!proxy) {
    // Прямой запрос без прокси
    return fetch(url, options)
  }

  try {
    let response: Response
    
    if (proxy.type === 'asocks') {
      response = await proxyManager.asocksRequest(proxy, {
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string>,
        body: options.body
      })
    } else if (proxy.type === 'beget') {
      response = await proxyManager.begetRequest(proxy, {
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string>,
        body: options.body
      })
    } else {
      response = await proxyManager.customProxyRequest(proxy, {
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string>,
        body: options.body
      })
    }

    return response
  } catch (error) {
    // Fallback на прямой запрос
    console.warn(`Proxy request failed for ${url}, falling back to direct:`, error)
    return fetch(url, options)
  }
}

// Проверка доступности сервиса
export async function checkServiceAvailability(serviceUrl: string): Promise<{
  available: boolean
  viaProxy: boolean
  proxyUsed?: string
  responseTime?: number
}> {
  const needsProxy = proxyManager.needsProxy(serviceUrl)
  
  if (!needsProxy) {
    // Прямой запрос
    const startTime = Date.now()
    try {
      const response = await fetch(serviceUrl, { method: 'HEAD' })
      return {
        available: response.ok,
        viaProxy: false,
        responseTime: Date.now() - startTime
      }
    } catch {
      return {
        available: false,
        viaProxy: false
      }
    }
  }

  // Через прокси
  const result = await proxyManager.makeRequest({
    url: serviceUrl,
    method: 'HEAD'
  })

  return {
    available: result.success,
    viaProxy: true,
    proxyUsed: result.proxyUsed,
    responseTime: result.responseTime
  }
}