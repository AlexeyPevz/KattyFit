// Абстракция для AI сервисов
// Реализует принцип инверсии зависимостей

import { RAGContext, KnowledgeItem } from '@/types/api'
import { AppError, ErrorCode, ExternalServiceError } from '@/types/errors'

// ===== ИНТЕРФЕЙСЫ =====

export interface AIService {
  generateResponse(context: RAGContext): Promise<string>
  isAvailable(): Promise<boolean>
  getServiceName(): string
}

export interface AIServiceConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
}

// ===== БАЗОВЫЙ КЛАСС =====

abstract class BaseAIService implements AIService {
  protected config: AIServiceConfig
  protected isHealthy: boolean = true
  protected lastError?: Error
  protected lastCheck: number = 0
  protected readonly HEALTH_CHECK_INTERVAL = 60000 // 1 минута

  constructor(config: AIServiceConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config,
    }
  }

  abstract generateResponse(context: RAGContext): Promise<string>
  abstract getServiceName(): string

  async isAvailable(): Promise<boolean> {
    const now = Date.now()
    
    // Кешируем результат проверки здоровья
    if (now - this.lastCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.isHealthy
    }

    try {
      await this.healthCheck()
      this.isHealthy = true
      this.lastError = undefined
    } catch (error) {
      this.isHealthy = false
      this.lastError = error as Error
    }

    this.lastCheck = now
    return this.isHealthy
  }

  protected abstract healthCheck(): Promise<void>

  protected async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new ExternalServiceError(
          this.getServiceName(),
          `HTTP ${response.status}: ${response.statusText}`,
          undefined,
          { url, status: response.status }
        )
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  protected async retry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.maxRetries!
  ): Promise<T> {
    let lastError: Error

    for (let i = 0; i <= retries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (i === retries) {
          break
        }

        // Экспоненциальная задержка
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new ExternalServiceError(
      this.getServiceName(),
      `Operation failed after ${retries} retries`,
      lastError!
    )
  }
}

// ===== YANDEX GPT СЕРВИС =====

export class YandexGPTService extends BaseAIService {
  private readonly modelUri: string

  constructor(config: AIServiceConfig & { folderId: string }) {
    super(config)
    this.modelUri = `gpt://${config.folderId}/yandexgpt/latest`
  }

  getServiceName(): string {
    return 'YandexGPT'
  }

  async generateResponse(context: RAGContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(context)

    const response = await this.retry(async () => {
      return await this.makeRequest(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        {
          method: 'POST',
          headers: {
            'Authorization': `Api-Key ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            modelUri: this.modelUri,
            completionOptions: {
              stream: false,
              temperature: 0.7,
              maxTokens: 500,
            },
            messages: [
              { role: 'system', text: systemPrompt },
              { role: 'user', text: userPrompt },
            ],
          }),
        }
      )
    })

    const data = await response.json()
    
    if (!data.result?.alternatives?.[0]?.message?.text) {
      throw new ExternalServiceError(
        this.getServiceName(),
        'Invalid response format from YandexGPT'
      )
    }

    return data.result.alternatives[0].message.text
  }

  protected async healthCheck(): Promise<void> {
    // Простая проверка доступности API
    await this.makeRequest(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        method: 'POST',
        headers: {
          'Authorization': `Api-Key ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          modelUri: this.modelUri,
          completionOptions: { stream: false, maxTokens: 1 },
          messages: [{ role: 'user', text: 'test' }],
        }),
      }
    )
  }

  private buildSystemPrompt(): string {
    return `Ты - профессиональный ассистент фитнес-тренера KattyFit с опытом продаж.

ТВОИ ЗАДАЧИ:
1. Отвечать на вопросы о растяжке, аэройоге и занятиях
2. Мягко подводить к покупке курсов или записи на тренировку
3. Подчеркивать уникальные преимущества занятий с Кати
4. Создавать ощущение заботы и персонального подхода

ПРИНЦИПЫ ОБЩЕНИЯ:
- Дружелюбный, но профессиональный тон
- Используй эмодзи для создания позитивной атмосферы 💪✨
- Обращайся на "вы" к новым клиентам
- Задавай уточняющие вопросы для персонализации

ПРОДАЮЩИЕ ТРИГГЕРЫ:
- При вопросе о цене - подчеркни ценность и результаты
- При сомнениях - расскажи об успехах других учеников
- При откладывании - создай ощущение ограниченности (места в группах, скидки)
- Всегда предлагай пробное занятие со скидкой

ВАЖНО:
- Не будь навязчивым
- Если клиент не готов - предложи подписаться на канал
- При технических вопросах - переведи на преимущества`
  }

  private buildUserPrompt(context: RAGContext): string {
    const knowledgeContext = context.userContext?.knowledge?.map(item => 
      `Q: ${item.question}\nA: ${item.answer}`
    ).join('\n\n') || ''

    const chatHistory = context.chatHistory.map(m => 
      `${m.sender}: ${m.text}`
    ).join('\n')

    return `База знаний:
${knowledgeContext}

История диалога:
${chatHistory || 'Начало диалога'}

Платформа: ${context.platform}
Имя пользователя: ${context.userName || 'Гость'}

Вопрос пользователя: ${context.userMessage}

Ответ:`
  }
}

// ===== OPENAI СЕРВИС =====

export class OpenAIService extends BaseAIService {
  getServiceName(): string {
    return 'OpenAI'
  }

