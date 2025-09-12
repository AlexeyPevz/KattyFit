import { NextRequest, NextResponse } from "next/server"
import { ProxyUtils } from "@/lib/smart-proxy"

// Получение статуса всех прокси и сервисов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const checkServices = searchParams.get("checkServices") === "true"

    // Получаем статус прокси
    const proxyStatus = ProxyUtils.getProxyStatus()

    let serviceStatus = null
    if (checkServices) {
      // Проверяем доступность ключевых сервисов
      const services = [
        { name: "YouTube API", url: "https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1" },
        { name: "Instagram API", url: "https://graph.facebook.com/v17.0/me" },
        { name: "OpenAI API", url: "https://api.openai.com/v1/models" },
        { name: "ElevenLabs API", url: "https://api.elevenlabs.io/v1/voices" },
        { name: "ContentStudio API", url: "https://app.contentstudio.io/api/v1/accounts" }
      ]

      serviceStatus = await Promise.allSettled(
        services.map(async (service) => {
          const status = await ProxyUtils.checkService(service.url)
          return {
            name: service.name,
            url: service.url,
            ...status
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      proxy: proxyStatus,
      services: serviceStatus?.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      ) || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка получения статуса прокси" },
      { status: 500 }
    )
  }
}

// Проверка конкретного сервиса
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "URL обязателен" },
        { status: 400 }
      )
    }

    const status = await ProxyUtils.checkService(url)
    const proxyInfo = ProxyUtils.getProxyInfo(url)

    return NextResponse.json({
      success: true,
      url,
      ...status,
      proxyInfo
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка проверки сервиса" },
      { status: 500 }
    )
  }
}
