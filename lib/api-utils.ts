import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export function apiHandler(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (error) {
      console.error("API Error:", error)
      return NextResponse.json(
        { error: "Внутренняя ошибка сервера" },
        { status: 500 }
      )
    }
  }
}

export async function logEvent(eventType: string, data: any) {
  try {
    await supabaseAdmin
      .from("analytics_events")
      .insert({
        event_type: eventType,
        event_data: data,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error("Ошибка логирования события:", error)
  }
}

export function validateAdminAuth(request: NextRequest): boolean {
  // В реальном приложении здесь должна быть проверка JWT токена
  // Для демо просто проверяем заголовок
  const authHeader = request.headers.get("authorization")
  return !!authHeader
}

export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return "unknown"
}

export function validateRequired(data: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return `Поле '${field}' обязательно для заполнения`
    }
  }
  return null
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}