"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Send, 
  MessageSquare, 
  Users, 
  Bot,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import logger from "@/lib/logger"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Chat {
  id: string
  userId: string
  userName: string
  platform: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: "active" | "pending" | "resolved"
  tags?: string[]
}

interface Message {
  id: string
  text: string
  type: "incoming" | "outgoing"
  timestamp: string
  platform: string
  status?: "sent" | "delivered" | "read"
}

const platformConfig = {
  telegram: { name: "Telegram", color: "#0088CC", icon: "✈️" },
  vk: { name: "VKontakte", color: "#0077FF", icon: "📱" },
  instagram: { name: "Instagram", color: "#E4405F", icon: "📷" },
  whatsapp: { name: "WhatsApp", color: "#25D366", icon: "💬" },
}

const mockChats: Chat[] = [
  {
    id: "1",
    userId: "123456",
    userName: "Анна Петрова",
    platform: "telegram",
    lastMessage: "Здравствуйте! Хочу записаться на пробное занятие",
    lastMessageTime: "10:30",
    unreadCount: 2,
    status: "pending",
    tags: ["новый", "пробное"],
  },
  {
    id: "2",
    userId: "789012",
    userName: "Мария Иванова",
    platform: "vk",
    lastMessage: "Спасибо за занятие! Было отлично 🙏",
    lastMessageTime: "Вчера",
    unreadCount: 0,
    status: "active",
    tags: ["постоянный"],
  },
  {
    id: "3",
    userId: "345678",
    userName: "Елена Сидорова",
    platform: "instagram",
    lastMessage: "Какая стоимость абонемента на месяц?",
    lastMessageTime: "2 часа назад",
    unreadCount: 1,
    status: "pending",
    tags: ["вопрос"],
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    text: "Здравствуйте! Хочу записаться на пробное занятие",
    type: "incoming",
    timestamp: "10:30",
    platform: "telegram",
  },
  {
    id: "2",
    text: "Добрый день! Рада вас видеть! Пробное занятие стоит 500₽. Когда вам было бы удобно?",
    type: "outgoing",
    timestamp: "10:32",
    platform: "telegram",
    status: "delivered",
  },
  {
    id: "3",
    text: "Можно на выходных? В субботу утром например",
    type: "incoming",
    timestamp: "10:35",
    platform: "telegram",
  },
]

export function OmnichannelDashboard() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlatform, setFilterPlatform] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlatform = filterPlatform === "all" || chat.platform === filterPlatform
    const matchesStatus = filterStatus === "all" || chat.status === filterStatus
    return matchesSearch && matchesPlatform && matchesStatus
  })

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      type: "outgoing",
      timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      platform: selectedChat.platform,
      status: "sent",
    }

    setMessages([...messages, newMessage])
    const currentMessage = messageInput
    setMessageInput("")

    // Обновляем последнее сообщение в чате
    setChats(chats.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: currentMessage, lastMessageTime: "Сейчас", unreadCount: 0 }
        : chat
    ))

    // Отправляем запрос к YandexGPT для получения AI ответа
    try {
      const response = await fetch('/api/chat/yandexgpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationId: selectedChat.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Добавляем AI ответ
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          type: "incoming",
          timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          platform: "ai",
        }

        setMessages(prev => [...prev, aiMessage])
        
        // Обновляем последнее сообщение в чате с AI ответом
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, lastMessage: `AI: ${data.response.substring(0, 50)}...`, lastMessageTime: "Сейчас" }
            : chat
        ))
      }
    } catch (error) {
      logger.error('Ошибка при получении AI ответа', { error: error instanceof Error ? error.message : String(error) })
      
      // Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Извините, AI-ассистент временно недоступен. Попробуйте позже.",
        type: "incoming",
        timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        platform: "system",
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "resolved":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const stats = [
    { label: "Активные чаты", value: chats.filter(c => c.status === "active").length, icon: MessageSquare },
    { label: "Ожидают ответа", value: chats.filter(c => c.status === "pending").length, icon: Clock },
    { label: "Всего клиентов", value: new Set(chats.map(c => c.userId)).size, icon: Users },
    { label: "Ответов сегодня", value: 47, icon: Bot },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-200px)]">
      {/* Список чатов */}
      <div className="w-full lg:w-96 lg:border-r flex flex-col max-h-96 lg:max-h-full">
        {/* Статистика */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            {stats.map((stat, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-muted-foreground/20" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Фильтры */}
        <div className="p-4 space-y-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по чатам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex-1 px-3 py-2 text-sm border rounded-md"
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
            >
              <option value="all">Все платформы</option>
              {Object.entries(platformConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
            <select
              className="flex-1 px-3 py-2 text-sm border rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="pending">Ожидают</option>
              <option value="resolved">Завершены</option>
            </select>
          </div>
        </div>

        {/* Список чатов */}
        <ScrollArea className="flex-1">
          {filteredChats.map((chat) => {
            const platform = platformConfig[chat.platform as keyof typeof platformConfig]
            return (
              <div
                key={chat.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                  selectedChat?.id === chat.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {chat.userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold truncate">{chat.userName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: platform.color, color: platform.color }}
                      >
                        {platform.icon} {platform.name}
                      </Badge>
                      {getStatusIcon(chat.status)}
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </ScrollArea>
      </div>

      {/* Область чата */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Заголовок чата */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {selectedChat.userName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedChat.userName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: platformConfig[selectedChat.platform as keyof typeof platformConfig].color,
                      color: platformConfig[selectedChat.platform as keyof typeof platformConfig].color 
                    }}
                  >
                    {platformConfig[selectedChat.platform as keyof typeof platformConfig].icon}
                    {platformConfig[selectedChat.platform as keyof typeof platformConfig].name}
                  </Badge>
                  <span>ID: {selectedChat.userId}</span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Позвонить
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Отправить email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Записать на занятие
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Завершить диалог
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Сообщения */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "outgoing" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.type === "outgoing"
                        ? "bg-primary text-primary-foreground"
                        : message.platform === "ai"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-muted"
                    }`}
                  >
                    {message.platform === "ai" && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">AI-ассистент</span>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp}
                      </span>
                      {message.status && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Ввод сообщения */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Введите сообщение..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              AI-ассистент поможет с ответом • Нажмите Tab для подсказки
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Выберите чат для начала общения</p>
          </div>
        </div>
      )}
    </div>
  )
}
