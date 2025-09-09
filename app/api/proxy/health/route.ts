import { NextRequest, NextResponse } from "next/server"
import { proxyManager } from "@/lib/proxy-manager"
import { checkServiceAvailability } from "@/lib/proxy-manager"
import { apiHandler } from "@/lib/api-utils"

// Проверка здоровья всех прокси
export const POST = apiHandler(async (request: NextRequest) => {
  await proxyManager.healthCheckAll()
  
  const stats = proxyManager.getStats()
  
  return NextResponse.json({
    success: true,
    stats
  })
})

// Проверка конкретного прокси
export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const proxyId = searchParams.get("proxyId")
  const serviceUrl = searchParams.get("serviceUrl")
  
  if (proxyId) {
    // Проверка конкретного прокси
    const isHealthy = await proxyManager.healthCheck(proxyId)
    
    return NextResponse.json({
      success: true,
      proxyId,
      isHealthy
    })
  }
  
  if (serviceUrl) {
    // Проверка доступности сервиса
    const availability = await checkServiceAvailability(serviceUrl)
    
    return NextResponse.json({
      success: true,
      serviceUrl,
      ...availability
    })
  }
  
  return NextResponse.json(
    { error: "Необходимо указать proxyId или serviceUrl" },
    { status: 400 }
  )
})