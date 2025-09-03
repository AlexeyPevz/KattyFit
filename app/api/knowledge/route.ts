import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const type = searchParams.get("type")

    let dbQuery = supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    // Фильтрация по типу
    if (type && type !== "all") {
      dbQuery = dbQuery.eq("type", type)
    }

    // Поиск по тексту (защита от SQL injection)
    if (query) {
      const sanitizedQuery = query.replace(/[%_]/g, '\\$&')
      dbQuery = dbQuery.or(`question.ilike.%${sanitizedQuery}%,answer.ilike.%${sanitizedQuery}%`)
    }

    const { data, error } = await dbQuery

    if (error) throw error

    return NextResponse.json({
      success: true,
      items: data || []
    })
  } catch (error) {
    console.error("Ошибка загрузки базы знаний:", error)
    return NextResponse.json(
      { error: "Ошибка загрузки базы знаний" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, question, answer, context } = body

    // Валидация обязательных полей
    if (!type || !question || !answer) {
      return NextResponse.json(
        { error: "Поля type, question и answer обязательны" },
        { status: 400 }
      )
    }

    // Валидация типа
    const validTypes = ['faq', 'dialog_example', 'course_info', 'pricing']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Недопустимый тип элемента" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .insert({
        type,
        question,
        answer,
        context,
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      item: data
    })
  } catch (error) {
    console.error("Ошибка создания элемента:", error)
    return NextResponse.json(
      { error: "Ошибка создания элемента" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, question, answer, context } = body

    const { data, error } = await supabaseAdmin
      .from("knowledge_base")
      .update({
        type,
        question,
        answer,
        context,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      item: data
    })
  } catch (error) {
    console.error("Ошибка обновления элемента:", error)
    return NextResponse.json(
      { error: "Ошибка обновления элемента" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID не указан" },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from("knowledge_base")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error("Ошибка удаления элемента:", error)
    return NextResponse.json(
      { error: "Ошибка удаления элемента" },
      { status: 500 }
    )
  }
}