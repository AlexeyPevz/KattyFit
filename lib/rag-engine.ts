import { RAGContext, KnowledgeItem } from '@/types/api'
import { AIServiceFactory } from './services/ai-service'
import { DatabaseServiceFactory } from './services/database-service'
import logger from './logger'

// Поиск релевантной информации в базе знаний
async function searchKnowledge(query: string): Promise<KnowledgeItem[]> {
  try {
    const database = DatabaseServiceFactory.createFromEnv()
    
    // Защита от SQL injection
    const sanitizedQuery = query.replace(/[%_]/g, '\\$&')
    
    const knowledge = await database.executeQuery<KnowledgeItem>(
      `SELECT * FROM knowledge_base 
       WHERE (question ILIKE $1 OR answer ILIKE $1) 
       AND is_active = true 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [`%${sanitizedQuery}%`]
    )

    return knowledge
  } catch (error) {
    // Логирование ошибки поиска в базе знаний
    await logger.error('Knowledge search failed', {
      query: query.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, error instanceof Error ? error : undefined)
    return []
  }
}


// Fallback ответы без AI
function generateFallbackResponse(context: RAGContext, knowledge: KnowledgeItem[]): string {
  const message = context.userMessage.toLowerCase()

  // Проверяем базу знаний на точные совпадения
  for (const item of knowledge) {
    if (item.question && message.includes(item.question.toLowerCase())) {
      return item.answer || "Спасибо за ваш вопрос! Я передам его тренеру."
    }
  }

  // Простые правила для частых вопросов
  if (message.includes("привет") || message.includes("здравствуй")) {
    return "Здравствуйте! Рада приветствовать вас! Я помощник KattyFit. Чем могу помочь? 😊"
  }

  if (message.includes("цен") || message.includes("стоимость") || message.includes("сколько")) {
    return `Стоимость занятий:
• Индивидуальное занятие - 2500₽
• Групповые занятия - от 800₽
• Абонемент на 8 занятий - 6000₽ (скидка 20%)
• Пробное занятие - 500₽

Хотите записаться на пробное занятие?`
  }

  if (message.includes("расписани") || message.includes("время") || message.includes("когда")) {
    return `Расписание занятий:
• Пн, Ср, Пт - 10:00, 17:00, 19:00
• Вт, Чт - 11:00, 18:00
• Сб - 10:00, 12:00
• Вс - по записи

Какое время вам удобно?`
  }

  if (message.includes("адрес") || message.includes("где") || message.includes("находится")) {
    return "Занятия проходят по адресу: ул. Примерная, 123. Также доступны онлайн-занятия. Что вам больше подходит?"
  }

  if (message.includes("запис") || message.includes("хочу") || message.includes("можно")) {
    return "Отлично! Для записи на занятие напишите удобную дату и время, и я передам информацию тренеру. Или можете позвонить напрямую: +7 (999) 123-45-67"
  }

  // Общий fallback
  return "Спасибо за ваше сообщение! Я обязательно передам его Кате, и она свяжется с вами в ближайшее время. Если вопрос срочный, можете позвонить: +7 (999) 123-45-67"
}


// Главная функция генерации ответа
export async function generateRAGResponse(context: RAGContext): Promise<string> {
  try {
    // Получаем знания из базы
    const knowledge = await searchKnowledge(context.userMessage)
    
    // Обновляем контекст с найденными знаниями
    const enrichedContext: RAGContext = {
      ...context,
      platform: context.platform || "web",
      chatHistory: context.chatHistory.map(msg => ({
        ...msg,
        platform: msg.platform || context.platform || "web"
      })),
      userContext: {
        ...context.userContext,
        knowledge,
      },
    }

    // Пытаемся использовать доступный AI сервис
    const aiService = await AIServiceFactory.createAvailableService()
    
    if (aiService.getServiceName() !== 'Fallback') {
      try {
        const response = await aiService.generateResponse(enrichedContext)
        return response
      } catch (error) {
        // Логирование ошибки AI сервиса
        await logger.warn(`${aiService.getServiceName()} failed, using fallback`, {
          service: aiService.getServiceName(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }, error instanceof Error ? error : undefined)
      }
    }

    // Используем fallback ответ
    return generateFallbackResponse(enrichedContext, knowledge)
  } catch (error) {
    // Критическая ошибка RAG engine
    await logger.critical('RAG engine critical error', {
      context: {
        userMessage: context.userMessage.substring(0, 100),
        platform: context.platform,
        conversationId: context.conversationId
      }
    }, error instanceof Error ? error : undefined)
    return generateFallbackResponse(context, [])
  }
}
