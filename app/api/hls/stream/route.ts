import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const email = searchParams.get('email')
    const videoUrl = searchParams.get('url')
    
    if (!courseId || !email || !videoUrl) {
      return NextResponse.json(
        { error: "Недостаточно параметров" },
        { status: 400 }
      )
    }
    
    // Проверяем доступ пользователя к курсу
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
      
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }
    
    // Проверяем доступ к курсу
    const { data: access } = await supabaseAdmin
      .from('course_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
      
    if (!access) {
      return NextResponse.json(
        { error: "Нет доступа к курсу" },
        { status: 403 }
      )
    }
    
    // Проксируем видео с оригинального URL
    const response = await fetch(videoUrl, {
      headers: {
        'Range': request.headers.get('range') || '',
        'Accept': request.headers.get('accept') || '*/*',
      }
    })
    
    const headers = new Headers()
    
    // Копируем важные заголовки
    const contentType = response.headers.get('content-type')
    if (contentType) headers.set('Content-Type', contentType)
    
    const contentLength = response.headers.get('content-length')
    if (contentLength) headers.set('Content-Length', contentLength)
    
    const contentRange = response.headers.get('content-range')
    if (contentRange) headers.set('Content-Range', contentRange)
    
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    
    // Логируем просмотр
    await supabaseAdmin
      .from('video_views')
      .insert({
        user_id: user.id,
        course_id: courseId,
        video_url: videoUrl,
        viewed_at: new Date().toISOString()
      })
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    })
    
  } catch (error) {
    console.error("HLS stream error:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки видео" },
      { status: 500 }
    )
  }
}
