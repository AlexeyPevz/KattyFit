"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Brain, 
  Plus, 
  Edit, 
  Trash2,
  Upload,
  Download,
  Search,
  MessageSquare,
  HelpCircle,
  BookOpen,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KnowledgeItem {
  id: string
  type: "faq" | "dialog_example" | "course_info" | "pricing"
  question?: string
  answer?: string
  context?: any
  is_active: boolean
  created_at: string
}

const typeConfig = {
  faq: { label: "FAQ", icon: HelpCircle, color: "bg-blue-500" },
  dialog_example: { label: "Пример диалога", icon: MessageSquare, color: "bg-green-500" },
  course_info: { label: "Информация о курсах", icon: BookOpen, color: "bg-purple-500" },
  pricing: { label: "Цены", icon: DollarSign, color: "bg-yellow-500" },
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  
  // Форма добавления/редактирования
  const [formData, setFormData] = useState({
    type: "faq" as KnowledgeItem["type"],
    question: "",
    answer: "",
  })

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      setLoading(true)
      // Здесь будет запрос к API
      // Пока используем моковые данные
      const mockData: KnowledgeItem[] = [
        {
          id: "1",
          type: "faq",
          question: "Какая стоимость занятий?",
          answer: "Индивидуальное занятие - 2500₽, групповые - от 800₽, абонемент на 8 занятий - 6000₽ (скидка 20%)",
          is_active: true,
          created_at: "2024-01-15",
        },
        {
          id: "2",
          type: "dialog_example",
          question: "Здравствуйте! Хочу записаться на растяжку",
          answer: "Здравствуйте! Рада вас видеть! У нас есть индивидуальные и групповые занятия. Что вам больше подходит?",
          is_active: true,
          created_at: "2024-01-14",
        },
        {
          id: "3",
          type: "course_info",
          question: "Курс для начинающих",
          answer: "8 занятий по 60 минут. Программа включает базовые упражнения на растяжку всех групп мышц, дыхательные практики и релаксацию.",
          is_active: true,
          created_at: "2024-01-13",
        },
      ]
      setItems(mockData)
    } catch (error) {
      console.error("Ошибка загрузки базы знаний:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || item.type === filterType
    return matchesSearch && matchesType
  })

  const handleSubmit = async () => {
    // Здесь будет сохранение в БД
    console.log("Сохранение:", formData)
    setShowAddDialog(false)
    setEditingItem(null)
    setFormData({ type: "faq", question: "", answer: "" })
    fetchKnowledge()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Удалить этот элемент?")) {
      // Здесь будет удаление из БД
      console.log("Удаление:", id)
      fetchKnowledge()
    }
  }

  const handleImport = async () => {
    // Здесь будет импорт из файла
    console.log("Импорт базы знаний")
  }

  const handleExport = async () => {
    // Здесь будет экспорт в файл
    console.log("Экспорт базы знаний")
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6" />
                База знаний
              </h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Управление базой знаний</CardTitle>
                  <CardDescription>
                    Информация для обучения AI-ассистента
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Импорт
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingItem ? "Редактировать" : "Добавить"} элемент
                        </DialogTitle>
                        <DialogDescription>
                          Заполните информацию для базы знаний
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Тип</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => 
                              setFormData({ ...formData, type: value as KnowledgeItem["type"] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(typeConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="h-4 w-4" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Вопрос / Заголовок</Label>
                          <Input
                            value={formData.question}
                            onChange={(e) => 
                              setFormData({ ...formData, question: e.target.value })
                            }
                            placeholder="Введите вопрос или заголовок"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ответ / Содержание</Label>
                          <Textarea
                            value={formData.answer}
                            onChange={(e) => 
                              setFormData({ ...formData, answer: e.target.value })
                            }
                            placeholder="Введите ответ или содержание"
                            rows={5}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Отмена
                        </Button>
                        <Button onClick={handleSubmit}>
                          Сохранить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Фильтры */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по базе знаний..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Список элементов */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Загрузка...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Элементы не найдены
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const config = typeConfig[item.type]
                    const TypeIcon = config.icon
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${config.color} text-white`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <Badge variant="outline">{config.label}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item)
                                setFormData({
                                  type: item.type,
                                  question: item.question || "",
                                  answer: item.answer || "",
                                })
                                setShowAddDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium mb-1">{item.question}</h3>
                        <p className="text-sm text-muted-foreground">{item.answer}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Добавлено: {new Date(item.created_at).toLocaleDateString("ru")}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}