  async generateResponse(context: RAGContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt()
    const userPrompt = this.buildUserPrompt(context)

    const response = await this.retry(async () => {
      return await this.makeRequest(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      )
    })

    const data = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new ExternalServiceError(
        this.getServiceName(),
        'Invalid response format from OpenAI'
      )
    }

    return data.choices[0].message.content
  }

  protected async healthCheck(): Promise<void> {
    await this.makeRequest(
      'https://api.openai.com/v1/models',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    )
  }

  private buildSystemPrompt(): string {
    return `You are a friendly fitness assistant for KattyFit.
Answer questions about stretching, aerial yoga, and classes.
Use the knowledge base when possible.
Be friendly but professional.
If unsure, suggest contacting the trainer directly.
Answer in Russian.`
  }

  private buildUserPrompt(context: RAGContext): string {
    const knowledgeContext = context.userContext?.knowledge?.map(item => 
      `Q: ${item.question}\nA: ${item.answer}`
    ).join('\n\n') || ''

    return `Knowledge base:
${knowledgeContext}

User question: ${context.userMessage}`
  }
}

// ===== FALLBACK СЕРВИС =====

export class FallbackAIService implements AIService {
  getServiceName(): string {
    return 'Fallback'
  }

  async isAvailable(): Promise<boolean> {
    return true
  }

  async generateResponse(context: RAGContext): Promise<string> {
    const message = context.userMessage.toLowerCase()

    // Простые правила для частых вопросов
    if (message.includes('привет') || message.includes('здравствуй')) {
      return 'Здравствуйте! Рада приветствовать вас! Я помощник KattyFit. Чем могу помочь? 😊'
    }

    if (message.includes('цен') || message.includes('стоимость') || message.includes('сколько')) {
      return `Стоимость занятий:
• Индивидуальное занятие - 2500₽
• Групповые занятия - от 800₽
• Абонемент на 8 занятий - 6000₽ (скидка 20%)
• Пробное занятие - 500₽

Хотите записаться на пробное занятие?`
    }

    if (message.includes('расписани') || message.includes('время') || message.includes('когда')) {
      return `Расписание занятий:
• Пн, Ср, Пт - 10:00, 17:00, 19:00
• Вт, Чт - 11:00, 18:00
• Сб - 10:00, 12:00
• Вс - по записи

Какое время вам удобно?`
    }

    if (message.includes('адрес') || message.includes('где') || message.includes('находится')) {
      return 'Занятия проходят по адресу: ул. Примерная, 123. Также доступны онлайн-занятия. Что вам больше подходит?'
    }

    if (message.includes('запис') || message.includes('хочу') || message.includes('можно')) {
      return 'Отлично! Для записи на занятие напишите удобную дату и время, и я передам информацию тренеру. Или можете позвонить напрямую: +7 (999) 123-45-67'
    }

    // Общий fallback
    return 'Спасибо за ваше сообщение! Я обязательно передам его Кате, и она свяжется с вами в ближайшее время. Если вопрос срочный, можете позвонить: +7 (999) 123-45-67'
  }
}

// ===== ФАБРИКА СЕРВИСОВ =====

export class AIServiceFactory {
  static createYandexGPT(config: AIServiceConfig & { folderId: string }): YandexGPTService {
    return new YandexGPTService(config)
  }

  static createOpenAI(config: AIServiceConfig): OpenAIService {
    return new OpenAIService(config)
  }

  static createFallback(): FallbackAIService {
    return new FallbackAIService()
  }

  static async createAvailableService(): Promise<AIService> {
    // Пытаемся создать доступный сервис в порядке приоритета
    const services: AIService[] = []

    // YandexGPT
    if (process.env.YANDEXGPT_API_KEY && process.env.YANDEXGPT_FOLDER_ID) {
      const yandexService = this.createYandexGPT({
        apiKey: process.env.YANDEXGPT_API_KEY,
        folderId: process.env.YANDEXGPT_FOLDER_ID,
      })
      services.push(yandexService)
    }

    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      const openaiService = this.createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      services.push(openaiService)
    }

    // Проверяем доступность сервисов
    for (const service of services) {
      if (await service.isAvailable()) {
        return service
      }
    }

    // Возвращаем fallback если ничего не доступно
    return this.createFallback()
  }
}

// ===== ЭКСПОРТ =====

export { BaseAIService }
export default AIServiceFactory