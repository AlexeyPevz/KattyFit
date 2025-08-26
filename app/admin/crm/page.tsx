"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  ShoppingCart,
  Target,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

// Этапы воронки продаж
const salesFunnelStages = [
  { id: "new", name: "Новый лид", color: "bg-blue-500", icon: UserPlus },
  { id: "contacted", name: "Первый контакт", color: "bg-yellow-500", icon: MessageSquare },
  { id: "interested", name: "Заинтересован", color: "bg-orange-500", icon: Zap },
  { id: "negotiation", name: "Переговоры", color: "bg-purple-500", icon: Target },
  { id: "customer", name: "Клиент", color: "bg-green-500", icon: CheckCircle2 },
  { id: "lost", name: "Потерян", color: "bg-red-500", icon: XCircle },
]

// Моковые данные лидов
const mockLeads = [
  {
    id: "1",
    name: "Анна Петрова",
    email: "anna@example.com",
    phone: "+7 999 123-45-67",
    source: "Instagram",
    stage: "new",
    value: 2990,
    createdAt: "2024-01-15",
    lastContact: null,
    notes: "Интересуется курсом растяжки",
    tags: ["растяжка", "новичок"],
    score: 85,
  },
  {
    id: "2", 
    name: "Мария Иванова",
    email: "maria@example.com",
    phone: "+7 999 234-56-78",
    source: "Сайт",
    stage: "contacted",
    value: 11250,
    createdAt: "2024-01-14",
    lastContact: "2024-01-15",
    notes: "Хочет пакет на 5 занятий",
    tags: ["тренировки", "пакет"],
    score: 72,
  },
  {
    id: "3",
    name: "Елена Сидорова",
    email: "elena@example.com",
    phone: "+7 999 345-67-89",
    source: "Telegram",
    stage: "interested",
    value: 5990,
    createdAt: "2024-01-13",
    lastContact: "2024-01-14",
    notes: "Рассматривает продвинутый курс",
    tags: ["продвинутый", "курс"],
    score: 68,
  },
  {
    id: "4",
    name: "Ольга Козлова",
    email: "olga@example.com",
    phone: "+7 999 456-78-90",
    source: "VK",
    stage: "negotiation",
    value: 21250,
    createdAt: "2024-01-12",
    lastContact: "2024-01-15",
    notes: "Обсуждаем пакет на 10 занятий",
    tags: ["тренировки", "пакет", "vip"],
    score: 92,
  },
  {
    id: "5",
    name: "Светлана Морозова",
    email: "svetlana@example.com",
    phone: "+7 999 567-89-01",
    source: "Реферал",
    stage: "customer",
    value: 2990,
    createdAt: "2024-01-10",
    lastContact: "2024-01-11",
    notes: "Купила курс для начинающих",
    tags: ["клиент", "курс", "реферал"],
    score: 100,
  },
]

