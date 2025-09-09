import { NextRequest, NextResponse } from "next/server"
import { proxyManager } from "@/lib/proxy-manager"
import { checkServiceAvailability } from "@/lib/proxy-manager"

// Проверка здоровья всех прокси
export async function POST(request: NextRequest) {
  try {
    await proxyManager.healthCheckAll()
    
    const stats = proxyManager.getStats()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка проверки здоровья прокси" },
      { status: 500 }
    )
  }
}

// Проверка конкретного прокси
export async function GET(request: NextRequest) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка проверки прокси" },
      { status: 500 }
    )
  }
}
