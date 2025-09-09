"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Gift, Sparkles, Timer } from "lucide-react"
import { useState, useEffect } from "react"

export function CTASection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <Card className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-pink-600 opacity-10" />
          
          <CardContent className="relative p-8 md:p-12">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                Специальное предложение
              </Badge>
              
              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold">
                Начните свой путь к гибкости прямо сейчас!
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Получите скидку 30% на любой курс при покупке сегодня
              </p>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 py-4">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <div className="flex gap-4 text-2xl font-mono font-bold">
                  <div className="text-center">
                    <div className="bg-background rounded-lg px-3 py-2 shadow-sm">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">часов</p>
                  </div>
                  <span className="text-muted-foreground">:</span>
                  <div className="text-center">
                    <div className="bg-background rounded-lg px-3 py-2 shadow-sm">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">минут</p>
                  </div>
                  <span className="text-muted-foreground">:</span>
                  <div className="text-center">
                    <div className="bg-background rounded-lg px-3 py-2 shadow-sm">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">секунд</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-4 py-6">
                <div className="flex items-center justify-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Бонусные материалы</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Доступ навсегда</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Поддержка тренера</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2">
                  Выбрать курс со скидкой
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Получить пробный урок
                </Button>
              </div>

              {/* Trust text */}
              <p className="text-sm text-muted-foreground">
                Никаких скрытых платежей • Гарантия возврата 14 дней • Безопасная оплата
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional CTA for personal training */}
        <Card className="mt-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">
                  Предпочитаете индивидуальный подход?
                </h3>
                <p className="text-muted-foreground">
                  Запишитесь на персональную тренировку и получите программу, 
                  созданную специально для вас. Онлайн или офлайн - выбор за вами!
                </p>
                <Button className="gap-2">
                  Записаться на тренировку
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">2500₽</p>
                    <p className="text-sm text-muted-foreground">Онлайн тренировка</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold">3500₽</p>
                    <p className="text-sm text-muted-foreground">Офлайн в студии</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
