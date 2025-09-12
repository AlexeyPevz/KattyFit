import { NextRequest, NextResponse } from "next/server"
import { AdminCredentials, AuthSession, User } from "@/types/api"
import { AppError, AuthenticationError, ValidationError, ErrorCode, ErrorSeverity } from "@/types/errors"
import { withErrorHandler } from "@/lib/error-handler"
import { z } from "zod"

// ===== ZOD СХЕМЫ ВАЛИДАЦИИ =====

const AdminLoginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or less')
    .transform(username => username.trim()),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must be 100 characters or less'),
})

// Simple in-memory rate limiting (in production use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }
  
  if (limit.count >= 5) { // Max 5 attempts per 15 minutes
    return false
  }
  
  limit.count++
  return true
}

async function handleAdminLogin(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  
  // Валидация с помощью Zod
  const validationResult = AdminLoginSchema.safeParse(body)
  
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code || 'VALIDATION_ERROR'
    }))
    
    throw new ValidationError('Validation failed', fieldErrors)
  }

  const { username, password } = validationResult.data

  // Проверка rate limit
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    throw new AppError(
      'Too many login attempts. Please try again later.',
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      ErrorSeverity.MEDIUM
    )
  }

  // Очистка и валидация входных данных
  const cleanUsername = username
  const cleanPassword = password.trim()

  if (cleanUsername.length < 3 || cleanPassword.length < 6) {
    throw new ValidationError('Invalid credentials format', [
      { field: 'username', message: 'Username must be at least 3 characters', code: 'MIN_LENGTH' },
      { field: 'password', message: 'Password must be at least 6 characters', code: 'MIN_LENGTH' }
    ])
  }

  // Получение учетных данных из переменных окружения
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedUser || !expectedPass) {
    throw new AppError(
      'Admin credentials not configured',
      ErrorCode.CONFIGURATION_ERROR,
      500,
      ErrorSeverity.CRITICAL
    )
  }

  // Проверка учетных данных
  if (cleanUsername !== expectedUser || cleanPassword !== expectedPass) {
    throw new AuthenticationError('Invalid credentials')
  }

  // Генерация криптографически стойкого токена сессии
  const crypto = await import('crypto')
  const sessionToken = crypto.randomBytes(32).toString('hex')
  
  // Создание пользователя администратора
  const adminUser: User = {
    id: 'admin',
    email: cleanUsername,
    name: 'Administrator',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }

  // Создание сессии
  const session: AuthSession = {
    user: adminUser,
    token: sessionToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 часа
  }
  
  const res = NextResponse.json({ 
    success: true, 
    user: adminUser,
    message: "Authentication successful" 
  })
  
  // Установка безопасного HTTP-only cookie
  res.cookies.set('admin_auth', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 часа
    path: '/'
  })
  
  return res
}

async function handleAdminLogout(): Promise<NextResponse> {
  const res = NextResponse.json({ 
    success: true, 
    message: "Logged out successfully" 
  })
  
  // Очистка cookie
  res.cookies.set('admin_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })
  
  return res
}

export const POST = withErrorHandler(handleAdminLogin)
export const DELETE = withErrorHandler(handleAdminLogout)
