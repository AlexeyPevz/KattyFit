import { supabase } from "./supabase"

interface RAGContext {
  userMessage: string
  chatHistory?: any[]
  platform?: string
  userName?: string
  userContext?: any
}

interface KnowledgeItem {
  type: "faq" | "dialog_example" | "course_info" | "pricing"
  question?: string
  answer?: string
  context?: any
}

// Получение API ключей для AI сервисов
async function getAIServiceKey(service: "yandexgpt" | "openai"): Promise<string | null> {
  const { data } = await supabase
    .from("api_keys")
    .select("key_value")
    .eq("service", service)
    .eq("is_active", true)
    .single()
  
  return data?.key_value || null
}

// Поиск релевантной информации в базе знаний
async function searchKnowledge(query: string): Promise<KnowledgeItem[]> {
  // Простой текстовый поиск (в идеале использовать векторный поиск)
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("is_active", true)
    .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
    .limit(5)

  if (error) {
    console.error("Ошибка поиска в базе знаний:", error)
    return []
  }

  return data || []
}

// Генерация ответа через YandexGPT
async function generateYandexGPTResponse(context: RAGContext, knowledge: KnowledgeItem[]): Promise<string> {
  const apiKey = await getAIServiceKey("yandexgpt")
  if (!apiKey) {
    throw new Error("YandexGPT API ключ не настроен")
  }

  // Формируем промпт
  const systemPrompt = `Ты - дружелюбный ассистент фитнес-тренера KattyFit.
Твоя задача - отвечать на вопросы о растяжке, аэройоге и занятиях.
Используй информацию из базы знаний, когда это возможно.
Отвечай в дружелюбном, но профессиональном тоне.
Если не знаешь точного ответа, предложи связаться с тренером напрямую.`

  const knowledgeContext = knowledge.map(item => 
    `Q: ${item.question}\nA: ${item.answer}`
  ).join("\n\n")

  const userPrompt = `База знаний:
${knowledgeContext}

История диалога:
${context.chatHistory?.map(m => `${m.type}: ${m.text}`).join("\n") || "Начало диалога"}

Платформа: ${context.platform || "неизвестно"}
Имя пользователя: ${context.userName || "Гость"}

Вопрос пользователя: ${context.userMessage}

Ответ:`

  try {
    const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Authorization": `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelUri: "gpt://b1g5og5o73gqkcbbhotr/yandexgpt-lite",
        completionOptions: {
          stream: false,
          temperature: 0.7,
          maxTokens: 500,
        },
        messages: [
          { role: "system", text: systemPrompt },
          { role: "user", text: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error("Ошибка YandexGPT API")
    }

    const data = await response.json()
    return data.result.alternatives[0].message.text
  } catch (error) {
    console.error("Ошибка генерации YandexGPT:", error)
    // Fallback на OpenAI или простые ответы
    return generateFallbackResponse(context, knowledge)
  }
}

// Генерация ответа через OpenAI (альтернатива)
async function generateOpenAIResponse(context: RAGContext, knowledge: KnowledgeItem[]): Promise<string> {
  const apiKey = await getAIServiceKey("openai")
  if (!apiKey) {
    throw new Error("OpenAI API ключ не настроен")
  }

  const systemPrompt = `You are a friendly fitness assistant for KattyFit.
Answer questions about stretching, aerial yoga, and classes.
Use the knowledge base when possible.
Be friendly but professional.
If unsure, suggest contacting the trainer directly.
Answer in Russian.`

  const knowledgeContext = knowledge.map(item => 
    `Q: ${item.question}\nA: ${item.answer}`
  ).join("\n\n")

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Knowledge base:\n${knowledgeContext}\n\nUser question: ${context.userMessage}` },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error("Ошибка OpenAI API")
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Ошибка генерации OpenAI:", error)
    return generateFallbackResponse(context, knowledge)
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
    // Ищем релевантную информацию в базе знаний
    const knowledge = await searchKnowledge(context.userMessage)

    // Пробуем YandexGPT
    const yandexKey = await getAIServiceKey("yandexgpt")
    if (yandexKey) {
      return await generateYandexGPTResponse(context, knowledge)
    }

    // Пробуем OpenAI
    const openaiKey = await getAIServiceKey("openai")
    if (openaiKey) {
      return await generateOpenAIResponse(context, knowledge)
    }

    // Используем fallback
    return generateFallbackResponse(context, knowledge)
  } catch (error) {
    console.error("Ошибка RAG движка:", error)
    return generateFallbackResponse(context, [])
  }
}

// Функция для загрузки примеров диалогов в базу знаний
export async function loadDialogExamples(examples: Array<{ question: string, answer: string }>) {
  const items = examples.map(example => ({
    type: "dialog_example" as const,
    question: example.question,
    answer: example.answer,
    is_active: true,
  }))

  const { error } = await supabase
    .from("knowledge_base")
    .insert(items)

  if (error) {
    console.error("Ошибка загрузки примеров:", error)
    return false
  }

  return true
}

// Функция для загрузки FAQ
export async function loadFAQ(faqs: Array<{ question: string, answer: string }>) {
  const items = faqs.map(faq => ({
    type: "faq" as const,
    question: faq.question,
    answer: faq.answer,
    is_active: true,
  }))

  const { error } = await supabase
    .from("knowledge_base")
    .insert(items)

  if (error) {
    console.error("Ошибка загрузки FAQ:", error)
    return false
  }

  return true
}