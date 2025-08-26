"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Download,
  Mail,
  MessageSquare,
  MoreVertical,
  UserPlus,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Edit,
  Eye,
  Send,
} from "lucide-react"
import { motion } from "framer-motion"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  status: "active" | "inactive" | "trial"
  registrationDate: string
  lastActivity: string
  totalSpent: number
  coursesCompleted: number
  currentCourses: number
  level: "beginner" | "intermediate" | "advanced"
  tags: string[]
  notes: string
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Анна Петрова",
    email: "anna@example.com",
    phone: "+7 (999) 123-45-67",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    registrationDate: "2024-01-15",
    lastActivity: "2024-01-20",
    totalSpent: 8990,
    coursesCompleted: 2,
    currentCourses: 1,
    level: "intermediate",
    tags: ["VIP", "Постоянный клиент"],
    notes: "Очень мотивированная ученица, быстро прогрессирует",
  },
  {
    id: "2",
    name: "Мария Сидорова",
    email: "maria@example.com",
    phone: "+7 (999) 234-56-78",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    registrationDate: "2024-01-10",
    lastActivity: "2024-01-19",
    totalSpent: 4990,
    coursesCompleted: 1,
    currentCourses: 1,
    level: "beginner",
    tags: ["Новичок"],
    notes: "Нужна дополнительная поддержка и мотивация",
  },
  {
    id: "3",
    name: "Елена Козлова",
    email: "elena@example.com",
    phone: "+7 (999) 345-67-89",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "trial",
    registrationDate: "2024-01-18",
    lastActivity: "2024-01-18",
    totalSpent: 0,
    coursesCompleted: 0,
    currentCourses: 0,
    level: "beginner",
    tags: ["Пробный период"],
    notes: "Интересуется аэройогой",
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false)

  const handleClientSelect = (clientId: string) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  const handleSelectAll = () => {
    setSelectedClients(filteredClients.map((client) => client.id))
  }

  const handleDeselectAll = () => {
    setSelectedClients([])
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesLevel = levelFilter === "all" || client.level === levelFilter

    return matchesSearch && matchesStatus && matchesLevel
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "trial":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активный"
      case "inactive":
        return "Неактивный"
      case "trial":
        return "Пробный"
      default:
        return status
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "Новичок"
      case "intermediate":
        return "Средний"
      case "advanced":
        return "Продвинутый"
      default:
        return level
    }
  }

  const exportClients = () => {
    const csvContent = [
      ["Имя", "Email", "Телефон", "Статус", "Уровень", "Потрачено", "Дата регистрации"].join(","),
      ...filteredClients.map((client) =>
        [
          client.name,
          client.email,
          client.phone,
          getStatusText(client.status),
          getLevelText(client.level),
          client.totalSpent,
          client.registrationDate,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "clients.csv"
    link.click()
  }

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    trial: clients.filter((c) => c.status === "trial").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">CRM клиентов</h1>
              <p className="text-muted-foreground">Управление базой клиентов и взаимодействиями</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={exportClients}>
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <Button className="yoga-gradient text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить клиента
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Всего клиентов</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Активные</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">На пробном</p>
                  <p className="text-2xl font-bold">{stats.trial}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Общий доход</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ₽</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>База клиентов</CardTitle>
                <CardDescription>Управление клиентами и их данными</CardDescription>
              </div>

              {selectedClients.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedClients.length} выбрано</Badge>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Отменить выбор
                  </Button>
                  <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Массовые действия
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Массовые действия</DialogTitle>
                        <DialogDescription>Выберите действие для {selectedClients.length} клиентов</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Отправить email
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Отправить сообщение
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Экспортировать данные
                        </Button>
                        <Button className="w-full justify-start bg-transparent" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Изменить статус
                        </Button>
                        <Button
                          className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                          variant="outline"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить клиентов
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск по имени, email или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="trial">Пробный период</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="beginner">Новичок</SelectItem>
                  <SelectItem value="intermediate">Средний</SelectItem>
                  <SelectItem value="advanced">Продвинутый</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleSelectAll} disabled={filteredClients.length === 0}>
                Выбрать все
              </Button>
            </div>

            {/* Clients Table */}
            <div className="space-y-4">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    selectedClients.includes(client.id) ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => handleClientSelect(client.id)}
                    />

                    <Avatar>
                      <AvatarImage src={client.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {client.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium truncate">{client.name}</p>
                        <Badge className={getStatusColor(client.status)}>{getStatusText(client.status)}</Badge>
                        <Badge variant="outline">{getLevelText(client.level)}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{client.email}</span>
                        <span>{client.phone}</span>
                        <span>Потрачено: {client.totalSpent.toLocaleString()} ₽</span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{client.coursesCompleted}</p>
                        <p className="text-muted-foreground">Завершено</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{client.currentCourses}</p>
                        <p className="text-muted-foreground">Активных</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{new Date(client.lastActivity).toLocaleDateString("ru-RU")}</p>
                        <p className="text-muted-foreground">Последняя активность</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedClient(client)
                          setIsClientDialogOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Просмотр профиля
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="w-4 h-4 mr-2" />
                        Отправить email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Написать сообщение
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        История заказов
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">Клиенты не найдены</p>
                  <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Client Profile Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Профиль клиента</DialogTitle>
            <DialogDescription>Подробная информация о клиенте</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {selectedClient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{selectedClient.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p>{selectedClient.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Телефон</p>
                      <p>{selectedClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Статус</p>
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {getStatusText(selectedClient.status)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Уровень</p>
                      <Badge variant="outline">{getLevelText(selectedClient.level)}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedClient.totalSpent.toLocaleString()} ₽</p>
                    <p className="text-sm text-muted-foreground">Потрачено всего</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedClient.coursesCompleted}</p>
                    <p className="text-sm text-muted-foreground">Курсов завершено</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.currentCourses}</p>
                    <p className="text-sm text-muted-foreground">Активных курсов</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-2">Теги</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Заметки</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {selectedClient.notes || "Заметок нет"}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Написать сообщение
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
