import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import logger from "@/lib/logger"

export async function GET() {
  try {
    // Проверяем наличие реальных данных в базе
    const [lessonsResult, usersResult, coursesResult, bookingsResult] = await Promise.allSettled([
      supabaseAdmin
        .from("lessons")
        .select("id")
        .not("is_demo", "eq", true)
        .limit(1),
      supabaseAdmin
        .from("users")
        .select("id")
        .not("is_demo", "eq", true)
        .limit(1),
      supabaseAdmin
        .from("courses")
        .select("id")
        .not("is_demo", "eq", true)
        .limit(1),
      supabaseAdmin
        .from("bookings")
        .select("id")
        .not("is_demo", "eq", true)
        .limit(1),
    ])

    const hasRealLessons = lessonsResult.status === "fulfilled" && 
      lessonsResult.value.data && lessonsResult.value.data.length > 0
    const hasRealUsers = usersResult.status === "fulfilled" && 
      usersResult.value.data && usersResult.value.data.length > 0
    const hasRealCourses = coursesResult.status === "fulfilled" && 
      coursesResult.value.data && coursesResult.value.data.length > 0
    const hasRealBookings = bookingsResult.status === "fulfilled" && 
      bookingsResult.value.data && bookingsResult.value.data.length > 0

    return NextResponse.json({
      hasRealLessons,
      hasRealUsers,
      hasRealCourses,
      hasRealBookings,
      hasAnyRealData: hasRealLessons || hasRealUsers || hasRealCourses || hasRealBookings,
    })
  } catch (error) {
    logger.error("Ошибка проверки демо данных", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка проверки демо данных" },
      { status: 500 }
    )
  }
}
