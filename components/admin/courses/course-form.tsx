"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Upload, Save } from "lucide-react"
import { CourseFormData } from "./types"

interface CourseFormProps {
  courseData: CourseFormData
  onCourseDataChange: (data: CourseFormData) => void
  onSave: () => void
  isSaving?: boolean
  hasUnsavedChanges?: boolean
}

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Начинающий" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" }
]

const PREDEFINED_TAGS = [
  "JavaScript",
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps"
]

export function CourseFormComponent({
  courseData,
  onCourseDataChange,
  onSave,
  isSaving = false,
  hasUnsavedChanges = false
}: CourseFormProps) {
  const [newTag, setNewTag] = useState("")
  const [newPrerequisite, setNewPrerequisite] = useState("")
  const [newOutcome, setNewOutcome] = useState("")

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    onCourseDataChange({
      ...courseData,
      [field]: value
    })
  }

  const handleArrayAdd = (field: 'tags' | 'prerequisites' | 'learningOutcomes', value: string) => {
    if (value.trim() && !courseData[field].includes(value.trim())) {
      onCourseDataChange({
        ...courseData,
        [field]: [...courseData[field], value.trim()]
      })
    }
  }

  const handleArrayRemove = (field: 'tags' | 'prerequisites' | 'learningOutcomes', value: string) => {
    onCourseDataChange({
      ...courseData,
      [field]: courseData[field].filter(item => item !== value)
    })
  }

  const handlePredefinedTagAdd = (tag: string) => {
    handleArrayAdd('tags', tag)
  }

  const handleCustomTagAdd = () => {
    if (newTag.trim()) {
      handleArrayAdd('tags', newTag.trim())
      setNewTag("")
    }
  }

  const handlePrerequisiteAdd = () => {
    if (newPrerequisite.trim()) {
      handleArrayAdd('prerequisites', newPrerequisite.trim())
      setNewPrerequisite("")
    }
  }

  const handleOutcomeAdd = () => {
    if (newOutcome.trim()) {
      handleArrayAdd('learningOutcomes', newOutcome.trim())
      setNewOutcome("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
          <CardDescription>
            Заполните основную информацию о курсе
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название курса *</Label>
              <Input
                id="title"
                value={courseData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Введите название курса"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Уровень сложности</Label>
              <Select
                value={courseData.level}
                onValueChange={(value) => handleInputChange('level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Краткое описание *</Label>
            <Textarea
              id="shortDescription"
              value={courseData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Краткое описание курса (1-2 предложения)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Полное описание *</Label>
            <Textarea
              id="description"
              value={courseData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Подробное описание курса"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={courseData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">URL обложки</Label>
              <div className="flex space-x-2">
                <Input
                  id="thumbnail"
                  value={courseData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Теги</CardTitle>
          <CardDescription>
            Добавьте теги для категоризации курса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Предустановленные теги</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={courseData.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handlePredefinedTagAdd(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Добавить свой тег"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCustomTagAdd()
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleCustomTagAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {courseData.tags.length > 0 && (
            <div className="space-y-2">
              <Label>Выбранные теги</Label>
              <div className="flex flex-wrap gap-2">
                {courseData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleArrayRemove('tags', tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle>Предварительные требования</CardTitle>
          <CardDescription>
            Что должен знать студент перед началом курса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              placeholder="Добавить требование"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handlePrerequisiteAdd()
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handlePrerequisiteAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {courseData.prerequisites.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {courseData.prerequisites.map((prerequisite, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {prerequisite}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleArrayRemove('prerequisites', prerequisite)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle>Результаты обучения</CardTitle>
          <CardDescription>
            Что студент узнает после прохождения курса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              placeholder="Добавить результат обучения"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleOutcomeAdd()
                }
              }}
            />
            <Button variant="outline" size="sm" onClick={handleOutcomeAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {courseData.learningOutcomes.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {courseData.learningOutcomes.map((outcome, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {outcome}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleArrayRemove('learningOutcomes', outcome)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Сохранение..." : "Сохранить курс"}
          {hasUnsavedChanges && (
            <Badge variant="outline" className="ml-2">
              Несохранено
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}
