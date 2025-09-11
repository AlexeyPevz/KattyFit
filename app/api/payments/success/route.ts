import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import crypto from "crypto"
import logger from "@/lib/logger"

// Функция для проверки подписи CloudPayments
function checkCloudPaymentsSignature(data: Record<string, unknown>, signature: string): boolean {
  const secret = process.env.CLOUDPAYMENTS_SECRET || ""
  const message = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("&")
  
  const hash = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
  
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    logger.info("Payment success webhook", { body })

    // Проверяем подпись, если секрет установлен
    const signature = request.headers.get("Content-HMAC") || request.headers.get("Content-Hmac")
    if (process.env.CLOUDPAYMENTS_SECRET && (!signature || !checkCloudPaymentsSignature(body, signature))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const {
      transactionId,
      amount,
      description,
      email,
      data
    } = body

    // Создаем запись о покупке
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        transaction_id: transactionId,
        user_email: email,
        item_type: data.type || "course",
        item_id: data.courseId || data.bookingId,
        amount: amount,
        currency: "RUB",
        status: "completed",
        payment_method: "cloudpayments",
        metadata: data,
      })
      .select()
      .single()

    if (purchaseError) {
      logger.error("Error creating purchase", { error: purchaseError instanceof Error ? purchaseError.message : String(purchaseError) })
      return NextResponse.json(
        { error: "Failed to create purchase record" },
        { status: 500 }
      )
    }

    // Создаем или обновляем пользователя
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .upsert({
        email: email,
        last_purchase_at: new Date().toISOString(),
      }, {
        onConflict: "email"
      })
      .select()
      .single()

    if (userError) {
      logger.error("Error creating/updating user", { error: userError instanceof Error ? userError.message : String(userError) })
    }

    // Предоставляем доступ к курсу
    if (data.type === "course" && data.courseId) {
      const { error: accessError } = await supabaseAdmin
        .from("course_access")
        .insert({
          user_email: email,
          course_id: data.courseId,
          purchase_id: purchase.id,
          expires_at: null, // Доступ навсегда
        })

      if (accessError) {
        logger.error("Error granting course access", { error: accessError instanceof Error ? accessError.message : String(accessError) })
      }
    }

    // Отправляем email с доступом (в реальном приложении)
    // await sendAccessEmail(email, data)

    // Добавляем/обновляем лида как клиента
    try {
      if (user) {
        const { data: existingLead } = await supabaseAdmin
          .from("leads")
          .select("id, tags, metadata")
          .eq("email", email)
          .limit(1)
          .single()

        if (existingLead?.id) {
          await supabaseAdmin
            .from("leads")
            .update({
              stage: "customer",
              source: "website",
              tags: Array.from(new Set([...(existingLead.tags || []), "customer"])),
              metadata: { ...(existingLead.metadata || {}), last_purchase_id: purchase.id, last_amount: amount },
            })
            .eq("id", existingLead.id)
        } else {
          await supabaseAdmin
            .from("leads")
            .insert({
              name: email,
              email,
              phone: null,
              source: "website",
              stage: "customer",
              value: amount,
              tags: ["customer"],
              notes: description || "",
              metadata: { last_purchase_id: purchase.id },
            })
        }
      }
    } catch (e) {
      logger.error("Lead upsert failed", { error: e instanceof Error ? e.message : String(e) })
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      message: "Payment processed successfully"
    })
  } catch (error) {
    logger.error("Payment webhook error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Webhook для уведомлений от CloudPayments
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { Type, ...data } = body

    switch (Type) {
      case "Payment":
        // Успешный платеж
        logger.info("Payment notification", { data })
        break
      
      case "Refund":
        // Возврат средств
        logger.info("Refund notification", { data })
        await handleRefund(data)
        break
      
      case "RecurrentPayment":
        // Рекуррентный платеж (подписка)
        logger.info("Recurrent payment", { data })
        break
      
      default:
        logger.warn("Unknown notification type", { type: Type })
    }

    // CloudPayments требует ответ {code: 0}
    return NextResponse.json({ code: 0 })
  } catch (error) {
    logger.error("Webhook error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ code: 13 }) // Ошибка в обработке
  }
}

async function handleRefund(data: Record<string, unknown>) {
  // Обновляем статус покупки
  await supabaseAdmin
    .from("purchases")
    .update({ 
      status: "refunded",
      refunded_at: new Date().toISOString()
    })
    .eq("transaction_id", data.TransactionId)

  // Отзываем доступ к курсу
  await supabaseAdmin
    .from("course_access")
    .update({ 
      revoked_at: new Date().toISOString()
    })
    .eq("transaction_id", data.TransactionId)
}
