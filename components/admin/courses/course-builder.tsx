"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Eye, Settings, BookOpen } from "lucide-react"
import Link from "next/link"
import { CourseFormComponent } from "./course-form"
import { ModuleManagerComponent } from "./module-manager"
import { LessonEditorComponent } from "./lesson-editor"
import { Course, CourseModule, CourseLesson, CourseFormData, CourseBuilderState } from "./types"
import logger from "@/lib/logger"

interface CourseBuilderProps {
  initialCourse?: Course
  courseId?: string
}

const defaultCourse: Course = {
  id: "",
  title: "",
  description: "",
  shortDescription: "",
  thumbnail: "",
  level: "beginner",
  duration: 0,
  price: 0,
  isPublished: false,
  modules: [],
  tags: [],
  prerequisites: [],
  learningOutcomes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export function CourseBuilderComponent({ 
  initialCourse = defaultCourse,
  courseId 
}: CourseBuilderProps) {
  const [state, setState] = useState<CourseBuilderState>({
    course: initialCourse,
    selectedModule: null,
    selectedLesson: null,
    isPreviewMode: false,
    isSaving: false,
    hasUnsavedChanges: false
  })

  const [activeTab, setActiveTab] = useState("info")

  const loadCourse = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          course: data.data
        }))
      } else {
        logger.error('Failed to load course', { error: data.error })
      }
    } catch (error) {
      logger.error('Error loading course', { error: error instanceof Error ? error.message : String(error) })
    }
  }, [])

  // Load course data
  useEffect(() => {
    if (courseId) {
      loadCourse(courseId)
    }
  }, [courseId, loadCourse])

  const handleCourseDataChange = useCallback((courseData: CourseFormData) => {
    setState(prev => ({
      ...prev,
      course: {
        ...prev.course,
        ...courseData,
        level: courseData.level as "beginner" | "intermediate" | "advanced"
      },
      hasUnsavedChanges: true
    }))
  }, [])

  const handleModulesChange = useCallback((modules: CourseModule[]) => {
    setState(prev => ({
      ...prev,
      course: {
        ...prev.course,
        modules
      },
      hasUnsavedChanges: true
    }))
  }, [])

  const handleModuleSelect = useCallback((module: CourseModule) => {
    setState(prev => ({
      ...prev,
      selectedModule: module,
      selectedLesson: null
    }))
  }, [])

  const handleLessonSelect = useCallback((lesson: CourseLesson) => {
    setState(prev => ({
      ...prev,
      selectedLesson: lesson
    }))
  }, [])

  const handleLessonUpdate = useCallback((lesson: CourseLesson) => {
    setState(prev => {
      const updatedModules = prev.course.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(l => l.id === lesson.id ? lesson : l)
      }))

      return {
        ...prev,
        course: {
          ...prev.course,
          modules: updatedModules
        },
        selectedLesson: lesson,
        hasUnsavedChanges: true
      }
    })
  }, [])

  const handleLessonDelete = useCallback((lessonId: string) => {
    setState(prev => {
      const updatedModules = prev.course.modules.map(module => ({
        ...module,
        lessons: module.lessons.filter(l => l.id !== lessonId)
      }))

      return {
        ...prev,
        course: {
          ...prev.course,
          modules: updatedModules
        },
        selectedLesson: null,
        hasUnsavedChanges: true
      }
    })
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isSaving: true }))
      
      const url = state.course.id ? `/api/admin/courses/${state.course.id}` : '/api/admin/courses'
      const method = state.course.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.course)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setState(prev => ({
          ...prev,
          course: data.data,
          hasUnsavedChanges: false,
          isSaving: false
        }))
        logger.info('Course saved successfully', { courseId: data.data.id })
      } else {
        logger.error('Failed to save course', { error: data.error })
      }
    } catch (error) {
      logger.error('Error saving course', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [state.course])

  const handlePreview = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode
    }))
  }, [])

  const calculateTotalDuration = useMemo(() => {
    return state.course.modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + lesson.duration
      }, 0)
    }, 0)
  }, [state.course.modules])

  const getTotalLessons = useMemo(() => {
    return state.course.modules.reduce((total, module) => total + module.lessons.length, 0)
  }, [state.course.modules])

  return (
    <AdminGuard>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к курсам
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {state.course.id ? "Редактировать курс" : "Создать курс"}
              </h1>
              <p className="text-muted-foreground">
                {state.course.title || "Новый курс"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              {state.isPreviewMode ? "Редактировать" : "Превью"}
            </Button>
            <Button onClick={handleSave} disabled={state.isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {state.isSaving ? "Сохранение..." : "Сохранить"}
              {state.hasUnsavedChanges && (
                <span className="ml-2 text-xs text-orange-500">*</span>
              )}
            </Button>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Модули</p>
                  <p className="text-2xl font-bold">{state.course.modules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Уроки</p>
                  <p className="text-2xl font-bold">{getTotalLessons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Длительность</p>
                  <p className="text-2xl font-bold">{calculateTotalDuration} мин</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Цена</p>
                  <p className="text-2xl font-bold">{state.course.price} ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Course Info and Modules */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="info" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Информация</span>
                </TabsTrigger>
                <TabsTrigger value="modules" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Модули</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <CourseFormComponent
                  courseData={{
                    title: state.course.title,
                    description: state.course.description,
                    shortDescription: state.course.shortDescription,
                    thumbnail: state.course.thumbnail,
                    level: state.course.level,
                    price: state.course.price,
                    tags: state.course.tags,
                    prerequisites: state.course.prerequisites,
                    learningOutcomes: state.course.learningOutcomes
                  }}
                  onCourseDataChange={handleCourseDataChange}
                  onSave={handleSave}
                  isSaving={state.isSaving}
                  hasUnsavedChanges={state.hasUnsavedChanges}
                />
              </TabsContent>

              <TabsContent value="modules">
                <ModuleManagerComponent
                  modules={state.course.modules}
                  onModulesChange={handleModulesChange}
                  onModuleSelect={handleModuleSelect}
                  onLessonSelect={handleLessonSelect}
                  selectedModuleId={state.selectedModule?.id}
                  selectedLessonId={state.selectedLesson?.id}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Lesson Editor */}
          <div className="lg:col-span-1">
            <LessonEditorComponent
              lesson={state.selectedLesson}
              onLessonUpdate={handleLessonUpdate}
              onLessonDelete={handleLessonDelete}
              isVisible={!!state.selectedLesson}
            />
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}