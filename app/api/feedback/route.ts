import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Схема валидации для фидбека
const feedbackSchema = z.object({
  message: z.string().min(1, 'Сообщение обязательно'),
  email: z.string().email('Некорректный email').optional(),
  name: z.string().min(1, 'Имя обязательно').optional(),
  rating: z.number().min(1).max(5).optional(),
  category: z.enum(['bug', 'feature', 'general', 'performance']).optional(),
  url: z.string().url().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация данных
    const validatedData = feedbackSchema.parse(body)
    
    // Логируем фидбек
    logger.info('Feedback received', {
      category: validatedData.category,
      rating: validatedData.rating,
      hasMessage: !!validatedData.message,
      hasName: !!validatedData.name,
      hasEmail: !!validatedData.email,
      url: validatedData.url,
    })
    
    // Здесь можно добавить сохранение в базу данных
    // Например, в Supabase или другую БД
    
    // Отправляем уведомление администраторам (если нужно)
    if (validatedData.category === 'bug' || (validatedData.rating && validatedData.rating <= 2)) {
      logger.warn('Critical feedback received', {
        category: validatedData.category,
        rating: validatedData.rating,
        message: validatedData.message,
      })
    }
    
    return NextResponse.json(
      { success: true, message: 'Feedback received successfully' },
      { status: 200 }
    )
    
  } catch (error) {
    logger.error('Failed to process feedback', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    return NextResponse.json(
      { success: false, message: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}