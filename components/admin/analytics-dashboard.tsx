"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import logger from "@/lib/logger"
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Eye,
  ShoppingCart,
  UserCheck,
  BarChart3
} from "lucide-react"
import { format, subDays, startOfWeek, startOfMonth } from "date-fns"
import { ru } from "date-fns/locale"

interface AnalyticsData {
  revenue: {
    today: number
    week: number
    month: number
    growth: number
  }
  users: {
    total: number
    new: number
    active: number
    growth: number
  }
  courses: {
    sold: number
    views: number
    conversion: number
  }
  bookings: {
    total: number
    confirmed: number
    completed: number
  }
  chartData: {
    daily: Array<{ date: string; revenue: number; users: number }>
    courses: Array<{ name: string; value: number }>
    sources: Array<{ name: string; value: number }>
  }
}

export function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    try {
      // В реальном приложении - запрос к API
      // Сейчас используем моковые данные
      const mockData: AnalyticsData = {
        revenue: {
          today: 15750,
          week: 87500,
          month: 342000,
          growth: 12.5
        },
        users: {
          total: 1247,
          new: 83,
          active: 412,
          growth: 8.3
        },
        courses: {
          sold: 156,
          views: 3420,
          conversion: 4.6
        },
        bookings: {
          total: 234,
          confirmed: 198,
          completed: 176
        },
        chartData: {
          daily: Array.from({ length: 7 }, (_, i) => ({
            date: format(subDays(new Date(), 6 - i), 'dd.MM'),
            revenue: Math.floor(Math.random() * 20000) + 10000,
            users: Math.floor(Math.random() * 20) + 5
          })),
          courses: [
            { name: 'Растяжка для начинающих', value: 45 },
            { name: 'Аэройога базовый курс', value: 32 },
            { name: 'Интенсив гибкость', value: 28 },
            { name: 'Шпагат за 30 дней', value: 25 },
            { name: 'Другие', value: 26 }
          ],
          sources: [
            { name: 'Instagram', value: 42 },
            { name: 'Telegram', value: 28 },
            { name: 'Сайт', value: 18 },
            { name: 'Рекомендации', value: 12 }
          ]
        }
      }
      
      setData(mockData)
    } catch (error) {
      logger.error('Error loading analytics', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return <div className="p-8 text-center">Загрузка аналитики...</div>
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6']

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка сегодня</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₽{data.revenue.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.revenue.growth}%</span> к вчера
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новые клиенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.new}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data.users.growth}%</span> за неделю
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Продано курсов</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.courses.sold}</div>
            <p className="text-xs text-muted-foreground">
              Конверсия {data.courses.conversion}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Записи на тренировки</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.bookings.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              Из {data.bookings.total} заявок
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="courses">Курсы</TabsTrigger>
          <TabsTrigger value="sources">Источники</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Динамика выручки</CardTitle>
              <CardDescription>Выручка по дням за последнюю неделю</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₽${value.toLocaleString()}`} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Выручка"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Новые пользователи</CardTitle>
              <CardDescription>Регистрации по дням</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#10b981" name="Новые пользователи" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Популярные курсы</CardTitle>
              <CardDescription>Распределение продаж по курсам</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.chartData.courses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  >
                    {data.chartData.courses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Источники трафика</CardTitle>
              <CardDescription>Откуда приходят клиенты</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.chartData.sources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  >
                    {data.chartData.sources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Дополнительные метрики */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Топ страницы</CardTitle>
            <CardDescription>Самые посещаемые страницы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { page: '/courses/stretching-beginners', views: 1243 },
                { page: '/booking', views: 892 },
                { page: '/courses', views: 756 },
                { page: '/about', views: 432 },
                { page: '/faq', views: 298 }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.page}</span>
                  <span className="font-medium">{item.views}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Эффективность промокодов</CardTitle>
            <CardDescription>Использование промокодов за период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { code: 'WELCOME10', uses: 43, revenue: 67500 },
                { code: 'FIRST20', uses: 28, revenue: 45200 },
                { code: 'YOGA2024', uses: 19, revenue: 31000 },
                { code: 'FRIEND15', uses: 12, revenue: 18900 }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm">{item.code}</span>
                    <span className="text-xs text-muted-foreground ml-2">{item.uses} исп.</span>
                  </div>
                  <span className="font-medium">₽{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
