"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Share2, Heart, MessageCircle } from "lucide-react"
import logger from "@/lib/logger"

// VK Bridge types
interface VKBridgeEvent {
  type: string
  data?: unknown
}

interface VKBridgeParams {
  [key: string]: unknown
}

declare global {
  interface Window {
    vkBridge?: {
      send: (method: string, params?: VKBridgeParams) => Promise<unknown>
      subscribe: (callback: (e: VKBridgeEvent) => void) => void
      unsubscribe: (callback: (e: VKBridgeEvent) => void) => void
      isWebView: () => boolean
      isStandalone: () => boolean
      isEmbedded: () => boolean
    }
  }
}

interface VKUser {
  id: number
  first_name: string
  last_name: string
  photo_100?: string
  city?: {
    title: string
  }
}

export function VKMiniApp() {
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<VKUser | null>(null)
  const [isVK, setIsVK] = useState(false)

  useEffect(() => {
    // Check if running in VK
    if (typeof window !== "undefined" && window.vkBridge) {
      setIsVK(true)
      initVK()
    } else {
      // Load VK Bridge script
      const script = document.createElement("script")
      script.src = "https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"
      script.onload = () => {
        if (window.vkBridge) {
          setIsVK(true)
          initVK()
        }
      }
      document.head.appendChild(script)
    }
  }, [])

  const initVK = async () => {
    if (!window.vkBridge) return

    try {
      // Initialize VK Bridge
      await window.vkBridge.send("VKWebAppInit")

      // Get user info
      const userInfo = await window.vkBridge.send("VKWebAppGetUserInfo")
      setUser(userInfo)

      // Set status bar style
      await window.vkBridge.send("VKWebAppSetViewSettings", {
        status_bar_style: "light",
        action_bar_color: "#8b5cf6",
      })

      setIsReady(true)
    } catch (error) {
      logger.error("VK Bridge initialization error", { error: error instanceof Error ? error.message : String(error) })
      setIsReady(true)
    }
  }

  const handleShare = async () => {
    if (!window.vkBridge) return

    try {
      await window.vkBridge.send("VKWebAppShare", {
        link: "https://kattyfit.ru",
        title: "KattyFit - Растяжка и Аэройога",
        description: "Персональные тренировки с профессиональным тренером",
      })
    } catch (error) {
      logger.error("Share error", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleLike = async () => {
    if (!window.vkBridge) return

    try {
      await window.vkBridge.send("VKWebAppAddToFavorites")
    } catch (error) {
      logger.error("Add to favorites error", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleInviteFriends = async () => {
    if (!window.vkBridge) return

    try {
      await window.vkBridge.send("VKWebAppShowInviteBox")
    } catch (error) {
      logger.error("Invite friends error", { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handlePayment = async (amount: number, description: string) => {
    if (!window.vkBridge) return

    try {
      const result = await window.vkBridge.send("VKWebAppOpenPayForm", {
        app_id: 0, // Your VK app ID
        action: "pay-to-service",
        params: {
          amount: amount,
          description: description,
          data: JSON.stringify({
            course_id: "1",
            user_id: user?.id,
          }),
        },
      })

      if (result.status) {
        // Payment successful
        await window.vkBridge.send("VKWebAppTapticNotificationOccurred", {
          type: "success",
        })
      }
    } catch (error) {
      logger.error("Payment error", { error: error instanceof Error ? error.message : String(error) })
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
    <div className="min-h-screen bg-background p-4">
      {/* User Welcome */}
      {user && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {user.photo_100 ? (
                <img
                  src={user.photo_100 || "/placeholder.svg"}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
              <div>
                <h2 className="font-semibold">Привет, {user.first_name}!</h2>
                <p className="text-sm text-muted-foreground">
                  {user.city?.title && `${user.city.title} • `}Добро пожаловать в KattyFit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VK Specific Actions */}
      {isVK && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto bg-transparent"
          >
            <Share2 className="w-5 h-5 mb-1" />
            <span className="text-xs">Поделиться</span>
          </Button>

          <Button
            onClick={handleLike}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto bg-transparent"
          >
            <Heart className="w-5 h-5 mb-1" />
            <span className="text-xs">В избранное</span>
          </Button>

          <Button
            onClick={handleInviteFriends}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto bg-transparent"
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-xs">Пригласить</span>
          </Button>
        </div>
      )}

      {/* Courses with VK Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Популярные курсы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: "1", title: "Основы растяжки", price: 2990, description: "Курс основы растяжки для начинающих" },
            { id: "2", title: "Аэройога", price: 4990, description: "Курс аэройоги для всех уровней" },
          ].map((course) => (
            <div key={course.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{course.title}</h3>
                <Badge variant="secondary">{course.price.toLocaleString()} ₽</Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{course.description}</p>

              <Button
                onClick={() => handlePayment(course.price, course.description)}
                className="w-full yoga-gradient text-white"
                disabled={!isVK}
              >
                {isVK ? "Купить через VK Pay" : "Купить курс"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
