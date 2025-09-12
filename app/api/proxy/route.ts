import { NextRequest, NextResponse } from "next/server"
import { proxyManager, ProxyConfig } from "@/lib/proxy-manager"

// Получение всех прокси
export async function GET(request: NextRequest) {
  try {
    const stats = proxyManager.getStats()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка получения прокси" },
      { status: 500 }
    )
  }
}

// Добавление нового прокси
export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка добавления прокси" },
      { status: 500 }
    )
  }
}

// Обновление прокси
export async function PUT(request: NextRequest) {
  try {
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
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка обновления прокси" },
      { status: 500 }
    )
  }
}

// Удаление прокси
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
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
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка удаления прокси" },
      { status: 500 }
    )
  }
}
