import { NextRequest, NextResponse } from "next/server"
import { getGeolocationFromHeaders } from "@/lib/geolocation"
import logger from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Сначала пробуем получить из заголовков (Cloudflare, Vercel)
    const headers = request.headers
    const headerGeo = getGeolocationFromHeaders(headers)
    
    if (headerGeo && headerGeo.countryCode !== 'XX') {
      return NextResponse.json(headerGeo)
    }

    // Если из заголовков не получилось, используем внешний сервис
    const clientIp = headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     headers.get('x-real-ip') ||
                     headers.get('cf-connecting-ip') ||
                     'unknown'

    // Используем ipapi.co с серверной стороны
    try {
      const response = await fetch(`https://ipapi.co/${clientIp}/json/`)
      if (response.ok) {
        const data = await response.json()
        
        // Проверяем на ошибку в ответе API
        if (data.error || data.reason === 'RateLimited') {
          logger.warn('ipapi.co returned error', { data })
          throw new Error('Geolocation API error')
        }
        
        return NextResponse.json({
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'XX',
          city: data.city || undefined,
          ip: clientIp
        })
      }
    } catch (error) {
      logger.error('ipapi.co error', { error: error instanceof Error ? error.message : String(error) })
    }

    // Fallback
    return NextResponse.json({
      country: 'Unknown',
      countryCode: 'XX',
      ip: clientIp
    })

  } catch (error) {
    logger.error('Geolocation API error', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to get geolocation' },
      { status: 500 }
    )
  }
}
