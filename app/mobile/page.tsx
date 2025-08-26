"use client"

import { useState } from "react"
import { TelegramMiniApp } from "@/components/mini-apps/telegram-integration"
import { VKMiniApp } from "@/components/mini-apps/vk-integration"
import { SwipeLessonNavigator } from "@/components/mobile/swipe-navigation"
import { MobileVideoPlayer } from "@/components/mobile/touch-interface"
import { StudioLocator } from "@/components/mobile/geolocation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockLessons = [
  {
    id: "1",
    title: "Разминка и подготовка",
    duration: 600,
    completed: true,
    type: "video" as const,
    thumbnail: "/images/trainer-studio.jpg",
  },
  {
    id: "2",
    title: "Основные упражнения на растяжку",
    duration: 900,
    completed: false,
    type: "video" as const,
    thumbnail: "/images/trainer-outdoor.jpg",
  },
  {
    id: "3",
    title: "Техника дыхания",
    duration: 300,
    completed: false,
    type: "text" as const,
  },
]

export default function MobilePage() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  // Detect platform
  const isTelegram = typeof window !== "undefined" && window.Telegram?.WebApp
  const isVK = typeof window !== "undefined" && window.vkBridge

  if (isTelegram) {
    return <TelegramMiniApp />
  }

  if (isVK) {
    return <VKMiniApp />
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            KattyFit Mobile
          </span>
        </h1>

        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lessons">Уроки</TabsTrigger>
            <TabsTrigger value="video">Видео</TabsTrigger>
            <TabsTrigger value="studios">Студии</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Курс: Основы растяжки</CardTitle>
              </CardHeader>
              <CardContent>
                <SwipeLessonNavigator
                  lessons={mockLessons}
                  currentLessonIndex={currentLessonIndex}
                  onLessonChange={setCurrentLessonIndex}
                  onLessonStart={(lesson) => {
                    console.log("Starting lesson:", lesson.title)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Видеоплеер</CardTitle>
              </CardHeader>
              <CardContent>
                <MobileVideoPlayer
                  src="/placeholder.svg"
                  poster="/images/trainer-studio.jpg"
                  title="Урок растяжки для начинающих"
                  onNext={() => console.log("Next video")}
                  onPrevious={() => console.log("Previous video")}
                  hasNext={true}
                  hasPrevious={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="studios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ближайшие студии</CardTitle>
              </CardHeader>
              <CardContent>
                <StudioLocator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
