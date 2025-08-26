"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/landing/navbar"
import { SecureVideoPlayer } from "@/components/player/secure-video-player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  MessageSquare,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

// Моковые данные курса (в реальном приложении загружаются из БД)
const mockCourse = {
  id: "1",
  title: "Растяжка для начинающих",
  description: "Базовый курс для тех, кто хочет стать гибким с нуля",
  modules: [
    {
      id: "1",
      title: "Введение и разминка",
      lessons: [
        {
          id: "1-1",
          title: "Приветствие и знакомство",
          duration: 330,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Тестовый HLS поток
          completed: true,
        },
        {
          id: "1-2",
          title: "Техника безопасности",
          duration: 495,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          completed: true,
        },
        {
          id: "1-3",
          title: "Базовая разминка",
          duration: 900,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          completed: false,
          current: true,
        },
        {
          id: "1-4",
          title: "Дыхательные практики",
          duration: 765,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          completed: false,
        },
      ]
    },
    {
      id: "2",
      title: "Работа с ногами",
      lessons: [
        {
          id: "2-1",
          title: "Растяжка икроножных мышц",
          duration: 720,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          completed: false,
        },
        {
          id: "2-2",
          title: "Работа с бедрами",
          duration: 930,
          videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          completed: false,
        },
      ]
    }
  ]
}

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  
  const [course, setCourse] = useState(mockCourse)
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("lessons")

  useEffect(() => {
    // Проверяем доступ к курсу
    checkAccess()
    
    // Находим текущий урок
    const current = course.modules
      .flatMap(m => m.lessons)
      .find(l => l.current) || course.modules[0]?.lessons[0]
    
    if (current) {
      setCurrentLesson(current)
    }

    // Вычисляем общий прогресс
    const allLessons = course.modules.flatMap(m => m.lessons)
    const completedCount = allLessons.filter(l => l.completed).length
    setProgress((completedCount / allLessons.length) * 100)
  }, [courseId])

  const checkAccess = async () => {
    try {
      // В реальном приложении здесь проверка через API
      const email = localStorage.getItem("userEmail") || "demo@example.com"
      const response = await fetch(`/api/courses/access?courseId=${courseId}&email=${email}`)
      const data = await response.json()
      
      // Для демо всегда даем доступ
      setHasAccess(true)
      
      if (!data.hasAccess) {
        // router.push(`/courses/${courseId}`)
      }
    } catch (error) {
      console.error("Error checking access:", error)
      setHasAccess(true) // Для демо
    }
  }

  const handleLessonComplete = async () => {
    if (!currentLesson) return

    // Обновляем статус урока
    const updatedCourse = { ...course }
    updatedCourse.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.id === currentLesson.id) {
          lesson.completed = true
        }
      })
    })
    setCourse(updatedCourse)

    // Сохраняем прогресс (в реальном приложении через API)
    console.log("Lesson completed:", currentLesson.id)
  }

  const handleLessonSelect = (lesson: any) => {
    // Снимаем флаг current со всех уроков
    const updatedCourse = { ...course }
    updatedCourse.modules.forEach(module => {
      module.lessons.forEach(l => {
        l.current = l.id === lesson.id
      })
    })
    setCourse(updatedCourse)
    setCurrentLesson(lesson)
  }

  const navigateLesson = (direction: "prev" | "next") => {
    const allLessons = course.modules.flatMap(m => m.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id)
    
    if (direction === "prev" && currentIndex > 0) {
      handleLessonSelect(allLessons[currentIndex - 1])
    } else if (direction === "next" && currentIndex < allLessons.length - 1) {
      handleLessonSelect(allLessons[currentIndex + 1])
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null // Будет перенаправлен
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {currentLesson && (
                  <SecureVideoPlayer
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    onProgress={({ percentage }) => {
                      // Обновляем прогресс урока
                      if (percentage > 90 && !currentLesson.completed) {
                        handleLessonComplete()
                      }
                    }}
                    onComplete={handleLessonComplete}
                  />
                )}
              </CardContent>
            </Card>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentLesson?.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateLesson("prev")}
                      disabled={!currentLesson || course.modules[0].lessons[0].id === currentLesson.id}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Предыдущий
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateLesson("next")}
                      disabled={!currentLesson || course.modules[course.modules.length - 1].lessons[course.modules[course.modules.length - 1].lessons.length - 1].id === currentLesson.id}
                    >
                      Следующий
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lessons">Уроки</TabsTrigger>
                    <TabsTrigger value="materials">Материалы</TabsTrigger>
                    <TabsTrigger value="questions">Вопросы</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="lessons" className="space-y-4 mt-4">
                    {course.modules.map((module) => (
                      <div key={module.id}>
                        <h3 className="font-semibold mb-3">{module.title}</h3>
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <Button
                              key={lesson.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left h-auto py-3",
                                lesson.current && "bg-accent"
                              )}
                              onClick={() => handleLessonSelect(lesson)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {lesson.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium">{lesson.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDuration(lesson.duration)}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="materials" className="space-y-4 mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Рабочая тетрадь</p>
                              <p className="text-sm text-muted-foreground">PDF, 2.5 MB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Дневник прогресса</p>
                              <p className="text-sm text-muted-foreground">PDF, 1.2 MB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="questions" className="mt-4">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium mb-2">Есть вопросы по уроку?</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Задайте их в чате или на групповой встрече
                        </p>
                        <Button>Открыть чат</Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Прогресс курса</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Пройдено</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {course.modules.flatMap(m => m.lessons).filter(l => l.completed).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Завершено</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {course.modules.flatMap(m => m.lessons).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Всего уроков</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-2">Сертификат</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Завершите все уроки, чтобы получить сертификат
                </p>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">О курсе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Название</p>
                  <p className="text-muted-foreground">{course.title}</p>
                </div>
                <div>
                  <p className="font-medium">Описание</p>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div>
                  <p className="font-medium">Модулей</p>
                  <p className="text-muted-foreground">{course.modules.length}</p>
                </div>
                <div>
                  <p className="font-medium">Уроков</p>
                  <p className="text-muted-foreground">
                    {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}