import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const email = searchParams.get("email")

    if (!courseId || !email) {
      return NextResponse.json(
        { error: "Missing courseId or email" },
        { status: 400 }
      )
    }

    // Проверяем доступ к курсу
    const { data: access, error } = await supabase
      .from("course_access")
      .select("*")
      .eq("user_email", email)
      .eq("course_id", courseId)
      .is("revoked_at", null)
      .single()

    if (error || !access) {
      return NextResponse.json({
        hasAccess: false,
        message: "No access to this course"
      })
    }

    // Проверяем срок действия доступа
    if (access.expires_at && new Date(access.expires_at) < new Date()) {
      return NextResponse.json({
        hasAccess: false,
        message: "Access expired",
        expiredAt: access.expires_at
      })
    }

    // Получаем прогресс прохождения
    const { data: progress } = await supabase
      .from("course_progress")
      .select("*")
      .eq("user_email", email)
      .eq("course_id", courseId)

    return NextResponse.json({
      hasAccess: true,
      access: {
        purchaseId: access.purchase_id,
        createdAt: access.created_at,
        expiresAt: access.expires_at
      },
      progress: progress || []
    })
  } catch (error) {
    console.error("Error checking course access:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
