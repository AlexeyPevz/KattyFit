"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Settings,
  RefreshCw,
  Copy,
  ExternalLink
} from "lucide-react"

interface EnvStatus {
  supabase: boolean
  auth: boolean
  push: boolean
  ai: boolean
  payments: boolean
  messengers: {
    telegram: boolean
    vk: boolean
    whatsapp: boolean
  }
}

export function EnvStatusCard() {
  const [status, setStatus] = useState<EnvStatus | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    checkEnvStatus()
  }, [])

  const checkEnvStatus = () => {
    // В production эти проверки выполняются на сервере
    // Здесь мы проверяем только публичные переменные
    const envStatus: EnvStatus = {
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      auth: true, // Проверяется на сервере
      push: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      ai: false, // Проверяется на сервере
      payments: false, // Проверяется на сервере
      messengers: {
        telegram: false, // Проверяется на сервере
        vk: false, // Проверяется на сервере
        whatsapp: false // Проверяется на сервере
      }
    }
    
    setStatus(envStatus)
  }

  if (!status) return null

  const isFullyConfigured = status.supabase && status.auth
  const hasWarnings = !status.push || !status.ai || !status.payments

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Статус конфигурации</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Скрыть" : "Подробнее"}
          </Button>
        </div>
        <CardDescription>
          Проверка настроек окружения приложения
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isFullyConfigured ? (
          <Alert className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Основные компоненты настроены</AlertTitle>
            <AlertDescription>
              Приложение готово к работе. {hasWarnings && "Некоторые функции могут быть ограничены."}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Требуется настройка</AlertTitle>
            <AlertDescription>
              Некоторые обязательные переменные окружения не настроены.
            </AlertDescription>
          </Alert>
        )}

        {showDetails && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg border">
              <span className="text-sm font-medium">База данных (Supabase)</span>
              {status.supabase ? (
                <Badge className="bg-green-500">Настроено</Badge>
              ) : (
                <Badge variant="destructive">Не настроено</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg border">
              <span className="text-sm font-medium">Push-уведомления</span>
              {status.push ? (
                <Badge className="bg-green-500">Настроено</Badge>
              ) : (
                <Badge variant="secondary">Не настроено</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg border">
              <span className="text-sm font-medium">AI сервис</span>
              {status.ai ? (
                <Badge className="bg-green-500">Настроено</Badge>
              ) : (
                <Badge variant="secondary">Не настроено</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg border">
              <span className="text-sm font-medium">Платежная система</span>
              {status.payments ? (
                <Badge className="bg-green-500">Настроено</Badge>
              ) : (
                <Badge variant="secondary">Не настроено</Badge>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Интеграции</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 border rounded">
                  <span className="text-2xl">✈️</span>
                  <p className="text-xs mt-1">Telegram</p>
                  {status.messengers.telegram ? (
                    <Badge className="mt-1 text-xs bg-green-500">OK</Badge>
                  ) : (
                    <Badge className="mt-1 text-xs" variant="secondary">-</Badge>
                  )}
                </div>
                <div className="text-center p-2 border rounded">
                  <span className="text-2xl">📱</span>
                  <p className="text-xs mt-1">VK</p>
                  {status.messengers.vk ? (
                    <Badge className="mt-1 text-xs bg-green-500">OK</Badge>
                  ) : (
                    <Badge className="mt-1 text-xs" variant="secondary">-</Badge>
                  )}
                </div>
                <div className="text-center p-2 border rounded">
                  <span className="text-2xl">💬</span>
                  <p className="text-xs mt-1">WhatsApp</p>
                  {status.messengers.whatsapp ? (
                    <Badge className="mt-1 text-xs bg-green-500">OK</Badge>
                  ) : (
                    <Badge className="mt-1 text-xs" variant="secondary">-</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/V0_ENV_SETUP.md', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Инструкция
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText('npm run check-env')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Команда проверки
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}