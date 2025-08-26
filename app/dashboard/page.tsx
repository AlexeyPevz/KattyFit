"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Calendar, Trophy, Clock, Play, Download, TrendingUp, Award, Settings } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const userCourses = [
  {
    id: 1,
    title: "Основы растяжки для начинающих",
    progress: 75,
    totalLessons: 16,
    completedLessons: 12,
    nextLesson: "Урок 13: Растяжка спины",
    image: "/images/trainer-studio.jpg",
    certificate: true,
  },
  {
    id: 2,
    title: "Аэройога: полеты в воздухе",
    progress: 45,
    totalLessons: 24,
    completedLessons: 11,
    nextLesson: "Урок 12: Базовые инверсии",
    image: "/images/trainer-outdoor.jpg",
    certificate: false,
  },
]

const upcomingBookings = [
  {
    id: 1,
    title: "Персональная тренировка",
    date: "2024-01-15",
    time: "10:00",
    type: "offline",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Аэройога",
    date: "2024-01-18",
    time: "18:00",
    type: "offline",
    status: "pending",
  },
]

const achievements = [
  {
    id: 1,
    title: "Первые шаги",
    description: "Завершили первый урок",
    icon: "🎯",
    earned: true,
    date: "2024-01-10",
  },
  {
    id: 2,
    title: "Неделя практики",
    description: "Занимались 7 дней подряд",
    icon: "🔥",
    earned: true,
    date: "2024-01-12",
  },
  {
    id: 3,
    title: "Мастер растяжки",
    description: "Завершили курс растяжки",
    icon: "🏆",
    earned: false,
    date: null,
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container px-4 py-8">
        {/* User Profile Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg?height=64&width=64" />
            <AvatarFallback>АП</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Анна Петрова</h1>
            <p className="text-muted-foreground">Участник с января 2024</p>
          </div>
          <div className="ml-auto">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="courses">Мои курсы</TabsTrigger>
            <TabsTrigger value="bookings">Тренировки</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные курсы</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">+1 за этот месяц</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Часов занятий</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+8 за эту неделю</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Достижения</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">из 10 доступных</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Прогресс</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">60%</div>
                  <p className="text-xs text-muted-foreground">Средний по курсам</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Последняя активность</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Завершен урок "Растяжка ног"</p>
                      <p className="text-xs text-muted-foreground">2 часа назад</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Записались на тренировку</p>
                      <p className="text-xs text-muted-foreground">1 день назад</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Получено достижение "Неделя практики"</p>
                      <p className="text-xs text-muted-foreground">3 дня назад</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ближайшие тренировки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.date).toLocaleDateString("ru-RU")} в {booking.time}
                        </p>
                      </div>
                      <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                        {booking.status === "confirmed" ? "Подтверждено" : "Ожидание"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {userCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg mb-2">{course.title}</h3>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-muted-foreground">
                          {course.completedLessons} из {course.totalLessons} уроков
                        </span>
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Следующий урок:</span>
                          <Badge variant="outline">{course.nextLesson}</Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            Продолжить
                          </Button>
                          {course.certificate && (
                            <Button variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Сертификат
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои тренировки</CardTitle>
                <CardDescription>История и запланированные персональные тренировки</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{booking.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.date).toLocaleDateString("ru-RU", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            в {booking.time}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {booking.type === "online" ? "Онлайн" : "Офлайн"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status === "confirmed" ? "Подтверждено" : "Ожидание"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Изменить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className={`${
                      achievement.earned
                        ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                        : "opacity-60"
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold mb-2">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                      {achievement.earned ? (
                        <Badge className="bg-yellow-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Получено {achievement.date && new Date(achievement.date).toLocaleDateString("ru-RU")}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Не получено</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
