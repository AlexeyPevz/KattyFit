import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Получаем настройки из базы данных
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*")
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json(data || {})
  } catch (error) {
    console.error("Ошибка загрузки настроек:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки настроек" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Сохраняем настройки в базу данных
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({
        id: 1, // Единственная запись настроек
        ...settings,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Настройки сохранены"
    })
  } catch (error) {
    console.error("Ошибка сохранения настроек:", error)
    return NextResponse.json(
      { error: "Ошибка сохранения настроек" },
      { status: 500 }
    )
  }
}