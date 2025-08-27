"use client"

import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Calendar, Mail, MessageSquare, Home } from "lucide-react"

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                {/* Success Icon */}
                <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold mb-4">
                  Вы успешно записались на тренировку!
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Спасибо за доверие! Я жду вас на занятии.
                </p>

                {/* Next Steps */}
                <div className="bg-muted rounded-lg p-6 mb-8 text-left">
                  <h2 className="font-semibold mb-4">Что дальше?</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Проверьте email</p>
                        <p className="text-sm text-muted-foreground">
                          Мы отправили подтверждение с деталями тренировки
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Добавьте в календарь</p>
                        <p className="text-sm text-muted-foreground">
                          За день до тренировки придет напоминание
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Есть вопросы?</p>
                        <p className="text-sm text-muted-foreground">
                          Напишите мне в любом мессенджере
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preparation Tips */}
                <Card className="mb-8 border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Как подготовиться к тренировке?</h3>
                    <ul className="text-sm text-left space-y-2">
                      <li>• Наденьте удобную спортивную одежду</li>
                      <li>• За час до занятия лучше не есть плотно</li>
                      <li>• Возьмите с собой воду</li>
                      <li>• Приходите за 5-10 минут до начала</li>
                      <li>• Будьте готовы к позитивным изменениям!</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      На главную
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/booking">
                      <Calendar className="mr-2 h-4 w-4" />
                      Записаться еще
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}