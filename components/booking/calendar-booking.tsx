"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, CalendarDays, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { ru } from "date-fns/locale"

interface CalendarBookingProps {
  trainingType: any
  onSlotSelect: (date: Date, time: string) => void
  selectedDate?: Date
  selectedTime?: string
}

export function CalendarBooking({
  trainingType,
  onSlotSelect,
  selectedDate,
  selectedTime
}: CalendarBookingProps) {
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Загружаем слоты на следующие 30 дней
  useEffect(() => {
    loadSlots()
  }, [])
  
  const loadSlots = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const startDate = new Date()
      const endDate = addDays(startDate, 30)
      
      const response = await fetch(
        `/api/booking/slots?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
      )
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить расписание')
      }
      
      const data = await response.json()
      setAvailableSlots(data.slots || {})
    } catch (err) {
      setError('Ошибка загрузки расписания. Попробуйте позже.')
      console.error('Error loading slots:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Проверяем доступность дня
  const isDayAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return Object.keys(availableSlots).includes(dateStr)
  }
  
  // Получаем слоты для выбранной даты
  const getTimeSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return availableSlots[dateStr] || []
  }
  
  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : []
  
  return (
    <div className="space-y-6">
      {/* Календарь */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите дату</CardTitle>
          <CardDescription>
            Доступные даты отмечены точкой
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : error ? (
            <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date && isDayAvailable(date)) {
                  onSlotSelect(date, '')
                }
              }}
              disabled={(date) => {
                return date < new Date() || !isDayAvailable(date)
              }}
              locale={ru}
              className="rounded-md border"
              modifiers={{
                available: (date) => isDayAvailable(date)
              }}
              modifiersStyles={{
                available: {
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }
              }}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Временные слоты */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Выберите время
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeSlots.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                На эту дату нет доступных слотов
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSlotSelect(selectedDate, time)}
                    className={cn(
                      "font-mono",
                      selectedTime === time && "ring-2 ring-primary"
                    )}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Выбранное время */}
      {selectedDate && selectedTime && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTime} ({trainingType.duration})
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Выбрано</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}