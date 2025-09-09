import { NextRequest, NextResponse } from "next/server"

// Простой in-memory rate limiter для v0
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  key: string, 
  limit = 10, 
  windowMs = 60000 // 1 минута
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

// Централизованный обработчик API
export function apiHandler<T = any>(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Rate limiting по IP
      const ip = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown'
      
      const rateLimitKey = `${req.method}:${req.nextUrl.pathname}:${ip}`
      
      // Более высокие лимиты для некоторых эндпоинтов
      const isUpload = req.nextUrl.pathname.includes('/upload')
      const limit = isUpload ? 5 : 30
      
      if (!rateLimit(rateLimitKey, limit)) {
        return NextResponse.json(
          { error: 'Слишком много запросов. Попробуйте позже.' },
          { status: 429 }
        )
      }
      
      // Вызываем основной обработчик
      return await handler(req, context)
      
    } catch (error) {
      console.error('API Error:', {
        method: req.method,
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Проверяем известные типы ошибок
      if (error instanceof Error) {
        if (error.message.includes('NEXT_PUBLIC_SUPABASE_URL')) {
          return NextResponse.json(
            { error: 'Сервис временно недоступен. Проверьте конфигурацию.' },
            { status: 503 }
          )
        }
        
        if (error.message.includes('duplicate key')) {
          return NextResponse.json(
            { error: 'Такая запись уже существует' },
            { status: 409 }
          )
        }
        
        if (error.message.includes('violates foreign key')) {
          return NextResponse.json(
            { error: 'Неверные связанные данные' },
            { status: 400 }
          )
        }
      }
      
      // Общая ошибка
      return NextResponse.json(
        { error: 'Произошла ошибка. Попробуйте позже.' },
        { status: 500 }
      )
    }
  }
}

// Валидация входных данных
export function validateRequired(
  data: Record<string, any>, 
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `Поле "${field}" обязательно`
    }
  }
  return null
}

// Безопасное получение user ID из сессии
export async function getUserFromRequest(
  req: NextRequest
): Promise<{ id: string; email: string } | null> {
  // Для v0 используем простую проверку через email в headers/cookies
  const email = req.headers.get('x-user-email') || 
                req.cookies.get('userEmail')?.value
  
  if (!email) {
    return null
  }
  
  // В реальном приложении здесь проверка JWT токена
  return { 
    id: email, // Используем email как ID для простоты
    email 
  }
}

// Логирование событий
export function logEvent(
  event: string,
  data: Record<string, any>
) {
  // В продакшене отправляем в систему аналитики
  console.log(`[${new Date().toISOString()}] ${event}:`, data)
}

// CORS headers для API
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
