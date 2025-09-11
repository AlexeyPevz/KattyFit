"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { GripVertical, Plus, Edit, Trash2, ChevronDown, ChevronRight, Eye } from "lucide-react"
import { CourseModule, CourseLesson } from "./types"

interface ModuleManagerProps {
  modules: CourseModule[]
  onModulesChange: (modules: CourseModule[]) => void
  onModuleSelect: (module: CourseModule) => void
  onLessonSelect: (lesson: CourseLesson) => void
  selectedModuleId?: string
  selectedLessonId?: string
}

export function ModuleManagerComponent({
  modules,
  onModulesChange,
  onModuleSelect,
  onLessonSelect,
  selectedModuleId,
  selectedLessonId
}: ModuleManagerProps) {
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null)
  const [moduleFormData, setModuleFormData] = useState({
    title: "",
    description: ""
  })

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const newModules = Array.from(modules)

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same module
      if (source.droppableId.startsWith('module-')) {
        const moduleIndex = parseInt(source.droppableId.split('-')[1])
        const module = newModules[moduleIndex]
        const reorderedLessons = Array.from(module.lessons)
        const [removed] = reorderedLessons.splice(source.index, 1)
        reorderedLessons.splice(destination.index, 0, removed)

        // Update order numbers
        reorderedLessons.forEach((lesson, index) => {
          lesson.order = index
        })

        newModules[moduleIndex] = {
          ...module,
          lessons: reorderedLessons
        }
      } else {
        // Reordering modules
        const [removed] = newModules.splice(source.index, 1)
        newModules.splice(destination.index, 0, removed)

        // Update order numbers
        newModules.forEach((module, index) => {
          module.order = index
        })
      }
    } else {
      // Moving lesson between modules
      const sourceModuleIndex = parseInt(source.droppableId.split('-')[1])
      const destModuleIndex = parseInt(destination.droppableId.split('-')[1])
      
      const sourceModule = newModules[sourceModuleIndex]
      const destModule = newModules[destModuleIndex]
      
      const [movedLesson] = sourceModule.lessons.splice(source.index, 1)
      destModule.lessons.splice(destination.index, 0, movedLesson)

      // Update order numbers
      sourceModule.lessons.forEach((lesson, index) => {
        lesson.order = index
      })
      destModule.lessons.forEach((lesson, index) => {
        lesson.order = index
      })
    }

    onModulesChange(newModules)
  }

  const handleAddModule = () => {
    if (moduleFormData.title.trim()) {
      const newModule: CourseModule = {
        id: `module-${Date.now()}`,
        title: moduleFormData.title.trim(),
        description: moduleFormData.description.trim(),
        lessons: [],
        order: modules.length,
        isExpanded: true
      }
      
      onModulesChange([...modules, newModule])
      setModuleFormData({ title: "", description: "" })
      setIsAddModuleDialogOpen(false)
    }
  }

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module)
    setModuleFormData({
      title: module.title,
      description: module.description
    })
    setIsAddModuleDialogOpen(true)
  }

  const handleUpdateModule = () => {
    if (editingModule && moduleFormData.title.trim()) {
      const updatedModules = modules.map(module =>
        module.id === editingModule.id
          ? {
              ...module,
              title: moduleFormData.title.trim(),
              description: moduleFormData.description.trim()
            }
          : module
      )
      
      onModulesChange(updatedModules)
      setEditingModule(null)
      setModuleFormData({ title: "", description: "" })
      setIsAddModuleDialogOpen(false)
    }
  }

  const handleDeleteModule = (moduleId: string) => {
    onModulesChange(modules.filter(module => module.id !== moduleId))
  }

  const handleToggleModule = (moduleId: string) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId
        ? { ...module, isExpanded: !module.isExpanded }
        : module
    )
    onModulesChange(updatedModules)
  }

  const handleAddLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (module) {
      const newLesson: CourseLesson = {
        id: `lesson-${Date.now()}`,
        title: "Новый урок",
        description: "",
        type: "video",
        duration: 0,
        content: {},
        isPreview: false,
        order: module.lessons.length
      }
      
      const updatedModules = modules.map(m =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      )
      
      onModulesChange(updatedModules)
      onLessonSelect(newLesson)
    }
  }

  const getLessonIcon = (type: CourseLesson['type']) => {
    switch (type) {
      case 'video':
        return '🎥'
      case 'text':
        return '📄'
      case 'quiz':
        return '❓'
      case 'assignment':
        return '📝'
      default:
        return '📄'
    }
  }

  const getLessonTypeLabel = (type: CourseLesson['type']) => {
    switch (type) {
      case 'video':
        return 'Видео'
      case 'text':
        return 'Текст'
      case 'quiz':
        return 'Квиз'
      case 'assignment':
        return 'Задание'
      default:
        return 'Урок'
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Модули курса</CardTitle>
              <CardDescription>
                Управляйте модулями и уроками курса
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddModuleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить модуль
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="modules">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <Draggable key={module.id} draggableId={module.id} index={moduleIndex}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`cursor-pointer transition-colors ${
                            selectedModuleId === module.id ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <CardHeader
                            className="pb-3"
                            onClick={() => onModuleSelect(module)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleModule(module.id)
                                  }}
                                >
                                  {module.isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <CardTitle className="text-base">{module.title}</CardTitle>
                                  {module.description && (
                                    <CardDescription className="text-sm">
                                      {module.description}
                                    </CardDescription>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {module.lessons.length} уроков
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEditModule(module)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteModule(module.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {module.isExpanded && (
                            <CardContent className="pt-0">
                              <Droppable droppableId={`module-${moduleIndex}`}>
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                              selectedLessonId === lesson.id 
                                                ? 'bg-blue-50 border-blue-300' 
                                                : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => onLessonSelect(lesson)}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <div {...provided.dragHandleProps}>
                                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <span className="text-lg">
                                                  {getLessonIcon(lesson.type)}
                                                </span>
                                                <div>
                                                  <div className="font-medium">{lesson.title}</div>
                                                  <div className="text-sm text-gray-500">
                                                    {getLessonTypeLabel(lesson.type)} • {lesson.duration} мин
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                {lesson.isPreview && (
                                                  <Badge variant="outline" className="text-xs">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Превью
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => handleAddLesson(module.id)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Добавить урок
                                    </Button>
                                  </div>
                                )}
                              </Droppable>
                            </CardContent>
                          )}
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>

      {/* Add/Edit Module Dialog */}
      <Dialog open={isAddModuleDialogOpen} onOpenChange={setIsAddModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Редактировать модуль" : "Добавить модуль"}
            </DialogTitle>
            <DialogDescription>
              {editingModule 
                ? "Внесите изменения в информацию о модуле"
                : "Заполните информацию о новом модуле"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Название модуля *</Label>
              <Input
                id="module-title"
                value={moduleFormData.title}
                onChange={(e) => setModuleFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название модуля"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Описание модуля</Label>
              <Textarea
                id="module-description"
                value={moduleFormData.description}
                onChange={(e) => setModuleFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Введите описание модуля"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddModuleDialogOpen(false)
                setEditingModule(null)
                setModuleFormData({ title: "", description: "" })
              }}
            >
              Отмена
            </Button>
            <Button onClick={editingModule ? handleUpdateModule : handleAddModule}>
              {editingModule ? "Сохранить изменения" : "Добавить модуль"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}