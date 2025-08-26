"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Play, Clock, CheckCircle } from "lucide-react"
import { TouchButton } from "./touch-interface"

interface Lesson {
  id: string
  title: string
  duration: number
  completed: boolean
  type: "video" | "text" | "quiz"
  thumbnail?: string
}

interface SwipeLessonNavigatorProps {
  lessons: Lesson[]
  currentLessonIndex: number
  onLessonChange: (index: number) => void
  onLessonStart: (lesson: Lesson) => void
}

export function SwipeLessonNavigator({
  lessons,
  currentLessonIndex,
  onLessonChange,
  onLessonStart,
}: SwipeLessonNavigatorProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const threshold = 100
    if (currentX > threshold && currentLessonIndex > 0) {
      onLessonChange(currentLessonIndex - 1)
    } else if (currentX < -threshold && currentLessonIndex < lessons.length - 1) {
      onLessonChange(currentLessonIndex + 1)
    }

    setCurrentX(0)
    setIsDragging(false)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />
      case "quiz":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-4 space-x-2">
        {lessons.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentLessonIndex
                ? "bg-primary w-6"
                : index < currentLessonIndex
                  ? "bg-green-500"
                  : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* Swipeable Lesson Cards */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentLessonIndex * 100}% + ${isDragging ? currentX : 0}px))`,
          }}
        >
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="w-full flex-shrink-0 px-2">
              <Card
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  index === currentLessonIndex ? "ring-2 ring-primary shadow-lg" : "",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Lesson Thumbnail/Icon */}
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      {lesson.thumbnail ? (
                        <img
                          src={lesson.thumbnail || "/placeholder.svg"}
                          alt={lesson.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getTypeIcon(lesson.type)
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Урок {index + 1}
                        </Badge>
                        {lesson.completed && <Badge className="bg-green-100 text-green-800 text-xs">Завершен</Badge>}
                      </div>

                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{lesson.title}</h3>

                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(lesson.duration)}
                      </div>

                      <TouchButton variant="primary" size="md" onClick={() => onLessonStart(lesson)} className="w-full">
                        {lesson.completed ? "Повторить урок" : "Начать урок"}
                      </TouchButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between mt-4">
        <TouchButton
          variant="ghost"
          size="md"
          onClick={() => currentLessonIndex > 0 && onLessonChange(currentLessonIndex - 1)}
          disabled={currentLessonIndex === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Предыдущий</span>
        </TouchButton>

        <span className="text-sm text-muted-foreground">
          {currentLessonIndex + 1} из {lessons.length}
        </span>

        <TouchButton
          variant="ghost"
          size="md"
          onClick={() => currentLessonIndex < lessons.length - 1 && onLessonChange(currentLessonIndex + 1)}
          disabled={currentLessonIndex === lessons.length - 1}
          className="flex items-center space-x-2"
        >
          <span>Следующий</span>
          <ChevronRight className="w-5 h-5" />
        </TouchButton>
      </div>
    </div>
  )
}
