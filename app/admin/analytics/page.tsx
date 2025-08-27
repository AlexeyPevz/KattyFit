"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  BookOpen,
  DollarSign,
  Activity,
  Clock,
  ArrowLeft,
  Download,
  Filter
} from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StatCard {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ElementType
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(false)

  // Примеры данных для демонстрации
  const statsCards: StatCard[] = [
    {
      title: "Общий доход",
      value: "₽245,320",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign
    },
    {
      title: "Активные клиенты",
      value: 234,
      change: "+5.2%", 
      changeType: "positive",
      icon: Users
    },
    {
      title: "Проведено тренировок",
      value: 467,
      change: "+18.3%",
      changeType: "positive",
      icon: Activity
    },
    {
      title: "Средний чек",
      value: "₽3,250",
      change: "-2.1%",
      changeType: "negative",
      icon: TrendingUp
    }
  ]

  const popularCourses = [
    { name: "Растяжка для начинающих", students: 45, revenue: "₽67,500" },
    { name: "Аэройога интенсив", students: 32, revenue: "₽56,000" },
    { name: "Сплиты за 30 дней", students: 28, revenue: "₽42,000" },
    { name: "Здоровая спина", students: 23, revenue: "₽34,500" },
    { name: "Утренняя йога", students: 19, revenue: "₽28,500" }
  ]

  const trainingStats = {
    total: 467,
    individual: 234,
    group: 145,
    online: 88,
    cancelled: 12,
    averageDuration: "55 мин"
  }

  const clientStats = {
    newClients: 23,
    returningClients: 211,
    churnRate: "5.2%",
    averageLifetime: "8.3 месяца",
    satisfactionScore: "4.8/5"
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">Аналитика</h1>
              </div>
              <div className="flex gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">За неделю</SelectItem>
                    <SelectItem value="month">За месяц</SelectItem>
                    <SelectItem value="quarter">За квартал</SelectItem>
                    <SelectItem value="year">За год</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8 space-y-6">
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <Badge 
                          variant={stat.changeType === "positive" ? "default" : "destructive"}
                          className={stat.changeType === "positive" ? "bg-green-500" : ""}
                        >
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          vs прошлый период
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full bg-primary/10`}>
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Детальная аналитика */}
          <Tabs defaultValue="revenue" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 h-auto">
              <TabsTrigger value="revenue">Доходы</TabsTrigger>
              <TabsTrigger value="courses">Курсы</TabsTrigger>
              <TabsTrigger value="trainings">Тренировки</TabsTrigger>
              <TabsTrigger value="clients">Клиенты</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>График доходов</CardTitle>
                  <CardDescription>
                    Динамика доходов за выбранный период
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">График доходов</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Источники дохода</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Индивидуальные тренировки</span>
                        <span className="font-bold">₽125,600</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Групповые занятия</span>
                        <span className="font-bold">₽67,320</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Онлайн курсы</span>
                        <span className="font-bold">₽52,400</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Топ платящие клиенты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Анна Петрова</span>
                        <span className="font-bold">₽18,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Мария Иванова</span>
                        <span className="font-bold">₽15,200</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Елена Сидорова</span>
                        <span className="font-bold">₽12,800</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Популярные курсы</CardTitle>
                  <CardDescription>
                    Статистика по онлайн курсам
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularCourses.map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{course.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.students} учеников
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{course.revenue}</p>
                          <p className="text-sm text-muted-foreground">доход</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trainings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Статистика тренировок</CardTitle>
                  <CardDescription>
                    Общая информация о проведенных занятиях
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{trainingStats.total}</p>
                      <p className="text-sm text-muted-foreground">Всего тренировок</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{trainingStats.individual}</p>
                      <p className="text-sm text-muted-foreground">Индивидуальных</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{trainingStats.group}</p>
                      <p className="text-sm text-muted-foreground">Групповых</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{trainingStats.online}</p>
                      <p className="text-sm text-muted-foreground">Онлайн</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-red-500">{trainingStats.cancelled}</p>
                      <p className="text-sm text-muted-foreground">Отменено</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{trainingStats.averageDuration}</p>
                      <p className="text-sm text-muted-foreground">Средняя длительность</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Загрузка по дням недели</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">График загрузки</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Новые клиенты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.newClients}</div>
                    <p className="text-xs text-muted-foreground">за период</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Постоянные клиенты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.returningClients}</div>
                    <p className="text-xs text-muted-foreground">активные</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Отток</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.churnRate}</div>
                    <p className="text-xs text-muted-foreground">процент оттока</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Средний LTV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.averageLifetime}</div>
                    <p className="text-xs text-muted-foreground">время жизни клиента</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Удовлетворенность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientStats.satisfactionScore}</div>
                    <p className="text-xs text-muted-foreground">средняя оценка</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Сегментация клиентов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">Диаграмма сегментации</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}