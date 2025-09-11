"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CloudPaymentsCheckout } from "@/components/payment/cloudpayments-checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Video, FileText, Shield, RefreshCw } from "lucide-react"
import logger from "@/lib/logger"

// В реальном приложении данные загружаются из БД
const getCourseData = (id: string) => ({
  id: id,
  title: "Растяжка для начинающих",
  price: 2990,
  oldPrice: 4990,
  description: "Базовый курс растяжки на 30 дней",
  thumbnail: "/api/placeholder/400/300",
  duration: "30 дней",
  totalVideos: 35,
  totalHours: "10 часов",
  benefits: [
    "35 видеоуроков с подробными объяснениями",
    "Доступ к курсу навсегда",
    "Поддержка тренера в чате",
    "Сертификат по окончании"
  ]
})

export default function CourseCheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)

  useEffect(() => {
    // В реальном приложении здесь загрузка из API
    const courseData = getCourseData(courseId)
    setCourse(courseData)
  }, [courseId])

  const handlePaymentSuccess = async (transaction: Record<string, unknown>) => {
    logger.info("Payment successful", { transaction })
    // Здесь можно добавить дополнительную логику после успешной оплаты
  }

  const handlePaymentFail = (reason: string) => {
    logger.error("Payment failed", { reason })
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Back Button */}
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к курсу
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Info */}
                <div className="flex gap-4">
                  <div className="h-24 w-32 rounded-lg bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>{course.totalVideos} уроков</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.totalHours}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {course.oldPrice && (
                      <p className="text-sm text-muted-foreground line-through mb-1">
                        {course.oldPrice} ₽
                      </p>
                    )}
                    <p className="text-2xl font-bold">{course.price} ₽</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Что входит в курс:</h4>
                  <ul className="space-y-2">
                    {course.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="h-2 w-2 rounded-full bg-green-600" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Guarantees */}
                <div className="border-t pt-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Безопасная оплата</p>
                        <p className="text-xs text-muted-foreground">
                          Защищенное соединение и шифрование данных
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Гарантия возврата</p>
                        <p className="text-xs text-muted-foreground">
                          14 дней на возврат без объяснения причин
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <CloudPaymentsCheckout
              amount={course.price}
              description={course.title}
              data={{
                courseId: course.id,
                courseTitle: course.title,
                type: "course"
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
