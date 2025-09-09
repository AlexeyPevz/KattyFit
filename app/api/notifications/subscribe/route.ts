import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    
    // Получаем ID пользователя из сессии
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("admin_session")
    
    let userId = null
    let userType = "guest"
    
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value)
        userId = session.userId || session.username
        userType = "admin"
      } catch (e) {
        console.error("Ошибка парсинга сессии:", e)
      }
    }

    // Проверяем, существует ли уже такая подписка
    const { data: existing } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", subscription.endpoint)
      .single()

    if (existing) {
      // Обновляем существующую подписку
      await supabaseAdmin
        .from("push_subscriptions")
        .update({
          user_id: userId,
          user_type: userType,
          subscription_data: subscription,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
    } else {
      // Создаем новую подписку
      await supabaseAdmin
        .from("push_subscriptions")
        .insert({
          user_id: userId,
          user_type: userType,
          endpoint: subscription.endpoint,
          subscription_data: subscription,
          platform: detectPlatform(request.headers.get("user-agent") || ""),
          is_active: true
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка сохранения подписки:", error)
    return NextResponse.json(
      { error: "Не удалось сохранить подписку" },
      { status: 500 }
    )
  }
}

function detectPlatform(userAgent: string): string {
  if (/android/i.test(userAgent)) return "android"
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios"
  if (/windows/i.test(userAgent)) return "windows"
  if (/mac/i.test(userAgent)) return "macos"
  if (/linux/i.test(userAgent)) return "linux"
  return "unknown"
}
