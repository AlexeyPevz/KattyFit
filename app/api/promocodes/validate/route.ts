import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"

export const GET = apiHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const code = (searchParams.get('code') || '').toUpperCase()
  const amount = Number(searchParams.get('amount') || '0')

  if (!code) {
    return NextResponse.json({ error: 'Промокод обязателен' }, { status: 400 })
  }

  // Получаем промокод из БД
  const { data: promo } = await supabaseAdmin
    .from('promocodes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (!promo) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Промокод недействителен или не существует' 
    })
  }

  // Проверяем срок действия
  const now = new Date()
  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Промокод еще не активен' 
    })
  }
  
  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Срок действия промокода истек' 
    })
  }

  // Проверяем лимит использований
  if (promo.max_uses && promo.usage_count >= promo.max_uses) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Промокод больше не может быть использован' 
    })
  }

  const percent = Number(promo.discount_percent || 0)
  const discountAmount = Math.round((amount * percent) / 100)
  const finalAmount = Math.max(0, amount - discountAmount)
  
  return NextResponse.json({ 
    valid: true, 
    discountPercent: percent,
    discountAmount,
    finalAmount,
    promocode: {
      code: promo.code,
      description: `Скидка ${percent}%`
    }
  })
})

