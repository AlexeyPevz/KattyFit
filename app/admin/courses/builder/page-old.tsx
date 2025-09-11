"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import {
  Plus,
  GripVertical,
  Play,
  FileText,
  Video,
  PuzzleIcon as Quiz,
  Eye,
  Save,
  Trash2,
  Edit,
  Clock,
  Users,
  BookOpen,
} from "lucide-react"
import Image from "next/image"
import { DemoDataBanner, DemoDataIndicator } from "@/components/admin/demo-data-banner"
import { useDemoData } from "@/hooks/use-demo-data"

interface CourseLesson {
  id: string
  title: string
  description: string
  type: "video" | "text" | "quiz" | "assignment"
  duration: number
  content: {
    videoUrl?: string
    textContent?: string
    quizQuestions?: Array<Record<string, unknown>>
    assignmentText?: string
  }
  isPreview: boolean
  order: number
}

interface CourseModule {
  id: string
  title: string
  description: string
  lessons: CourseLesson[]
  order: number
}

interface Course {
  id: string
  title: string
  description: string
  image: string
  price: number
  level: "beginner" | "intermediate" | "advanced"
  category: string
  modules: CourseModule[]
  settings: {
    allowComments: boolean
    allowDownloads: boolean
    certificateEnabled: boolean
    dripContent: boolean
    dripInterval: number
  }
}

const initialCourse: Course = {
  id: "1",
  title: "Новый курс",
  description: "Описание курса",
  image: "/images/trainer-studio.jpg",
  price: 2990,
  level: "beginner",
  category: "stretching",
  modules: [
    {
      id: "module-1",
      title: "Введение",
      description: "Основы и подготовка",
      order: 0,
      lessons: [
        {
          id: "lesson-1",
          title: "Добро пожаловать в курс",
          description: "Вводный урок",
          type: "video",
          duration: 300,
          content: {
            videoUrl: "/placeholder.svg",
          },
          isPreview: true,
          order: 0,
        },
      ],
    },
  ],
  settings: {
    allowComments: true,
    allowDownloads: false,
    certificateEnabled: true,
    dripContent: false,
    dripInterval: 7,
  },
}

