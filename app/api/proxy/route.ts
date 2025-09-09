import { NextRequest, NextResponse } from "next/server"
import { proxyManager, ProxyConfig } from "@/lib/proxy-manager"
import { apiHandler } from "@/lib/api-utils"

// Получение всех прокси
export const GET = apiHandler(async (request: NextRequest) => {
  const stats = proxyManager.getStats()
  
  return NextResponse.json({
    success: true,
    stats
  })
})

// Добавление нового прокси
export const POST = apiHandler(async (request: NextRequest) => {
  const config: Omit<ProxyConfig, 'id'> = await request.json()
  
  // Генерируем ID
  const id = `proxy-${Date.now()}-${Math.random().toString(36).substring(7)}`
  
  const fullConfig: ProxyConfig = {
    ...config,
    id
  }
  
  proxyManager.addProxy(fullConfig)
  
  return NextResponse.json({
    success: true,
    proxy: fullConfig
  })
})

// Обновление прокси
export const PUT = apiHandler(async (request: NextRequest) => {
  const { id, ...updates } = await request.json()
  
  if (!id) {
    return NextResponse.json(
      { error: "ID прокси обязателен" },
      { status: 400 }
    )
  }
  
  proxyManager.updateProxy(id, updates)
  
  return NextResponse.json({
    success: true,
    message: "Прокси обновлен"
  })
})

// Удаление прокси
export const DELETE = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json(
      { error: "ID прокси обязателен" },
      { status: 400 }
    )
  }
  
  proxyManager.removeProxy(id)
  
  return NextResponse.json({
    success: true,
    message: "Прокси удален"
  })
})