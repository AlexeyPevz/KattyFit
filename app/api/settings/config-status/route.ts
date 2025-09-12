import { NextResponse } from "next/server"
import { checkV0Configuration } from "@/lib/v0-config-check"
import logger from "@/lib/logger"

export async function GET() {
  try {
    const status = checkV0Configuration()
    
    return NextResponse.json(status)
  } catch (error) {
    logger.error("Config status check error", { error: error instanceof Error ? error.message : String(error) })
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