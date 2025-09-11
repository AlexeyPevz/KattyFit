import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { headers } from "next/headers"

// Vercel Cron (или любой другой планировщик) дергает этот эндпоинт раз в минуту
// Он находит публикации со статусом pending и временем <= now и пытается опубликовать

async function publishToPlatform(platform: string, content: Record<string, unknown>, language: string) {
  // Мини-роутер: используем те же функции, что и в content/publish
  // Чтобы избежать дублирования, можно вынести общий модуль. Здесь — упрощенно через внутренний вызов API.
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/content/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId: content.id, platforms: [platform], languages: [language] })
  })
  const data = await res.json()
  return data.success
}

export async function POST(request: NextRequest) {
  try {
    // Простейшая защита по токену
    const token = request.headers.get('x-cron-token')
    if ((process.env.SCHEDULER_TOKEN || '') && token !== process.env.SCHEDULER_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const nowIso = new Date().toISOString()
    // Берем отложенные задачи
    const { data: pending, error } = await supabaseAdmin
      .from('publications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', nowIso)
      .limit(25)

    if (error) throw error

    for (const pub of pending || []) {
      // Достаём контент
      const { data: content } = await supabaseAdmin
        .from('content')
        .select('*')
        .eq('id', pub.content_id)
        .single()

      if (!content) {
        await supabaseAdmin
          .from('publications')
          .update({ status: 'failed', error: 'Content not found' })
          .eq('id', pub.id)
        continue
      }

      // Пытаемся опубликовать через уже существующий механизм
      try {
        // В идеале — вызвать внутренний publisher по платформе, но для простоты — reuse POST /api/content/publish на 1 платформу/язык
        const ok = await publishToPlatform(pub.platform, content, pub.language)
        if (!ok) throw new Error('Publish failed')
        // Если ok — статус этой публикации будет обновлён тем маршрутом
      } catch (e: Error | unknown) {
        await supabaseAdmin
          .from('publications')
          .update({ status: 'failed', error: e?.message || 'Scheduler failed' })
          .eq('id', pub.id)
      }
    }

    return NextResponse.json({ success: true, processed: pending?.length || 0 })
  } catch (e: Error | unknown) {
    return NextResponse.json({ error: e?.message || 'Scheduler error' }, { status: 500 })
  }
}