// Статистика воронки
const funnelStats = {
  new: 12,
  contacted: 8,
  interested: 5,
  negotiation: 3,
  customer: 2,
  lost: 1,
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  source: string
  stage: string
  value: number
  createdAt: string
  lastContact: string | null
  notes: string
  tags: string[]
  score: number
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showLeadDialog, setShowLeadDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStage, setFilterStage] = useState("all")
  const [filterSource, setFilterSource] = useState("all")

  // Фильтрация лидов
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery)
    const matchesStage = filterStage === "all" || lead.stage === filterStage
    const matchesSource = filterSource === "all" || lead.source === filterSource
    
    return matchesSearch && matchesStage && matchesSource
  })

  // Статистика
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.stage === "new").length,
    totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
    conversionRate: Math.round((leads.filter(l => l.stage === "customer").length / leads.length) * 100),
  }

  // Перемещение лида по воронке
  const moveLeadToStage = (leadId: string, newStage: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, stage: newStage, lastContact: new Date().toISOString().split('T')[0] }
        : lead
    ))
    // Fire-and-forget PATCH to backend
    fetch('/api/crm/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, stage: newStage })
    }).catch(() => {})
  }

  // Форматирование даты
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Сегодня"
    if (diffDays === 1) return "Вчера"
    if (diffDays < 7) return `${diffDays} дней назад`
    
    return date.toLocaleDateString("ru-RU")
  }

  // Цвет score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
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
              <h1 className="text-2xl font-bold">CRM</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          {/* Статистика */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newLeads} новых за неделю
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Потенциальная выручка</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} ₽</div>
                <p className="text-xs text-muted-foreground">
                  Сумма всех сделок
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Лид → Клиент
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активность</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">
                  Обработано за 24ч
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="funnel" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="funnel">
                <BarChart3 className="h-4 w-4 mr-2" />
                Воронка
              </TabsTrigger>
              <TabsTrigger value="leads">
                <Users className="h-4 w-4 mr-2" />
                Лиды
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Аналитика
              </TabsTrigger>
            </TabsList>

            {/* Воронка продаж */}
            <TabsContent value="funnel">
              <Card>
                <CardHeader>
                  <CardTitle>Воронка продаж</CardTitle>
                  <CardDescription>
                    Визуализация движения лидов по этапам
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Визуализация воронки */}
                    <div className="relative">
                      {salesFunnelStages.slice(0, -1).map((stage, index) => {
                        const stageLeads = leads.filter(l => l.stage === stage.id)
                        const percentage = (stageLeads.length / leads.length) * 100
                        const Icon = stage.icon
                        
                        return (
                          <div key={stage.id} className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${stage.color} text-white`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{stage.name}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                  {stageLeads.length} лидов
                                </span>
                                <span className="text-sm font-medium">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="h-12 bg-muted rounded-lg overflow-hidden">
                                <div 
                                  className={`h-full ${stage.color} bg-opacity-20 relative`}
                                  style={{ width: `${100 - index * 15}%` }}
                                >
                                  <div className={`absolute inset-0 ${stage.color} bg-opacity-40`} />
                                </div>
                              </div>
                              {index < salesFunnelStages.length - 2 && (
                                <ChevronRight className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Карточки лидов по этапам */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {salesFunnelStages.map(stage => {
                        const stageLeads = leads.filter(l => l.stage === stage.id)
                        const Icon = stage.icon
                        
                        return (
                          <Card key={stage.id} className="overflow-hidden">
                            <div className={`h-2 ${stage.color}`} />
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <CardTitle className="text-base">{stage.name}</CardTitle>
                                </div>
                                <Badge variant="secondary">{stageLeads.length}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {stageLeads.slice(0, 3).map(lead => (
                                  <div 
                                    key={lead.id}
                                    className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted p-2 rounded"
                                    onClick={() => {
                                      setSelectedLead(lead)
                                      setShowLeadDialog(true)
                                    }}
                                  >
                                    <span className="font-medium">{lead.name}</span>
                                    <span className="text-muted-foreground">
                                      {lead.value.toLocaleString()} ₽
                                    </span>
                                  </div>
                                ))}
                                {stageLeads.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center pt-2">
                                    +{stageLeads.length - 3} еще
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Kanban */}
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Kanban: Лиды по этапам</CardTitle>
                      <CardDescription>Перетаскивайте карточки между этапами</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DragDropContext
                    onDragEnd={(result: DropResult) => {
                      const { draggableId, destination, source } = result
                      if (!destination) return
                      const newStage = destination.droppableId
                      const leadId = draggableId
                      const srcStage = source.droppableId
                      if (newStage === srcStage) return
                      moveLeadToStage(leadId, newStage)
                    }}
                  >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {salesFunnelStages.map((stage) => (
                        <Droppable droppableId={stage.id} key={stage.id}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                              <Card className="overflow-hidden">
                                <div className={`h-2 ${stage.color}`} />
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <stage.icon className="h-4 w-4" />
                                      <CardTitle className="text-base">{stage.name}</CardTitle>
                                    </div>
                                    <Badge variant="secondary">
                                      {leads.filter(l => l.stage === stage.id).length}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2 min-h-[60px]">
                                    {leads.filter(l => l.stage === stage.id).map((lead, index) => (
                                      <Draggable draggableId={lead.id} index={index} key={lead.id}>
                                        {(p) => (
                                          <div
                                            ref={p.innerRef}
                                            {...p.draggableProps}
                                            {...p.dragHandleProps}
                                            className="flex items-center justify-between text-sm cursor-grab active:cursor-grabbing hover:bg-muted p-2 rounded border"
                                            onClick={() => { setSelectedLead(lead); setShowLeadDialog(true) }}
                                          >
                                            <span className="font-medium line-clamp-1">{lead.name}</span>
                                            <span className="text-muted-foreground">{lead.value.toLocaleString()} ₽</span>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </DragDropContext>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Список лидов */}
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Все лиды</CardTitle>
                      <CardDescription>
                        Управление контактами и сделками
                      </CardDescription>
                    </div>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Добавить лида
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Фильтры */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск по имени, email, телефону..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStage} onValueChange={setFilterStage}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Этап" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все этапы</SelectItem>
                        {salesFunnelStages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterSource} onValueChange={setFilterSource}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Источник" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все источники</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Telegram">Telegram</SelectItem>
                        <SelectItem value="VK">VK</SelectItem>
                        <SelectItem value="Сайт">Сайт</SelectItem>
                        <SelectItem value="Реферал">Реферал</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Таблица лидов */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Имя</TableHead>
                        <TableHead>Контакты</TableHead>
                        <TableHead>Источник</TableHead>
                        <TableHead>Этап</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Последний контакт</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => {
                        const stage = salesFunnelStages.find(s => s.id === lead.stage)
                        const Icon = stage?.icon || UserPlus
                        
                        return (
                          <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell onClick={() => {
                              setSelectedLead(lead)
                              setShowLeadDialog(true)
                            }}>
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                <div className="flex gap-1 mt-1">
                                  {lead.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{lead.source}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${stage?.color} text-white`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="text-sm">{stage?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {lead.value.toLocaleString()} ₽
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={lead.score} className="w-16 h-2" />
                                <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                                  {lead.score}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(lead.lastContact)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Позвонить
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Написать email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Написать в чат
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Переместить в этап</DropdownMenuLabel>
                                  {salesFunnelStages.map(s => (
                                    <DropdownMenuItem
                                      key={s.id}
                                      onClick={() => moveLeadToStage(lead.id, s.id)}
                                      disabled={s.id === lead.stage}
                                    >
                                      <s.icon className="h-4 w-4 mr-2" />
                                      {s.name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Аналитика */}
            <TabsContent value="analytics">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Источники лидов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Instagram", "Telegram", "VK", "Сайт", "Реферал"].map(source => {
                        const sourceLeads = leads.filter(l => l.source === source)
                        const percentage = (sourceLeads.length / leads.length) * 100
                        
                        return (
                          <div key={source}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{source}</span>
                              <span className="text-sm text-muted-foreground">
                                {sourceLeads.length} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Конверсия по источникам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {["Instagram", "Telegram", "VK", "Сайт", "Реферал"].map(source => {
                        const sourceLeads = leads.filter(l => l.source === source)
                        const customers = sourceLeads.filter(l => l.stage === "customer")
                        const conversion = sourceLeads.length > 0 
                          ? (customers.length / sourceLeads.length) * 100 
                          : 0
                        
                        return (
                          <div key={source} className="flex items-center justify-between">
                            <span className="text-sm">{source}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={conversion} className="w-24 h-2" />
                              <span className="text-sm font-medium w-12 text-right">
                                {conversion.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Средний чек по продуктам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Курсы</span>
                        <span className="font-bold">3,874 ₽</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Разовые тренировки</span>
                        <span className="font-bold">2,500 ₽</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Пакеты тренировок</span>
                        <span className="font-bold">16,250 ₽</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Время закрытия сделки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold">3.5</p>
                        <p className="text-sm text-muted-foreground">дней в среднем</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Минимум</span>
                          <span className="font-medium">1 день</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Максимум</span>
                          <span className="font-medium">14 дней</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Диалог детальной информации о лиде */}
        <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Карточка лида</DialogTitle>
              <DialogDescription>
                Детальная информация и история взаимодействий
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-6">
                {/* Основная информация */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input value={selectedLead.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={selectedLead.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Телефон</Label>
                    <Input value={selectedLead.phone} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Источник</Label>
                    <Input value={selectedLead.source} readOnly />
                  </div>
                </div>

                {/* Этап и сумма */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Текущий этап</Label>
                    <Select value={selectedLead.stage} onValueChange={(value) => {
                      moveLeadToStage(selectedLead.id, value)
                      setSelectedLead({ ...selectedLead, stage: value })
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {salesFunnelStages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Сумма сделки</Label>
                    <Input value={`${selectedLead.value.toLocaleString()} ₽`} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Lead Score</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedLead.score} className="flex-1" />
                      <span className={`font-medium ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Заметки */}
                <div className="space-y-2">
                  <Label>Заметки</Label>
                  <Textarea
                    value={selectedLead.notes}
                    onChange={(e) => {
                      const updatedLead = { ...selectedLead, notes: e.target.value }
                      setSelectedLead(updatedLead)
                      setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l))
                    }}
                    rows={3}
                  />
                </div>

                {/* История */}
                <div className="space-y-2">
                  <Label>История взаимодействий</Label>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Лид создан</p>
                        <p className="text-xs text-muted-foreground">{formatDate(selectedLead.createdAt)}</p>
                      </div>
                    </div>
                    {selectedLead.lastContact && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Последний контакт</p>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedLead.lastContact)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLeadDialog(false)}>
                Закрыть
              </Button>
              <Button>Сохранить изменения</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}