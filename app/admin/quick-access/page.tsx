"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarChart3, Users, BookOpen, Calendar, Settings, Palette, Database, FileImage, Shield } from "lucide-react"

const adminSections = [
  {
    title: "Дашборд",
    description: "Общая статистика и аналитика",
    href: "/admin",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600",
    badge: "Главная",
  },
  {
    title: "CRM клиентов",
    description: "Управление базой клиентов",
    href: "/admin/clients",
    icon: Users,
    color: "bg-green-100 text-green-600",
    badge: "156 клиентов",
  },
  {
    title: "Конструктор курсов",
    description: "Создание и редактирование курсов",
    href: "/admin/courses/builder",
    icon: BookOpen,
    color: "bg-purple-100 text-purple-600",
    badge: "Новое",
  },
  {
    title: "Медиа-менеджер",
    description: "Управление файлами и медиа",
    href: "/admin/media",
    icon: FileImage,
    color: "bg-orange-100 text-orange-600",
    badge: "2.4 GB",
  },
  {
    title: "Настройки брендинга",
    description: "Внешний вид и фирменный стиль",
    href: "/admin/branding",
    icon: Palette,
    color: "bg-pink-100 text-pink-600",
    badge: "Дизайн",
  },
  {
    title: "Бэкапы",
    description: "Резервное копирование данных",
    href: "/admin/backup",
    icon: Database,
    color: "bg-gray-100 text-gray-600",
    badge: "Авто",
  },
]

export default function AdminQuickAccessPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="container px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Shield className="w-8 h-8 mr-3 text-primary" />
                Админ-панель KattyFit
              </h1>
              <p className="text-muted-foreground mt-1">Быстрый доступ к основным разделам управления</p>
            </div>
            <Link href="/admin/auth">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Настройки доступа
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <Link key={section.href} href={section.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center`}>
                      <section.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary">{section.badge}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto text-primary">
                    Перейти →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Быстрая статистика</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Активные клиенты</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Курсы</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Записи на месяц</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Доход за месяц</p>
                    <p className="text-2xl font-bold">245K ₽</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Credentials Reminder */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Демо-доступ</h3>
                <p className="text-yellow-700 mt-1">
                  Для входа в админ-панель используйте: <strong>Логин:</strong> KattyFit, <strong>Пароль:</strong>{" "}
                  BestTrainer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
