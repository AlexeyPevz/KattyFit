import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"

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
      console.error("Error saving subscription:", error)
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    )
  }
})
