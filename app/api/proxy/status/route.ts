import { NextRequest, NextResponse } from "next/server"
import { ProxyUtils } from "@/lib/smart-proxy"
import { apiHandler } from "@/lib/api-utils"

// Получение статуса всех прокси и сервисов
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
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
})

// Проверка конкретного сервиса
export const POST = apiHandler(async (request: NextRequest) => {
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
})