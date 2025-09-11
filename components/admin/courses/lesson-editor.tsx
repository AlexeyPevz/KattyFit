"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Play, 
  FileText, 
  Video, 
  PuzzleIcon as Quiz, 
  Eye, 
  Plus, 
  Trash2,
  Save,
  Clock
} from "lucide-react"
import { CourseLesson, LessonFormData, QuizQuestion } from "./types"

interface LessonEditorProps {
  lesson: CourseLesson | null
  onLessonUpdate: (lesson: CourseLesson) => void
  onLessonDelete: (lessonId: string) => void
  isVisible: boolean
}

const LESSON_TYPES = [
  { value: "video", label: "Видео", icon: "🎥" },
  { value: "text", label: "Текст", icon: "📄" },
  { value: "quiz", label: "Квиз", icon: "❓" },
  { value: "assignment", label: "Задание", icon: "📝" }
]

export function LessonEditorComponent({
  lesson,
  onLessonUpdate,
  onLessonDelete,
  isVisible
}: LessonEditorProps) {
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    type: "video",
    duration: 0,
    content: {}
  })
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState({
    question: "",
    type: "single" as const,
    options: [""],
    correctAnswers: [] as number[],
    explanation: "",
    points: 1
  })

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        duration: lesson.duration,
        content: lesson.content
      })
    }
  }, [lesson])

  const handleInputChange = (field: keyof LessonFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContentChange = (field: string, value: string | QuizQuestion[]) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    if (lesson && formData.title.trim()) {
      const updatedLesson: CourseLesson = {
        ...lesson,
        ...formData
      }
      onLessonUpdate(updatedLesson)
    }
  }

  const handleDelete = () => {
    if (lesson) {
      onLessonDelete(lesson.id)
    }
  }

  const handleAddQuestion = () => {
    if (questionForm.question.trim()) {
      const newQuestion: QuizQuestion = {
        id: `question-${Date.now()}`,
        question: questionForm.question.trim(),
        type: questionForm.type,
        options: questionForm.options.filter(opt => opt.trim()),
        correctAnswers: questionForm.correctAnswers,
        explanation: questionForm.explanation,
        points: questionForm.points
      }

      const currentQuestions = (formData.content.quizQuestions || []) as QuizQuestion[]
      handleContentChange('quizQuestions', [...currentQuestions, newQuestion])
      
      setQuestionForm({
        question: "",
        type: "single",
        options: [""],
        correctAnswers: [],
        explanation: "",
        points: 1
      })
      setIsQuizDialogOpen(false)
    }
  }

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question)
    setQuestionForm({
      question: question.question,
      type: question.type,
      options: question.options,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation || "",
      points: question.points
    })
    setIsQuizDialogOpen(true)
  }

  const handleUpdateQuestion = () => {
    if (editingQuestion && questionForm.question.trim()) {
      const updatedQuestion: QuizQuestion = {
        ...editingQuestion,
        question: questionForm.question.trim(),
        type: questionForm.type,
        options: questionForm.options.filter(opt => opt.trim()),
        correctAnswers: questionForm.correctAnswers,
        explanation: questionForm.explanation,
        points: questionForm.points
      }

      const currentQuestions = (formData.content.quizQuestions || []) as QuizQuestion[]
      const updatedQuestions = currentQuestions.map(q => 
        q.id === editingQuestion.id ? updatedQuestion : q
      )
      
      handleContentChange('quizQuestions', updatedQuestions)
      
      setEditingQuestion(null)
      setQuestionForm({
        question: "",
        type: "single",
        options: [""],
        correctAnswers: [],
        explanation: "",
        points: 1
      })
      setIsQuizDialogOpen(false)
    }
  }

  const handleDeleteQuestion = (questionId: string) => {
    const currentQuestions = (formData.content.quizQuestions || []) as QuizQuestion[]
    const updatedQuestions = currentQuestions.filter(q => q.id !== questionId)
    handleContentChange('quizQuestions', updatedQuestions)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionForm.options]
    newOptions[index] = value
    setQuestionForm(prev => ({ ...prev, options: newOptions }))
  }

  const handleAddOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }))
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = questionForm.options.filter((_, i) => i !== index)
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions,
      correctAnswers: prev.correctAnswers.filter(i => i !== index)
    }))
  }

  const handleCorrectAnswerToggle = (index: number) => {
    const newCorrectAnswers = questionForm.correctAnswers.includes(index)
      ? questionForm.correctAnswers.filter(i => i !== index)
      : [...questionForm.correctAnswers, index]
    
    setQuestionForm(prev => ({ ...prev, correctAnswers: newCorrectAnswers }))
  }

  if (!isVisible || !lesson) {
    return null
  }

  const currentType = LESSON_TYPES.find(t => t.value === formData.type)
  const quizQuestions = (formData.content.quizQuestions || []) as QuizQuestion[]

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{currentType?.icon}</span>
              <div>
                <CardTitle>Редактирование урока</CardTitle>
                <CardDescription>
                  {currentType?.label} • {formData.duration} мин
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Название урока *</Label>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Введите название урока"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-type">Тип урока</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Описание урока</Label>
            <Textarea
              id="lesson-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Введите описание урока"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Длительность (минуты)</Label>
              <Input
                id="lesson-duration"
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="lesson-preview"
                checked={lesson.isPreview}
                onCheckedChange={(checked) => {
                  if (lesson) {
                    onLessonUpdate({ ...lesson, isPreview: checked })
                  }
                }}
              />
              <Label htmlFor="lesson-preview">Доступен для превью</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle>Содержимое урока</CardTitle>
          <CardDescription>
            Настройте содержимое урока в зависимости от его типа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <TabsList>
              <TabsTrigger value="video">Видео</TabsTrigger>
              <TabsTrigger value="text">Текст</TabsTrigger>
              <TabsTrigger value="quiz">Квиз</TabsTrigger>
              <TabsTrigger value="assignment">Задание</TabsTrigger>
            </TabsList>

            <TabsContent value="video" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">URL видео</Label>
                <Input
                  id="video-url"
                  value={formData.content.videoUrl || ""}
                  onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-content">Текстовое содержимое</Label>
                <Textarea
                  id="text-content"
                  value={formData.content.textContent || ""}
                  onChange={(e) => handleContentChange('textContent', e.target.value)}
                  placeholder="Введите текстовое содержимое урока"
                  rows={10}
                />
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Вопросы квиза</h3>
                  <p className="text-sm text-gray-500">
                    {quizQuestions.length} вопросов
                  </p>
                </div>
                <Button onClick={() => setIsQuizDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить вопрос
                </Button>
              </div>

              <div className="space-y-3">
                {quizQuestions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Вопрос {index + 1}</Badge>
                            <Badge variant="secondary">{question.points} баллов</Badge>
                          </div>
                          <p className="font-medium">{question.question}</p>
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-sm p-2 rounded ${
                                  question.correctAnswers.includes(optIndex)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-text">Текст задания</Label>
                <Textarea
                  id="assignment-text"
                  value={formData.content.assignmentText || ""}
                  onChange={(e) => handleContentChange('assignmentText', e.target.value)}
                  placeholder="Введите текст задания для студентов"
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quiz Question Dialog */}
      <Dialog open={isQuizDialogOpen} onOpenChange={setIsQuizDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Редактировать вопрос" : "Добавить вопрос"}
            </DialogTitle>
            <DialogDescription>
              Создайте вопрос для квиза
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">Текст вопроса *</Label>
              <Textarea
                id="question-text"
                value={questionForm.question}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Введите текст вопроса"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="question-type">Тип вопроса</Label>
                <Select
                  value={questionForm.type}
                  onValueChange={(value: "single" | "multiple") => 
                    setQuestionForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Один ответ</SelectItem>
                    <SelectItem value="multiple">Несколько ответов</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-points">Баллы</Label>
                <Input
                  id="question-points"
                  type="number"
                  min="1"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, points: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Варианты ответов</Label>
              <div className="space-y-2">
                {questionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCorrectAnswerToggle(index)}
                      className={questionForm.correctAnswers.includes(index) ? "bg-green-100" : ""}
                    >
                      ✓
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить вариант
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-explanation">Объяснение (необязательно)</Label>
              <Textarea
                id="question-explanation"
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Объяснение правильного ответа"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsQuizDialogOpen(false)
                setEditingQuestion(null)
                setQuestionForm({
                  question: "",
                  type: "single",
                  options: [""],
                  correctAnswers: [],
                  explanation: "",
                  points: 1
                })
              }}
            >
              Отмена
            </Button>
            <Button onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}>
              {editingQuestion ? "Сохранить изменения" : "Добавить вопрос"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}