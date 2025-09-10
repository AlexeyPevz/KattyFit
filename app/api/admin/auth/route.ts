import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

// Simple in-memory rate limiting (in production use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5 // Max 5 attempts per 15 minutes
  
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ 
        error: "Слишком много попыток",
        details: "Попробуйте через 15 минут"
      }, { status: 429 })
    }

    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ 
        error: "Неверные данные",
        details: "Логин и пароль обязательны"
      }, { status: 400 })
    }

    // Sanitize input
    const cleanUsername = String(username).trim()
    const cleanPassword = String(password).trim()

    if (cleanUsername.length === 0 || cleanPassword.length === 0) {
      return NextResponse.json({ 
        error: "Неверные данные",
        details: "Логин и пароль не могут быть пустыми"
      }, { status: 400 })
    }

    // Get credentials from environment variables
    const expectedUser = env.adminUsernamePublic
    const expectedPass = env.adminPassword

    // Check if credentials are properly configured
    if (!expectedUser || !expectedPass) {
      console.error("Admin credentials not properly configured")
      return NextResponse.json({ 
        error: "Ошибка конфигурации",
        details: "Админские учетные данные не настроены. Обратитесь к администратору."
      }, { status: 500 })
    }

    // Log for debugging (remove in production)
    console.log("Admin auth attempt:", { 
      provided: { username: cleanUsername, password: cleanPassword ? "***" : "empty" },
      expected: { username: expectedUser, password: expectedPass ? "***" : "empty" },
      envVars: {
        hasUsername: !!process.env.ADMIN_USERNAME,
        hasPassword: !!process.env.ADMIN_PASSWORD
      }
    })

    if (cleanUsername === expectedUser && cleanPassword === expectedPass) {
      // Generate session token for additional security
      const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
      
      const res = NextResponse.json({ 
        success: true, 
        username: cleanUsername,
        message: "Успешная аутентификация" 
      })
      
      // Set secure cookie
      res.cookies.set("admin_auth", sessionToken, {
        httpOnly: true,
        sameSite: "strict", // More secure than "lax"
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      })
      
      return res
    }

    return NextResponse.json({ 
      error: "Неверный логин или пароль",
      details: "Проверьте правильность введенных данных"
    }, { status: 401 })
  } catch (e) {
    console.error("Admin auth error:", e)
    return NextResponse.json({ 
      error: "Ошибка сервера",
      details: "Попробуйте еще раз позже"
    }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("admin_auth", "", { path: "/", maxAge: 0 })
  return res
}
