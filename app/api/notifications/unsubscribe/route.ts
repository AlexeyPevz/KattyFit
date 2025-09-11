import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"
import logger from "@/lib/logger"

export const POST = apiHandler(async (request: NextRequest) => {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      )
    }

    // Remove subscription from database
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)

    if (error) {
      logger.error("Error removing subscription", { error: error instanceof Error ? error.message : String(error) })
      return NextResponse.json(
        { error: "Failed to remove subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Unsubscription error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to process unsubscription" },
      { status: 500 }
    )
  }
})
