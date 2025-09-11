import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { apiHandler } from "@/lib/api-utils"
import logger from "@/lib/logger"

// PATCH - обновить промокод
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
  
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
      logger.error('Error updating promocode', { error: error instanceof Error ? error.message : String(error) })
      return NextResponse.json(
        { error: 'Не удалось обновить промокод' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ promocode })
  } catch (error: any) {
    logger.error("API Error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

// DELETE - удалить промокод
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { error } = await supabaseAdmin
      .from('promocodes')
      .delete()
      .eq('id', id)
      
    if (error) {
      logger.error('Error deleting promocode', { error: error instanceof Error ? error.message : String(error) })
      return NextResponse.json(
        { error: 'Не удалось удалить промокод' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error("API Error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
