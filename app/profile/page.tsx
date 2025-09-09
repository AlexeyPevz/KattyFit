"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Calendar, 
  Award, 
  Settings, 
  LogOut, 
  Play, 
  Clock,
  Trophy,
  Heart,
  TrendingUp,
  BookOpen
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserSession {
  email: string
  name: string
  provider?: string
  loginTime: number
}

const userStats = {
  completedCourses: 3,
  totalHours: 45,
  currentStreak: 7,
  achievements: 12,
  favoriteWorkouts: 8
}

const currentCourses = [
  {
    id: 1,
    title: "Основы растяжки для начинающих",
    progress: 65,
    nextLesson: "Урок 9: Растяжка для спины",
    thumbnail: "/images/trainer-studio.jpg"
  },
  {
    id: 2,
    title: "Аэройога: полеты в воздухе",
    progress: 30,
    nextLesson: "Урок 4: Базовые перевороты",
    thumbnail: "/images/trainer-outdoor.jpg"
  }
]

const achievements = [
  { title: "Первый шаг", description: "Завершить первый урок", icon: Trophy, earned: true },
  { title: "Неделя практики", description: "Заниматься 7 дней подряд", icon: Calendar, earned: true },
  { title: "Час гибкости", description: "Провести 60 минут в тренировках", icon: Clock, earned: true },
  { title: "Мастер шпагата", description: "Сесть на продольный шпагат", icon: Award, earned: false }
]

export default function ProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null)
  const router = useRouter()

  useEffect(() => {
    const sessionData = localStorage.getItem("user_session")
    if (sessionData) {
      setUser(JSON.parse(sessionData))
    } else {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 py-8 mt-16">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                {user.provider && (
                  <Badge variant="secondary" className="mt-1">
                    Вход через {user.provider}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userStats.completedCourses}</div>
              <div className="text-sm text-muted-foreground">Курсов пройдено</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userStats.totalHours}ч</div>
              <div className="text-sm text-muted-foreground">Часов практики</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userStats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Дней подряд</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userStats.achievements}</div>
              <div className="text-sm text-muted-foreground">Достижений</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{userStats.favoriteWorkouts}</div>
              <div className="text-sm text-muted-foreground">Избранных</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Мои курсы</TabsTrigger>
            <TabsTrigger value="achievements">Достижения</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="history">История</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Текущие курсы</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentCourses.map((course) => (
                    <Card key={course.id}>
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="relative w-32 h-32">
                            <Image
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              fill
                              className="object-cover rounded-l-lg"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <h3 className="font-semibold mb-2">{course.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{course.nextLesson}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Прогресс</span>
                                <span>{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-2" />
                            </div>
                            <Button className="mt-3 w-full" size="sm" asChild>
                              <Link href={`/courses/${course.id}`}>
                                <Play className="w-4 h-4 mr-2" />
                                Продолжить
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Откройте для себя новые возможности</p>
                <Button asChild>
                  <Link href="/courses">Посмотреть все курсы</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className={achievement.earned ? "" : "opacity-50"}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <achievement.icon 
                      className={`w-12 h-12 ${
                        achievement.earned ? "text-yellow-500" : "text-muted-foreground"
                      }`} 
                    />
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Предстоящие тренировки</CardTitle>
                <CardDescription>У вас пока нет запланированных тренировок</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/booking">Записаться на тренировку</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>История занятий</CardTitle>
                <CardDescription>Здесь будет отображаться ваша история тренировок</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  История пока пуста. Начните заниматься!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
