import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import crypto from "crypto"

// Функция для проверки подписи CloudPayments
function checkCloudPaymentsSignature(data: any, signature: string): boolean {
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
    console.log("Payment success webhook:", body)

    // В продакшене нужно проверять подпись
    // const signature = request.headers.get("Content-HMAC")
    // if (!checkCloudPaymentsSignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    const {
      transactionId,
      amount,
      description,
      email,
      data
    } = body

    // Создаем запись о покупке
    const { data: purchase, error: purchaseError } = await supabase
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
      console.error("Error creating purchase:", purchaseError)
      return NextResponse.json(
        { error: "Failed to create purchase record" },
        { status: 500 }
      )
    }

    // Создаем или обновляем пользователя
    const { data: user, error: userError } = await supabase
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
      console.error("Error creating/updating user:", userError)
    }

    // Предоставляем доступ к курсу
    if (data.type === "course" && data.courseId) {
      const { error: accessError } = await supabase
        .from("course_access")
        .insert({
          user_email: email,
          course_id: data.courseId,
          purchase_id: purchase.id,
          expires_at: null, // Доступ навсегда
        })

      if (accessError) {
        console.error("Error granting course access:", accessError)
      }
    }

    // Отправляем email с доступом (в реальном приложении)
    // await sendAccessEmail(email, data)

    // Добавляем в CRM как успешную продажу
    if (user) {
      await supabase
        .from("leads")
        .upsert({
          user_id: user.id,
          email: email,
          status: "customer",
          source: "website",
          last_purchase_id: purchase.id,
          total_purchases: supabase.sql`total_purchases + 1`,
          total_spent: supabase.sql`total_spent + ${amount}`,
        }, {
          onConflict: "email"
        })
    }

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      message: "Payment processed successfully"
    })
  } catch (error) {
    console.error("Payment webhook error:", error)
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
        console.log("Payment notification:", data)
        break
      
      case "Refund":
        // Возврат средств
        console.log("Refund notification:", data)
        await handleRefund(data)
        break
      
      case "RecurrentPayment":
        // Рекуррентный платеж (подписка)
        console.log("Recurrent payment:", data)
        break
      
      default:
        console.log("Unknown notification type:", Type)
    }

    // CloudPayments требует ответ {code: 0}
    return NextResponse.json({ code: 0 })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ code: 13 }) // Ошибка в обработке
  }
}

async function handleRefund(data: any) {
  // Обновляем статус покупки
  await supabase
    .from("purchases")
    .update({ 
      status: "refunded",
      refunded_at: new Date().toISOString()
    })
    .eq("transaction_id", data.TransactionId)

  // Отзываем доступ к курсу
  await supabase
    .from("course_access")
    .update({ 
      revoked_at: new Date().toISOString()
    })
    .eq("transaction_id", data.TransactionId)
}