import { NextRequest, NextResponse } from "next/server"

// Simple in-memory compatible validator. In v0, you can back this by Supabase table `promocodes`
const PROMOS: Record<string, { percent: number; active: boolean }> = {
  KATTY10: { percent: 10, active: true },
  KATTY20: { percent: 20, active: true },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = (searchParams.get('code') || '').toUpperCase()
  const amount = Number(searchParams.get('amount') || '0')

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  const promo = PROMOS[code]
  if (!promo || !promo.active) {
    return NextResponse.json({ valid: false, error: 'Invalid code' }, { status: 200 })
  }

  // Optionally validate minimal amounts, expirations, usage limits, etc.
  return NextResponse.json({ valid: true, discountPercent: promo.percent, finalAmount: Math.max(0, Math.round(amount * (100 - promo.percent) / 100)) })
}

