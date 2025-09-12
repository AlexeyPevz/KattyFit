import { NextRequest, NextResponse } from "next/server"
import logger from "@/lib/logger"

// Вебхук для захвата лидов из различных источников
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const source = request.headers.get("x-source") || "website"

    let leadData: Record<string, unknown> = {}

    // Обработка данных в зависимости от источника
    switch (source) {
      case "website":
        // Форма с сайта
        leadData = {
          name: body.name,
          email: body.email,
          phone: body.phone,
          source: "Сайт",
          message: body.message,
          tags: [body.interest || "общий запрос"],
          value: body.coursePrice || 0,
          metadata: {
            page: body.page,
            utm_source: body.utm_source,
            utm_medium: body.utm_medium,
            utm_campaign: body.utm_campaign,
          }
        }
        break

      case "instagram":
        // Instagram Direct или комментарии
        leadData = {
          name: body.username || "Instagram User",
          email: body.email || `${body.username}@instagram.lead`,
          phone: body.phone || "",
          source: "Instagram",
          message: body.text,
          tags: ["instagram", body.type || "direct"],
          metadata: {
            instagram_id: body.user_id,
            post_id: body.post_id,
          }
        }
        break

      case "tiktok":
        // TikTok лиды
        leadData = {
          name: body.user_display_name || "TikTok User",
          email: body.email || `${body.user_id}@tiktok.lead`,
          phone: body.phone || "",
          source: "TikTok",
          message: body.message || "Заинтересован через TikTok",
          tags: ["tiktok", "video"],
          metadata: {
            tiktok_user_id: body.user_id,
            video_id: body.video_id,
          }
        }
        break

      case "quiz":
        // Результаты квиза
        leadData = {
          name: body.name,
          email: body.email,
          phone: body.phone,
          source: "Квиз",
          message: `Результаты квиза: ${JSON.stringify(body.answers)}`,
          tags: ["квиз", body.result_type],
          value: body.recommended_product_price || 0,
          metadata: {
            quiz_id: body.quiz_id,
            answers: body.answers,
            result: body.result,
            score: body.score,
          }
        }
        break

      case "landing":
        // Лендинг с рекламы
        leadData = {
          name: body.name,
          email: body.email,
          phone: body.phone,
          source: body.traffic_source || "Реклама",
          message: body.comment || `Интерес: ${body.product}`,
          tags: ["landing", body.product],
          value: body.price || 0,
          metadata: {
            landing_id: body.landing_id,
            utm_source: body.utm_source,
            utm_medium: body.utm_medium,
            utm_campaign: body.utm_campaign,
            utm_content: body.utm_content,
            utm_term: body.utm_term,
          }
        }
        break

      case "chatbot":
        // Лиды от чат-бота
        leadData = {
          name: body.user_name || "Пользователь чата",
          email: body.email || "",
          phone: body.phone || "",
          source: body.platform || "Чат-бот",
          message: body.conversation_summary || "Диалог с ботом",
          tags: ["chatbot", ...body.interests || []],
          value: body.potential_value || 0,
          metadata: {
            chat_id: body.chat_id,
            platform: body.platform,
            user_id: body.user_id,
            intent: body.detected_intent,
            score: body.qualification_score,
          }
        }
        break

      default:
        // Общий формат
        leadData = {
          name: body.name || "Неизвестный",
          email: body.email,
          phone: body.phone || "",
          source: source,
          message: body.message || "",
          tags: body.tags || [],
          value: body.value || 0,
          metadata: body.metadata || {},
        }
    }

    // Добавляем дополнительные теги на основе контента
    if (!leadData.tags) leadData.tags = []

    // Автоматическое определение интересов
    const message = (leadData.message as string || "").toLowerCase()
    if (!Array.isArray(leadData.tags)) {
      leadData.tags = []
    }
    
    if (message.includes("растяжк") || message.includes("шпагат")) {
      (leadData.tags as string[]).push("растяжка")
    }
    if (message.includes("йог") || message.includes("аэройог")) {
      (leadData.tags as string[]).push("йога")
    }
    if (message.includes("курс")) {
      (leadData.tags as string[]).push("курс")
    }
    if (message.includes("тренировк") || message.includes("занят")) {
      (leadData.tags as string[]).push("тренировки")
    }
    if (message.includes("пакет") || message.includes("абонемент")) {
      (leadData.tags as string[]).push("пакет")
    }

    // Определяем потенциальную стоимость если не указана
    if (!leadData.value) {
      if ((leadData.tags as string[]).includes("пакет")) {
        leadData.value = 11250 // Средняя цена пакета
      } else if ((leadData.tags as string[]).includes("курс")) {
        leadData.value = 3990 // Средняя цена курса
      } else if ((leadData.tags as string[]).includes("тренировки")) {
        leadData.value = 2500 // Цена одной тренировки
      }
    }

    // Отправляем в CRM
    const response = await fetch(`${request.nextUrl.origin}/api/crm/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Ошибка добавления лида")
    }

    // Отправляем уведомление в чат (опционально)
    if (result.isNew) {
      // Отправка уведомления о новом лиде
      await fetch(`${request.nextUrl.origin}/api/notifications/new-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lead: result.lead,
          source: leadData.source,
        }),
      }).catch((error) => logger.error("Lead capture error", { error: error instanceof Error ? error.message : String(error) }))
    }

    return NextResponse.json({
      success: true,
      leadId: result.lead.id,
      isNew: result.isNew,
    })
  } catch (error: Error | unknown) {
    logger.error("Lead capture webhook error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: (error as Error).message || "Ошибка обработки лида" },
      { status: 500 }
    )
  }
}

// GET метод для проверки webhook
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Lead capture webhook is active",
    endpoints: {
      website: "x-source: website",
      instagram: "x-source: instagram",
      tiktok: "x-source: tiktok",
      quiz: "x-source: quiz",
      landing: "x-source: landing",
      chatbot: "x-source: chatbot",
    }
  })
}
