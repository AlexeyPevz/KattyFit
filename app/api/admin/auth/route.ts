import { NextRequest, NextResponse } from "next/server"
import { AdminCredentials, AuthSession, User } from "@/types/api"
import { AppError, AuthenticationError, ValidationError } from "@/types/errors"
import { withErrorHandler } from "@/lib/error-handler"

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
  const { username, password }: AdminCredentials = body

  // Валидация входных данных
  if (!username || !password) {
    throw new ValidationError('Username and password are required', [
      { field: 'username', message: 'Username is required', code: 'REQUIRED' },
      { field: 'password', message: 'Password is required', code: 'REQUIRED' }
    ])
  }

  // Проверка rate limit
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    throw new AppError(
      'Too many login attempts. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429,
      'medium'
    )
  }

  // Очистка и валидация входных данных
  const cleanUsername = username.trim()
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
      'CONFIGURATION_ERROR',
      500,
      'critical'
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