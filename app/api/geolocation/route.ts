import { NextRequest, NextResponse } from "next/server"
import { getGeolocationFromHeaders } from "@/lib/geolocation"

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
        return NextResponse.json({
          country: data.country_name || 'Unknown',
          countryCode: data.country_code || 'XX',
          city: data.city,
          ip: clientIp
        })
      }
    } catch (error) {
      console.error('ipapi.co error:', error)
    }

    // Fallback
    return NextResponse.json({
      country: 'Unknown',
      countryCode: 'XX',
      ip: clientIp
    })

  } catch (error) {
    console.error('Geolocation API error:', error)
    return NextResponse.json(
      { error: 'Failed to get geolocation' },
      { status: 500 }
    )
  }
}