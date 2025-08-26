import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = (searchParams.get('code') || '').toUpperCase()
  const amount = Number(searchParams.get('amount') || '0')

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  // Try Supabase first
  const { data: promo } = await supabaseAdmin
    .from('promocodes')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .lte('start_at', new Date().toISOString())
    .gte('end_at', new Date().toISOString())
    .maybeSingle()

  if (!promo) {
    return NextResponse.json({ valid: false, error: 'Invalid or inactive code' })
  }

  if (promo.min_amount && amount < Number(promo.min_amount)) {
    return NextResponse.json({ valid: false, error: `Минимальная сумма ${promo.min_amount} ₽` })
  }

  const percent = Number(promo.discount_percent || 0)
  const finalAmount = Math.max(0, Math.round((amount * (100 - percent)) / 100))
  return NextResponse.json({ valid: true, discountPercent: percent, finalAmount })
}

