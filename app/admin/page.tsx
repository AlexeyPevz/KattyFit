"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  ImageIcon,
  Palette,
  Database,
  LogOut,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react"
import { AdminGuard } from "@/components/auth/admin-guard"

export default function AdminDashboard() {
  const [username, setUsername] = useState("")

  useEffect(() => {
    const sessionData = localStorage.getItem("admin_session")
    if (sessionData) {
      const session = JSON.parse(sessionData)
      setUsername(session.username)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    window.location.href = "/admin/auth"
  }

  const stats = [
    { title: "Активные клиенты", value: "127", change: "+12%", icon: Users },
    { title: "Курсы", value: "24", change: "+3", icon: BookOpen },
    { title: "Записи сегодня", value: "18", change: "+5", icon: Calendar },
    { title: "Доход за месяц", value: "₽45,200", change: "+8%", icon: TrendingUp },
  ]

  const quickActions = [
    {
      title: "Управление контентом",
      description: "Загрузка видео, генерация обложек и публикация",
      href: "/admin/content",
      icon: Activity,
      color: "bg-violet-500",
    },
    {
      title: "Омниканальные чаты",
      description: "Единый центр управления всеми диалогами",
      href: "/admin/chat",
      icon: BarChart3,
      color: "bg-emerald-500",
    },
    {
      title: "Управление клиентами",
      description: "Просмотр и редактирование профилей клиентов",
      href: "/admin/clients",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Конструктор курсов",
      description: "Создание и редактирование тренировочных программ",
      href: "/admin/courses/builder",
      icon: BookOpen,
      color: "bg-green-500",
    },
    {
      title: "Медиа-менеджер",
      description: "Управление изображениями и видео",
      href: "/admin/media",
      icon: ImageIcon,
      color: "bg-purple-500",
    },
    {
      title: "Брендинг",
      description: "Настройка внешнего вида и стиля",
      href: "/admin/branding",
      icon: Palette,
      color: "bg-pink-500",
    },
    {
      title: "Резервное копирование",
      description: "Создание и восстановление бэкапов",
      href: "/admin/backup",
      icon: Database,
      color: "bg-orange-500",
    },
    {
      title: "База знаний",
      description: "Управление информацией для AI-ассистента",
      href: "/admin/knowledge",
      icon: BookOpen,
      color: "bg-indigo-500",
    },
    {
      title: "Аналитика",
      description: "Статистика и отчеты",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "bg-indigo-500",
    },
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Админ-панель KattyFit</h1>
                <p className="text-sm text-gray-500">Добро пожаловать, {username}!</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      {stat.change}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">за последний месяц</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{action.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Последняя активность</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Новая запись на тренировку</p>
                    <p className="text-xs text-gray-500">Анна Петрова записалась на йогу • 5 мин назад</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Обновлен курс</p>
                    <p className="text-xs text-gray-500">Курс "Силовые тренировки" обновлен • 1 час назад</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Новый отзыв</p>
                    <p className="text-xs text-gray-500">Мария оставила 5-звездочный отзыв • 2 часа назад</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
