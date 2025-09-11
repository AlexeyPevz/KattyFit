import { NextResponse } from "next/server"
import { checkV0Configuration } from "@/lib/v0-config-check"

export async function GET() {
  try {
    const status = checkV0Configuration()
    
    return NextResponse.json(status)
  } catch (error) {
    console.error("Config status check error:", error)
    return NextResponse.json(
      { 
        error: "Ошибка проверки конфигурации",
        isConfigured: false,
        missingVars: [],
        warnings: [],
        recommendations: []
      },
      { status: 500 }
    )
  }
}