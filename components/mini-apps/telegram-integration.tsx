"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Share2, Star, ShoppingCart } from "lucide-react"

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
        }
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
          notificationOccurred: (type: "error" | "success" | "warning") => void
          selectionChanged: () => void
        }
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
          }
          start_param?: string
        }
        colorScheme: "light" | "dark"
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        sendData: (data: string) => void
        openLink: (url: string) => void
        openTelegramLink: (url: string) => void
        showPopup: (
          params: {
            title?: string
            message: string
            buttons?: Array<{
              id?: string
              type?: "default" | "ok" | "close" | "cancel" | "destructive"
              text: string
            }>
          },
          callback?: (buttonId: string) => void,
        ) => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
      }
    }
  }
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

export function TelegramMiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Check if running in Telegram
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp

      // Initialize Telegram WebApp
      tg.ready()
      tg.expand()

      // Get user data
      if (tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user)
      }

      // Set theme
      setTheme(tg.colorScheme)

      // Configure main button
      tg.MainButton.setText("Записаться на тренировку")
      tg.MainButton.onClick(() => {
        tg.HapticFeedback.impactOccurred("medium")
        handleBookingClick()
      })

      // Configure back button
      tg.BackButton.onClick(() => {
        tg.close()
      })

      setIsReady(true)

      // Apply Telegram theme
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty("--background", tg.themeParams.bg_color)
      }
      if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty("--foreground", tg.themeParams.text_color)
      }
    }
  }, [])

  const handleBookingClick = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.showConfirm("Записаться на персональную тренировку?", (confirmed) => {
        if (confirmed) {
          tg.HapticFeedback.notificationOccurred("success")
          // Navigate to booking page
          window.location.href = "/booking"
        }
      })
    }
  }

  const handleCourseClick = (courseId: string) => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.HapticFeedback.impactOccurred("light")
      // Navigate to course
      window.location.href = `/courses/${courseId}`
    }
  }

  const handleShare = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.openTelegramLink("https://t.me/share/url?url=https://kattyfit.ru&text=Попробуй%20тренировки%20с%20KattyFit!")
    }
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* User Welcome */}
      {user && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">
                  Привет, {user.first_name}!{user.is_premium && <Badge className="ml-2 bg-yellow-500">Premium</Badge>}
                </h2>
                <p className="text-sm text-muted-foreground">Добро пожаловать в KattyFit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleBookingClick}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-medium">Записаться</h3>
            <p className="text-xs text-muted-foreground">Персональная тренировка</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCourseClick("1")}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium">Курсы</h3>
            <p className="text-xs text-muted-foreground">Онлайн обучение</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Courses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Популярные курсы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: "1", title: "Основы растяжки", price: 2990, rating: 4.9 },
            { id: "2", title: "Аэройога для начинающих", price: 4990, rating: 4.8 },
            { id: "3", title: "Йога для гибкости", price: 2490, rating: 4.7 },
          ].map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
              onClick={() => handleCourseClick(course.id)}
            >
              <div>
                <h4 className="font-medium">{course.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">{course.price.toLocaleString()} ₽</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Share Button */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={handleShare} className="w-full bg-transparent" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться с друзьями
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
