import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler, validateRequired } from "@/lib/api-utils"

// GET - получить список промокодов
export const GET = apiHandler(async (request: NextRequest) => {
  const { data: promocodes, error } = await supabaseAdmin
    .from('promocodes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching promocodes:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить промокоды' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ promocodes: promocodes || [] })
})

// POST - создать новый промокод
export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json()
  
  const error = validateRequired(body, ['code', 'discount_percent'])
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
  
  const { code, discount_percent, max_uses, valid_until } = body
  
  // Проверяем уникальность кода
  const { data: existing } = await supabaseAdmin
    .from('promocodes')
    .select('id')
    .eq('code', code)
    .single()
    
  if (existing) {
    return NextResponse.json(
      { error: 'Промокод с таким кодом уже существует' },
      { status: 409 }
    )
  }
  
  // Создаем промокод
  const { data: promocode, error: createError } = await supabaseAdmin
    .from('promocodes')
    .insert({
      code: code.toUpperCase(),
      discount_percent: Math.min(100, Math.max(1, discount_percent)),
      max_uses: max_uses || null,
      valid_from: new Date().toISOString(),
      valid_until: valid_until || null,
      is_active: true,
      usage_count: 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
    
  if (createError) {
    console.error('Error creating promocode:', createError)
    return NextResponse.json(
      { error: 'Не удалось создать промокод' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ promocode })
})
