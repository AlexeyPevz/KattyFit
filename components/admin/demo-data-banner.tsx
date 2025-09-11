"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Eye, EyeOff, RefreshCw } from "lucide-react"
import { useDemoData } from "@/hooks/use-demo-data"

interface DemoDataBannerProps {
  type: 'lessons' | 'users' | 'courses' | 'bookings'
  children: React.ReactNode
  className?: string
}

export function DemoDataBanner({ type, children, className = "" }: DemoDataBannerProps) {
  const { shouldShowDemo, isLoading, refresh } = useDemoData()
  const [isHidden, setIsHidden] = useState(false)

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Проверка данных...</span>
      </div>
    )
  }

  if (!shouldShowDemo(type) || isHidden) {
    return <>{children}</>
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className="border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Демо данные
            </Badge>
            <AlertDescription className="text-amber-800">
              Отображаются демонстрационные данные. Они исчезнут автоматически при добавлении реальных {type === 'lessons' ? 'уроков' : type === 'users' ? 'пользователей' : type === 'courses' ? 'курсов' : 'записей'}.
            </AlertDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHidden(true)}
              className="text-amber-700 hover:text-amber-800"
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Скрыть
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="text-amber-700 hover:text-amber-800"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Alert>
      {children}
    </div>
  )
}

export function DemoDataIndicator({ type }: { type: 'lessons' | 'users' | 'courses' | 'bookings' }) {
  const { shouldShowDemo, isLoading } = useDemoData()

  if (isLoading || !shouldShowDemo(type)) {
    return null
  }

  return (
    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
      Демо
    </Badge>
  )
}