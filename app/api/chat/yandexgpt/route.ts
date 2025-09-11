import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым" },
        { status: 400 }
      )
    }

    const apiKey = process.env.YANDEXGPT_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "YandexGPT API ключ не настроен" },
        { status: 500 }
      )
    }

    // Вызываем YandexGPT API
    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelUri: `gpt://${process.env.YANDEXGPT_FOLDER_ID}/yandexgpt/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages: [
          {
            role: "system",
            text: "Ты - AI-ассистент фитнес-студии KattyFit. Помогаешь клиентам с вопросами о тренировках, записях, курсах и общем здоровом образе жизни. Отвечай дружелюбно и профессионально на русском языке."
          },
          {
            role: "user",
            text: message
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('YandexGPT API error:', errorData)
      return NextResponse.json(
        { error: "Ошибка при обращении к YandexGPT API" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.result?.alternatives?.[0]?.message?.text || "Извините, не удалось получить ответ."

    return NextResponse.json({
      success: true,
      response: aiResponse,
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error("Ошибка чата:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}