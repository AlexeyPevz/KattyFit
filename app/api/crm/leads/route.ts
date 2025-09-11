import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import logger from "@/lib/logger"

// Функция для расчета Lead Score
function calculateLeadScore(lead: Record<string, unknown>): number {
  let score = 50 // Базовый score

  // Источник
  const sourceScores: Record<string, number> = {
    "Реферал": 20,
    "Instagram": 15,
    "Сайт": 10,
    "VK": 8,
    "Telegram": 8,
  }
  score += sourceScores[lead.source] || 5

  // Интерес к продукту
  if (lead.tags?.includes("vip")) score += 15
  if (lead.tags?.includes("пакет")) score += 10
  if (lead.tags?.includes("курс")) score += 8
  if (lead.tags?.includes("новичок")) score += 5

  // Активность
  if (lead.lastContact) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceContact < 1) score += 10
    else if (daysSinceContact < 3) score += 5
    else if (daysSinceContact > 7) score -= 10
  }

  // Потенциальная сумма сделки
  if (lead.value > 20000) score += 15
  else if (lead.value > 10000) score += 10
  else if (lead.value > 5000) score += 5

  return Math.min(100, Math.max(0, score))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      source,
      message,
      tags = [],
      value,
      metadata = {}
    } = body

    // Проверяем, существует ли уже такой лид
    const { data: existingLead } = await supabase
      .from("leads")
      .select("*")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single()

    if (existingLead) {
      // Обновляем существующий лид
      const { data: updatedLead, error: updateError } = await supabase
        .from("leads")
        .update({
          last_contact: new Date().toISOString(),
          notes: existingLead.notes + `\n\n${new Date().toLocaleDateString("ru-RU")}: ${message || "Повторное обращение"}`,
          tags: [...new Set([...existingLead.tags, ...tags])],
          metadata: { ...existingLead.metadata, ...metadata },
        })
        .eq("id", existingLead.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Создаем активность
      await supabase
        .from("lead_activities")
        .insert({
          lead_id: existingLead.id,
          type: "contact",
          description: message || "Повторное обращение",
          source,
        })

      return NextResponse.json({
        success: true,
        lead: updatedLead,
        isNew: false,
      })
    }

    // Создаем нового лида
    const leadData = {
      name,
      email,
      phone,
      source,
      stage: "new",
      value: value || 0,
      tags,
      notes: message || "",
      metadata,
      score: 0, // Будет рассчитан ниже
    }

    // Рассчитываем score
    leadData.score = calculateLeadScore(leadData)

    const { data: newLead, error: insertError } = await supabase
      .from("leads")
      .insert(leadData)
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Создаем первую активность
    await supabase
      .from("lead_activities")
      .insert({
        lead_id: newLead.id,
        type: "created",
        description: `Новый лид из ${source}`,
        metadata: { initial_message: message },
      })

    // Отправляем уведомление (в реальном приложении)
    // await sendNotification("new_lead", newLead)

    return NextResponse.json({
      success: true,
      lead: newLead,
      isNew: true,
    })
  } catch (error: Error | unknown) {
    logger.error("Error creating lead", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error.message || "Ошибка создания лида" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get("stage")
    const source = searchParams.get("source")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("leads")
      .select("*, lead_activities(count)")
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    // Фильтры
    if (stage && stage !== "all") {
      query = query.eq("stage", stage)
    }

    if (source && source !== "all") {
      query = query.eq("source", source)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data: leads, error, count } = await query

    if (error) {
      throw error
    }

    // Статистика
    const { data: stats } = await supabase
      .from("leads")
      .select("stage, source, value")

    const statistics = {
      total: stats?.length || 0,
      byStage: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      totalValue: 0,
      conversionRate: 0,
    }

    if (stats) {
      // Группировка по этапам
      stats.forEach(lead => {
        statistics.byStage[lead.stage] = (statistics.byStage[lead.stage] || 0) + 1
        statistics.bySource[lead.source] = (statistics.bySource[lead.source] || 0) + 1
        statistics.totalValue += lead.value || 0
      })

      // Конверсия
      const customers = stats.filter(l => l.stage === "customer").length
      statistics.conversionRate = stats.length > 0 
        ? Math.round((customers / stats.length) * 100)
        : 0
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      total: count || 0,
      statistics,
    })
  } catch (error: Error | unknown) {
    logger.error("Error fetching leads", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: error.message || "Ошибка получения лидов" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, stage } = await request.json()
    if (!id || !stage) {
      return NextResponse.json({ error: "Missing id or stage" }, { status: 400 })
    }
    const { data, error } = await supabase
      .from("leads")
      .update({ stage, last_contact: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, lead: data })
  } catch (error: Error | unknown) {
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 })
  }
}
