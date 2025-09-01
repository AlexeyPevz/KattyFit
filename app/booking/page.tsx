"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarBooking } from "@/components/booking/calendar-booking"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
  Users,
  User,
  CreditCard,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// В реальном приложении загружается из API
const trainingTypes = [
  {
    id: "online-personal",
    title: "Персональная онлайн",
    price: 2500,
    duration: "60 минут",
    description: "Индивидуальное занятие через Zoom",
    icon: Monitor,
    active: true,
    benefits: [
      "Полное внимание тренера",
      "Индивидуальная программа",
      "Удобное время",
      "Запись занятия"
    ]
  }
]

// Пакеты тренировок
const trainingPackages = [
  {
    id: "package-5",
    title: "Пакет 5 занятий",
    sessions: 5,
    price: 11250,
    discount: 10,
    validDays: 60,
    description: "Скидка 10% при покупке пакета"
  },
  {
    id: "package-10",
    title: "Пакет 10 занятий", 
    sessions: 10,
    price: 21250,
    discount: 15,
    validDays: 90,
    description: "Скидка 15% при покупке пакета"
  }
]



export default function BookingPage() {
  const router = useRouter()
  const [bookingMode, setBookingMode] = useState<"single" | "package">("single")
  const [selectedType, setSelectedType] = useState("online-personal")
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>(undefined)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)

  const selectedTraining = trainingTypes.find(t => t.id === selectedType)

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedTraining) return

    // В реальном приложении здесь будет создание записи и переход к оплате
    const bookingData = {
      type: selectedType,
      date: selectedDate.toISOString(),
      time: selectedTime,
      price: selectedTraining.price
    }

    // Сохраняем в localStorage для передачи на страницу оплаты
    localStorage.setItem("bookingData", JSON.stringify(bookingData))
    
    // Переходим к оплате
    router.push("/checkout/booking")
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Запись на тренировку
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Выберите удобный формат занятия и время. Я помогу вам достичь ваших целей!
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Training Types */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Выберите тип тренировки</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                    <div className="grid gap-4">
                      {trainingTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <div key={type.id}>
                            <RadioGroupItem
                              value={type.id}
                              id={type.id}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={type.id}
                              className={cn(
                                "flex cursor-pointer rounded-lg border p-4 hover:bg-accent",
                                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              )}
                            >
                              <div className="flex-1">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 rounded-lg bg-muted">
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="font-semibold">{type.title}</h3>
                                      <p className="text-2xl font-bold">{type.price} ₽</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      {type.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      <Clock className="inline h-3 w-3 mr-1" />
                                      {type.duration}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {type.benefits.map((benefit, index) => (
                                        <div key={index} className="flex items-center gap-1 text-xs">
                                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                          <span>{benefit}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Выберите дату и время</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CalendarBooking
                    trainingType={selectedTraining}
                    onSlotSelect={(date, time) => {
                      setSelectedDate(date)
                      setSelectedTime(time)
                    }}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Детали записи</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTraining && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Тип:</span>
                        <span className="font-medium">{selectedTraining.title}</span>
                      </div>
                      {selectedDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Дата:</span>
                          <span className="font-medium">
                            {selectedDate.toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Время:</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Длительность:</span>
                        <span className="font-medium">{selectedTraining.duration}</span>
                      </div>
                      {selectedType.includes("offline") && (
                        <div className="flex items-start justify-between">
                          <span className="text-muted-foreground">Адрес:</span>
                          <span className="font-medium text-right text-sm">
                            Москва, ул. Примерная, 123
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">К оплате:</span>
                          <span className="text-2xl font-bold">{selectedTraining.price} ₽</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleBooking}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Перейти к оплате
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Оплата происходит онлайн</p>
                    <p>• Отмена бесплатно за 24 часа</p>
                    <p>• Перенос возможен за 12 часов</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Важная информация</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Приходите в удобной одежде</li>
                        <li>• Коврик предоставляется</li>
                        <li>• За час не есть</li>
                        <li>• Возьмите воду</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}