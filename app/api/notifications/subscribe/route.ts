import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"
import logger from "@/lib/logger"

export const POST = apiHandler(async (request: NextRequest) => {
  try {
    const { subscription } = await request.json()

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription data is required" },
        { status: 400 }
      )
    }

    // Save subscription to database
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: request.headers.get("user-agent") || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "endpoint"
      })

    if (error) {
      logger.error("Error saving subscription", { error: error instanceof Error ? error.message : String(error) })
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Subscription error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    )
  }
})
