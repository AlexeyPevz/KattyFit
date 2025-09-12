import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { env } from "@/lib/env"
import logger from "@/lib/logger"

// Для MVP используем простое расписание из БД
// В будущем можно интегрировать с Яндекс.Календарь API

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const trainerId = searchParams.get('trainerId') || '1' // По умолчанию Кати
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Необходимо указать даты" },
        { status: 400 }
      )
    }
    
    // Получаем настройки расписания тренера
    const { data: schedule } = await supabaseAdmin
      .from('trainer_schedule')
      .select('*')
      .eq('trainer_id', trainerId)
      .single()
      
    if (!schedule) {
      // Используем дефолтное расписание
      const defaultSchedule = {
        workDays: [1, 2, 3, 4, 5, 6], // Пн-Сб
        workHours: {
          start: "09:00",
          end: "20:00"
        },
        slotDuration: 60, // минут
        breakDuration: 15, // минут между занятиями
        unavailableDates: []
      }
      
      return generateSlots(startDate, endDate, defaultSchedule, trainerId)
    }
    
    return generateSlots(startDate, endDate, schedule, trainerId)
    
  } catch (error) {
    logger.error("Ошибка получения слотов", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка получения расписания" },
      { status: 500 }
    )
  }
}

async function generateSlots(
  startDate: string, 
  endDate: string, 
  schedule: Record<string, unknown>,
  trainerId: string
) {
  const slots: Record<string, string[]> = {}
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Получаем существующие бронирования
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('booking_date, booking_time')
    .eq('trainer_id', trainerId)
    .eq('status', 'confirmed')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    
  // Создаем карту занятых слотов
  const bookedSlots = new Map()
  bookings?.forEach(booking => {
    const key = booking.booking_date
    if (!bookedSlots.has(key)) {
      bookedSlots.set(key, new Set())
    }
    bookedSlots.get(key).add(booking.booking_time)
  })
  
  // Генерируем слоты для каждого дня
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    const dateStr = d.toISOString().split('T')[0]
    
    // Проверяем, рабочий ли день
    if (!(schedule.workDays as number[]).includes(dayOfWeek)) continue
    
    // Проверяем, не в списке ли недоступных дат
    if ((schedule.unavailableDates as string[])?.includes(dateStr)) continue
    
    // Генерируем временные слоты
    const daySlots: string[] = []
    const workHours = schedule.workHours as { start: string; end: string }
    const [startHour, startMin] = workHours.start.split(':').map(Number)
    const [endHour, endMin] = workHours.end.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const slotDuration = (schedule.slotDuration as number) + (schedule.breakDuration as number)
    
    for (let minutes = startMinutes; minutes + (schedule.slotDuration as number) <= endMinutes; minutes += slotDuration) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      
      // Проверяем, не занят ли слот
      if (!bookedSlots.get(dateStr)?.has(timeStr)) {
        daySlots.push(timeStr)
      }
    }
    
    if (daySlots.length > 0) {
      slots[dateStr] = daySlots
    }
  }
  
  return NextResponse.json({ slots })
}

// POST - создание бронирования
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      trainerId = '1',
      serviceType,
      bookingDate,
      bookingTime,
      duration = 60,
      price,
      notes
    } = body
    
    if (!userId || !bookingDate || !bookingTime) {
      return NextResponse.json(
        { error: "Недостаточно данных для бронирования" },
        { status: 400 }
      )
    }
    
    // Проверяем, не занят ли слот
    const { data: existing } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('trainer_id', trainerId)
      .eq('booking_date', bookingDate)
      .eq('booking_time', bookingTime)
      .eq('status', 'confirmed')
      .single()
      
    if (existing) {
      return NextResponse.json(
        { error: "Этот слот уже занят" },
        { status: 409 }
      )
    }
    
    // Создаем бронирование
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        user_id: userId,
        trainer_id: trainerId,
        service_type: serviceType,
        booking_date: bookingDate,
        booking_time: bookingTime,
        duration_minutes: duration,
        status: 'pending', // Станет confirmed после оплаты
        price: price,
        notes: notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
      
    if (error) {
      logger.error("Ошибка создания бронирования", { error: error instanceof Error ? error.message : String(error) })
      return NextResponse.json(
        { error: "Не удалось создать бронирование" },
        { status: 500 }
      )
    }
    
    // TODO: Отправить уведомление тренеру
    // TODO: Создать событие в Яндекс.Календаре (после оплаты)
    
    return NextResponse.json({ booking })
    
  } catch (error) {
    logger.error("Ошибка бронирования", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: "Ошибка создания бронирования" },
      { status: 500 }
    )
  }
}