export default function CourseBuilderPage() {
  const { shouldShowDemo } = useDemoData()
  const [course, setCourse] = useState<Course>(shouldShowDemo('courses') ? initialCourse : {
    ...initialCourse,
    title: "Новый курс",
    description: "Создайте свой первый курс",
    modules: []
  })
  const [activeTab, setActiveTab] = useState("content")
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return

      const { source, destination, type } = result

      if (type === "module") {
        const newModules = Array.from(course.modules)
        const [reorderedModule] = newModules.splice(source.index, 1)
        newModules.splice(destination.index, 0, reorderedModule)

        setCourse((prev) => ({
          ...prev,
          modules: newModules.map((module, index) => ({ ...module, order: index })),
        }))
      } else if (type === "lesson") {
        const sourceModuleIndex = course.modules.findIndex((m) => m.id === source.droppableId)
        const destModuleIndex = course.modules.findIndex((m) => m.id === destination.droppableId)

        const newModules = [...course.modules]

        if (sourceModuleIndex === destModuleIndex) {
          // Reordering within the same module
          const lessons = Array.from(newModules[sourceModuleIndex].lessons)
          const [reorderedLesson] = lessons.splice(source.index, 1)
          lessons.splice(destination.index, 0, reorderedLesson)

          newModules[sourceModuleIndex] = {
            ...newModules[sourceModuleIndex],
            lessons: lessons.map((lesson, index) => ({ ...lesson, order: index })),
          }
        } else {
          // Moving between modules
          const sourceLessons = Array.from(newModules[sourceModuleIndex].lessons)
          const destLessons = Array.from(newModules[destModuleIndex].lessons)

          const [movedLesson] = sourceLessons.splice(source.index, 1)
          destLessons.splice(destination.index, 0, movedLesson)

          newModules[sourceModuleIndex] = {
            ...newModules[sourceModuleIndex],
            lessons: sourceLessons.map((lesson, index) => ({ ...lesson, order: index })),
          }

          newModules[destModuleIndex] = {
            ...newModules[destModuleIndex],
            lessons: destLessons.map((lesson, index) => ({ ...lesson, order: index })),
          }
        }

        setCourse((prev) => ({ ...prev, modules: newModules }))
      }
    },
    [course.modules],
  )

  const addModule = () => {
    const newModule: CourseModule = {
      id: `module-${Date.now()}`,
      title: "Новый модуль",
      description: "Описание модуля",
      lessons: [],
      order: course.modules.length,
    }

    setCourse((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }))
  }

  const addLesson = (moduleId: string) => {
    const newLesson: CourseLesson = {
      id: `lesson-${Date.now()}`,
      title: "Новый урок",
      description: "Описание урока",
      type: "video",
      duration: 0,
      content: {},
      isPreview: false,
      order: 0,
    }

    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, { ...newLesson, order: module.lessons.length }] }
          : module,
      ),
    }))
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: module.lessons.filter((lesson) => lesson.id !== lessonId) }
          : module,
      ),
    }))
  }

  const deleteModule = (moduleId: string) => {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== moduleId),
    }))
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "text":
        return <FileText className="w-4 h-4" />
      case "quiz":
        return <Quiz className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const totalDuration = course.modules.reduce(
    (total, module) => total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.duration, 0),
    0,
  )

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Конструктор курсов</h1>
              <p className="text-muted-foreground">Создание и редактирование онлайн-курсов</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Предпросмотр
              </Button>
              <Button className="yoga-gradient text-white">
                <Save className="w-4 h-4 mr-2" />
                Сохранить курс
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Информация о курсе</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                </div>

                <div>
                  <Label htmlFor="course-title">Название курса</Label>
                  <Input
                    id="course-title"
                    value={course.title}
                    onChange={(e) => setCourse((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="course-price">Цена (₽)</Label>
                  <Input
                    id="course-price"
                    type="number"
                    value={course.price}
                    onChange={(e) => setCourse((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="course-level">Уровень сложности</Label>
                  <Select
                    value={course.level}
                    onValueChange={(value: string) => setCourse((prev) => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Новичок</SelectItem>
                      <SelectItem value="intermediate">Средний</SelectItem>
                      <SelectItem value="advanced">Продвинутый</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Модулей:</span>
                    <span className="font-medium">{course.modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Уроков:</span>
                    <span className="font-medium">{totalLessons}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Длительность:</span>
                    <span className="font-medium">{formatDuration(totalDuration)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Содержание</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
                <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Структура курса</h2>
                  <Button onClick={addModule} className="yoga-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить модуль
                  </Button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="modules" type="module">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {course.modules.map((module, moduleIndex) => (
                          <Draggable key={module.id} draggableId={module.id} index={moduleIndex}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${snapshot.isDragging ? "shadow-lg" : ""}`}
                              >
                                <CardHeader className="pb-3">
                                  <div className="flex items-center space-x-3">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        value={module.title}
                                        onChange={(e) => {
                                          setCourse((prev) => ({
                                            ...prev,
                                            modules: prev.modules.map((m) =>
                                              m.id === module.id ? { ...m, title: e.target.value } : m,
                                            ),
                                          }))
                                        }}
                                        className="font-semibold text-lg border-none p-0 h-auto focus-visible:ring-0"
                                      />
                                      <Textarea
                                        value={module.description}
                                        onChange={(e) => {
                                          setCourse((prev) => ({
                                            ...prev,
                                            modules: prev.modules.map((m) =>
                                              m.id === module.id ? { ...m, description: e.target.value } : m,
                                            ),
                                          }))
                                        }}
                                        className="mt-1 border-none p-0 resize-none focus-visible:ring-0"
                                        rows={1}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button variant="outline" size="sm" onClick={() => addLesson(module.id)}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        Урок
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteModule(module.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                  <Droppable droppableId={module.id} type="lesson">
                                    {(provided) => (
                                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                          <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex items-center p-3 bg-muted/50 rounded-lg ${
                                                  snapshot.isDragging ? "shadow-md" : ""
                                                }`}
                                              >
                                                <div {...provided.dragHandleProps} className="mr-3">
                                                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                                </div>

                                                <div className="mr-3">{getLessonIcon(lesson.type)}</div>

                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center space-x-2">
                                                    <Input
                                                      value={lesson.title}
                                                      onChange={(e) => {
                                                        setCourse((prev) => ({
                                                          ...prev,
                                                          modules: prev.modules.map((m) =>
                                                            m.id === module.id
                                                              ? {
                                                                  ...m,
                                                                  lessons: m.lessons.map((l) =>
                                                                    l.id === lesson.id
                                                                      ? { ...l, title: e.target.value }
                                                                      : l,
                                                                  ),
                                                                }
                                                              : m,
                                                          ),
                                                        }))
                                                      }}
                                                      className="font-medium border-none p-0 h-auto focus-visible:ring-0"
                                                    />
                                                    {lesson.isPreview && (
                                                      <Badge variant="secondary" className="text-xs">
                                                        Превью
                                                      </Badge>
                                                    )}
                                                  </div>
                                                  <p className="text-sm text-muted-foreground">
                                                    {formatDuration(lesson.duration)} • {lesson.type}
                                                  </p>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      setSelectedLesson(lesson)
                                                      setIsLessonDialogOpen(true)
                                                    }}
                                                  >
                                                    <Edit className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteLesson(module.id, lesson.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {module.lessons.length === 0 && (
                                          <div className="text-center py-8 text-muted-foreground">
                                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>Нет уроков в этом модуле</p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="mt-2 bg-transparent"
                                              onClick={() => addLesson(module.id)}
                                            >
                                              <Plus className="w-4 h-4 mr-1" />
                                              Добавить первый урок
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Droppable>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки курса</CardTitle>
                    <CardDescription>Конфигурация доступа и функций курса</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Комментарии</Label>
                        <p className="text-sm text-muted-foreground">Разрешить студентам оставлять комментарии</p>
                      </div>
                      <Switch
                        checked={course.settings.allowComments}
                        onCheckedChange={(checked) =>
                          setCourse((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, allowComments: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Загрузка материалов</Label>
                        <p className="text-sm text-muted-foreground">Разрешить скачивание видео и материалов</p>
                      </div>
                      <Switch
                        checked={course.settings.allowDownloads}
                        onCheckedChange={(checked) =>
                          setCourse((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, allowDownloads: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Сертификат</Label>
                        <p className="text-sm text-muted-foreground">Выдавать сертификат по завершении</p>
                      </div>
                      <Switch
                        checked={course.settings.certificateEnabled}
                        onCheckedChange={(checked) =>
                          setCourse((prev) => ({
                            ...prev,
                            settings: { ...prev.settings, certificateEnabled: checked },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base">Поэтапная подача</Label>
                          <p className="text-sm text-muted-foreground">Открывать уроки постепенно</p>
                        </div>
                        <Switch
                          checked={course.settings.dripContent}
                          onCheckedChange={(checked) =>
                            setCourse((prev) => ({
                              ...prev,
                              settings: { ...prev.settings, dripContent: checked },
                            }))
                          }
                        />
                      </div>

                      {course.settings.dripContent && (
                        <div>
                          <Label>Интервал открытия (дни)</Label>
                          <div className="mt-2">
                            <Slider
                              value={[course.settings.dripInterval]}
                              onValueChange={([value]) =>
                                setCourse((prev) => ({
                                  ...prev,
                                  settings: { ...prev.settings, dripInterval: value },
                                }))
                              }
                              max={30}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span>1 день</span>
                              <span>{course.settings.dripInterval} дней</span>
                              <span>30 дней</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Предпросмотр курса</CardTitle>
                    <CardDescription>Как курс будет выглядеть для студентов</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Course Header */}
                      <div className="flex items-start space-x-6">
                        <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                          <Image
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                          <p className="text-muted-foreground mb-4">{course.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDuration(totalDuration)}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {totalLessons} уроков
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {course.level}
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className="text-2xl font-bold text-primary">{course.price.toLocaleString()} ₽</span>
                          </div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Содержание курса</h2>
                        {course.modules.map((module, moduleIndex) => (
                          <Card key={module.id}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{module.title}</CardTitle>
                              <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                                  >
                                    <div className="flex items-center space-x-3">
                                      {getLessonIcon(lesson.type)}
                                      <div>
                                        <p className="font-medium">{lesson.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {formatDuration(lesson.duration)}
                                        </p>
                                      </div>
                                      {lesson.isPreview && (
                                        <Badge variant="secondary" className="text-xs">
                                          Превью
                                        </Badge>
                                      )}
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Lesson Edit Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать урок</DialogTitle>
            <DialogDescription>Настройте содержание и параметры урока</DialogDescription>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lesson-title">Название урока</Label>
                  <Input
                    id="lesson-title"
                    value={selectedLesson.title}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lesson-type">Тип урока</Label>
                  <Select
                    value={selectedLesson.type}
                    onValueChange={(value: string) => setSelectedLesson({ ...selectedLesson, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Видео</SelectItem>
                      <SelectItem value="text">Текст</SelectItem>
                      <SelectItem value="quiz">Тест</SelectItem>
                      <SelectItem value="assignment">Задание</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="lesson-description">Описание</Label>
                <Textarea
                  id="lesson-description"
                  value={selectedLesson.description}
                  onChange={(e) => setSelectedLesson({ ...selectedLesson, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lesson-duration">Длительность (сек)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    value={selectedLesson.duration}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, duration: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lesson-preview"
                    checked={selectedLesson.isPreview}
                    onCheckedChange={(checked) => setSelectedLesson({ ...selectedLesson, isPreview: checked })}
                  />
                  <Label htmlFor="lesson-preview">Доступен для предпросмотра</Label>
                </div>
              </div>

              {selectedLesson.type === "video" && (
                <div>
                  <Label htmlFor="video-url">URL видео</Label>
                  <Input
                    id="video-url"
                    value={selectedLesson.content.videoUrl || ""}
                    onChange={(e) =>
                      setSelectedLesson({
                        ...selectedLesson,
                        content: { ...selectedLesson.content, videoUrl: e.target.value },
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}

              {selectedLesson.type === "text" && (
                <div>
                  <Label htmlFor="text-content">Текстовое содержание</Label>
                  <Textarea
                    id="text-content"
                    value={selectedLesson.content.textContent || ""}
                    onChange={(e) =>
                      setSelectedLesson({
                        ...selectedLesson,
                        content: { ...selectedLesson.content, textContent: e.target.value },
                      })
                    }
                    rows={6}
                    placeholder="Введите текст урока..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    // Update lesson in course
                    setCourse((prev) => ({
                      ...prev,
                      modules: prev.modules.map((module) => ({
                        ...module,
                        lessons: module.lessons.map((lesson) =>
                          lesson.id === selectedLesson.id ? selectedLesson : lesson,
                        ),
                      })),
                    }))
                    setIsLessonDialogOpen(false)
                  }}
                  className="yoga-gradient text-white"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
