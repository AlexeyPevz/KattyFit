"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CloudPaymentsCheckout } from "@/components/payment/cloudpayments-checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, MapPin, User } from "lucide-react"
import logger from "@/lib/logger"

export default function BookingCheckoutPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    // Получаем данные о бронировании из localStorage
    const data = localStorage.getItem("bookingData")
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      // Если нет данных, возвращаем на страницу записи
      router.push("/booking")
    }
  }, [router])

  const handlePaymentSuccess = async (transaction: Record<string, unknown>) => {
    logger.info("Booking payment successful", { transaction })
    // Очищаем данные бронирования
    localStorage.removeItem("bookingData")
    // Перенаправляем на страницу успеха
    router.push("/booking/success")
  }

  const handlePaymentFail = (reason: string) => {
    logger.error("Booking payment failed", { reason })
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  const trainingTypeNames: Record<string, string> = {
    "online-personal": "Онлайн персональная тренировка",
    "offline-personal": "Офлайн персональная тренировка",
    "online-group": "Онлайн групповая тренировка"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Back Button */}
        <Link href="/booking">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к выбору времени
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ваша запись</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Training Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    {trainingTypeNames[bookingData.type]}
                  </h3>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Дата</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(bookingData.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Время</p>
                        <p className="text-sm text-muted-foreground">
                          {bookingData.time} (60 минут)
                        </p>
                      </div>
                    </div>

                    {bookingData.type.includes("offline") && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Адрес студии</p>
                          <p className="text-sm text-muted-foreground">
                            Москва, ул. Примерная, 123
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Тренер</p>
                        <p className="text-sm text-muted-foreground">
                          Екатерина (KattyFit)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Info */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Важная информация</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• После оплаты вы получите подтверждение на email</li>
                    <li>• За день до тренировки придет напоминание</li>
                    <li>• Отмена возможна бесплатно за 24 часа</li>
                    <li>• Перенос времени возможен за 12 часов</li>
                    {bookingData.type.includes("online") && (
                      <li>• Ссылка на Zoom придет за 15 минут до начала</li>
                    )}
                  </ul>
                </div>

                {/* Price */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Стоимость тренировки</span>
                    <span className="text-2xl font-bold">{bookingData.price} ₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <CloudPaymentsCheckout
              amount={bookingData.price}
              description={trainingTypeNames[bookingData.type]}
              data={{
                bookingType: bookingData.type,
                bookingDate: bookingData.date,
                bookingTime: bookingData.time,
                type: "booking"
              }}
              onSuccess={handlePaymentSuccess}
              onFail={handlePaymentFail}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
