import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"
import logger from "@/lib/logger"

export const POST = apiHandler(async (request: NextRequest) => {
  const { events } = await request.json()
  
  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ success: true })
  }
  
  // Подготавливаем события для записи
  const analyticsEvents = events.map(event => ({
    event_name: event.event,
    event_properties: event.properties || {},
    user_id: event.userId,
    session_id: event.sessionId,
    created_at: event.timestamp || new Date().toISOString()
  }))
  
  // Сохраняем в БД (если таблица существует)
  try {
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert(analyticsEvents)
      
    if (error) {
      logger.error('Analytics insert error', { error: error instanceof Error ? error.message : String(error) })
      // Не возвращаем ошибку клиенту - аналитика не должна ломать UX
    }
  } catch (error) {
    // Игнорируем ошибки аналитики
    logger.error('Analytics error', { error: error instanceof Error ? error.message : String(error) })
  }
  
  // Агрегируем метрики в реальном времени
  await updateRealtimeMetrics(events)
  
  return NextResponse.json({ success: true })
})

// Обновление метрик в реальном времени
async function updateRealtimeMetrics(events: any[]) {
  const today = new Date().toISOString().split('T')[0]
  
  for (const event of events) {
    try {
      // Обновляем счетчики событий
      if (event.event === 'page_view') {
        await incrementMetric('page_views', today)
      } else if (event.event === 'purchase_completed') {
        await incrementMetric('purchases', today, event.properties?.amount)
      } else if (event.event === 'booking_created') {
        await incrementMetric('bookings', today)
      } else if (event.event === 'user_signed_up') {
        await incrementMetric('signups', today)
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }
}

async function incrementMetric(
  metric: string, 
  date: string, 
  value: number = 1
) {
  // Используем upsert для атомарного обновления
  await supabaseAdmin.rpc('increment_metric', {
    metric_name: metric,
    metric_date: date,
    increment_value: value
  })
}
