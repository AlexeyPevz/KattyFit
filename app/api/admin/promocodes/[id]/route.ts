import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"

// PATCH - обновить промокод
export const PATCH = apiHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const body = await request.json()
  const { id } = params
  
  const { data: promocode, error } = await supabaseAdmin
    .from('promocodes')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
    
  if (error) {
    console.error('Error updating promocode:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить промокод' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ promocode })
})

// DELETE - удалить промокод
export const DELETE = apiHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params
  
  const { error } = await supabaseAdmin
    .from('promocodes')
    .delete()
    .eq('id', id)
    
  if (error) {
    console.error('Error deleting promocode:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить промокод' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ success: true })
})