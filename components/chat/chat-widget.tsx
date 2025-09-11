"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import logger from "@/lib/logger"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Привет! 👋 Я ассистент KattyFit. Помогу выбрать программу тренировок или записаться на занятие. Что вас интересует?",
      sender: "bot",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const quickReplies = [
    "💰 Узнать цены",
    "📅 Записаться на занятие", 
    "🎯 Выбрать программу",
    "❓ Есть вопрос"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Отправляем сообщение через веб-чат API
      const response = await fetch('/api/chat/webhook/web', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            from: {
              id: localStorage.getItem('web_chat_user_id') || `web_${Date.now()}`,
              first_name: 'Пользователь сайта'
            },
            text: inputValue,
            chat: {
              id: localStorage.getItem('web_chat_id') || `chat_${Date.now()}`
            },
            message_id: Date.now().toString()
          }
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка отправки сообщения')
      }

      // Сохраняем ID пользователя и чата
      if (!localStorage.getItem('web_chat_user_id')) {
        localStorage.setItem('web_chat_user_id', `web_${Date.now()}`)
      }
      if (!localStorage.getItem('web_chat_id')) {
        localStorage.setItem('web_chat_id', `chat_${Date.now()}`)
      }

      // Ждем ответ от бота (имитация, так как webhook работает асинхронно)
      setTimeout(async () => {
        // В реальной реализации здесь нужно подписаться на получение сообщений
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Спасибо за ваше сообщение! Я обработаю ваш запрос и отвечу в ближайшее время.",
          sender: "bot",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      logger.error('Ошибка отправки сообщения', { error: error instanceof Error ? error.message : String(error) })
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Извините, произошла ошибка. Пожалуйста, попробуйте позже.",
        sender: "bot",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Кнопка чата */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
          "sm:bottom-6 sm:right-6",
          "lg:bottom-8 lg:right-8",
          isOpen && "hidden"
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Окно чата */}
      <Card
        className={cn(
          "fixed z-50 shadow-2xl transition-all duration-300",
          "w-[calc(100vw-2rem)] max-w-sm",
          "bottom-4 right-4",
          "sm:bottom-6 sm:right-6",
          "lg:bottom-8 lg:right-8",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Заголовок чата */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Помощник KattyFit</h3>
              <p className="text-xs opacity-90">Онлайн</p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Сообщения */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Поле ввода */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}
