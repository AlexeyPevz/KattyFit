import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { env } from "@/lib/env"
import crypto from "crypto"

// Проверка подписи CloudPayments
function verifySignature(body: string, signature: string): boolean {
  if (!env.cloudPaymentsSecret) {
    console.error("CloudPayments secret not configured")
    return false
  }
  
  const hash = crypto
    .createHmac('sha256', env.cloudPaymentsSecret)
    .update(body)
    .digest('base64')
  
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('Content-HMAC') || ''
    
    // Проверяем подпись
    if (!verifySignature(body, signature)) {
      console.error("Invalid CloudPayments signature")
      return NextResponse.json({ code: 13 }) // Неверная подпись
    }
    
    const data = JSON.parse(body)
    const { Type, Data } = data
    
    console.log(`CloudPayments webhook: ${Type}`, Data)
    
    switch (Type) {
      case 'Pay':
        // Успешная оплата
        await handlePayment(Data)
        break
        
      case 'Fail':
        // Неуспешная оплата
        await handleFailedPayment(Data)
        break
        
      case 'Refund':
        // Возврат средств
        await handleRefund(Data)
        break
        
      case 'Check':
        // Проверка заказа перед оплатой
        return handleCheck(Data)
        
      default:
        console.log(`Unknown CloudPayments webhook type: ${Type}`)
    }
    
    // Успешный ответ
    return NextResponse.json({ code: 0 })
    
  } catch (error) {
    console.error("CloudPayments webhook error:", error)
    return NextResponse.json({ code: 13 }) // Временная ошибка
  }
}

async function handleCheck(data: any) {
  try {
    const { Amount, Email, Data: customData } = data
    
    // Проверяем, существует ли товар/курс
    if (customData?.courseId) {
      const { data: course } = await supabaseAdmin
        .from('courses')
        .select('id, price')
        .eq('id', customData.courseId)
        .single()
        
      if (!course) {
        return NextResponse.json({ 
          code: 10, 
          message: "Курс не найден" 
        })
      }
      
      // Проверяем цену (с учетом возможной скидки)
      const expectedAmount = customData.discountPercent 
        ? Math.round(course.price * (100 - customData.discountPercent) / 100)
        : course.price
        
      if (Math.abs(Amount - expectedAmount) > 0.01) {
        return NextResponse.json({ 
          code: 11, 
          message: "Неверная сумма платежа" 
        })
      }
    }
    
    // Все проверки пройдены
    return NextResponse.json({ code: 0 })
    
  } catch (error) {
    console.error("Check handler error:", error)
    return NextResponse.json({ code: 13 })
  }
}

async function handlePayment(data: any) {
  try {
    const { 
      TransactionId, 
      Amount, 
      Email, 
      Data: customData,
      DateTime,
      CardFirstSix,
      CardLastFour,
      CardType,
      Description
    } = data
    
    // Сохраняем информацию о платеже
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        transaction_id: TransactionId,
        amount: Amount,
        email: Email,
        description: Description,
        status: 'success',
        card_info: {
          first_six: CardFirstSix,
          last_four: CardLastFour,
          type: CardType
        },
        custom_data: customData,
        paid_at: DateTime,
        created_at: new Date().toISOString()
      })
    
    if (paymentError) {
      console.error("Error saving payment:", paymentError)
    }
    
    // Предоставляем доступ к курсу
    if (customData?.courseId && Email) {
      // Находим или создаем пользователя
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', Email)
        .single()
      
      if (user) {
        // Предоставляем доступ к курсу
        await supabaseAdmin
          .from('course_access')
          .upsert({
            user_id: user.id,
            course_id: customData.courseId,
            payment_id: TransactionId,
            expires_at: null, // Бессрочный доступ
            created_at: new Date().toISOString()
          })
      }
    }
    
    // Записываем на тренировку
    if (customData?.bookingId) {
      await supabaseAdmin
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_id: TransactionId,
          paid_at: DateTime
        })
        .eq('id', customData.bookingId)
    }
    
    // Применяем промокод (увеличиваем счетчик использований)
    if (customData?.promoCode) {
      await supabaseAdmin.rpc('increment_promo_usage', {
        code: customData.promoCode
      })
    }
    
    // TODO: Отправить email с подтверждением
    
  } catch (error) {
    console.error("Payment handler error:", error)
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { TransactionId, Reason, ReasonCode } = data
    
    // Сохраняем неудачную попытку
    await supabaseAdmin
      .from('payments')
      .insert({
        transaction_id: TransactionId,
        status: 'failed',
        error: {
          reason: Reason,
          code: ReasonCode
        },
        created_at: new Date().toISOString()
      })
      
  } catch (error) {
    console.error("Failed payment handler error:", error)
  }
}

async function handleRefund(data: any) {
  try {
    const { TransactionId, Amount, OriginalTransactionId } = data
    
    // Обновляем статус платежа
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount: Amount,
        refunded_at: new Date().toISOString()
      })
      .eq('transaction_id', OriginalTransactionId)
    
    // Отзываем доступ к курсу
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('custom_data, email')
      .eq('transaction_id', OriginalTransactionId)
      .single()
      
    if (payment?.custom_data?.courseId) {
      await supabaseAdmin
        .from('course_access')
        .delete()
        .eq('payment_id', OriginalTransactionId)
    }
    
  } catch (error) {
    console.error("Refund handler error:", error)
  }
}