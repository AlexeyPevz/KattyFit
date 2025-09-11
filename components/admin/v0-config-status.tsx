"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface ConfigStatus {
  isConfigured: boolean
  missingVars: string[]
  warnings: string[]
  recommendations: string[]
}

export function V0ConfigStatus() {
  const [status, setStatus] = useState<ConfigStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/config-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Ошибка проверки конфигурации:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConfig()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Проверка конфигурации v0...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            Ошибка проверки конфигурации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={checkConfig} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.isConfigured ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          Статус конфигурации v0
        </CardTitle>
        <CardDescription>
          Проверка переменных окружения и настроек проекта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основной статус */}
        <div className="flex items-center gap-2">
          <Badge variant={status.isConfigured ? "default" : "destructive"}>
            {status.isConfigured ? "Настроено" : "Требует настройки"}
          </Badge>
          <Button onClick={checkConfig} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Обновить
          </Button>
        </div>

        {/* Отсутствующие переменные */}
        {status.missingVars.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              Отсутствующие обязательные переменные:
            </h4>
            <div className="space-y-1">
              {status.missingVars.map((varName) => (
                <div key={varName} className="text-sm font-mono bg-red-50 p-2 rounded">
                  {varName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Предупреждения */}
        {status.warnings.length > 0 && (
          <div>
            <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Предупреждения:
            </h4>
            <ul className="space-y-1">
              {status.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Рекомендации */}
        {status.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-600 mb-2">
              💡 Рекомендации:
            </h4>
            <ul className="space-y-1">
              {status.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Инструкции для v0 */}
        {!status.isConfigured && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              🔧 Как настроить в v0:
            </h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Откройте ваш проект в v0.dev</li>
              <li>Перейдите в Settings → Environment Variables</li>
              <li>Добавьте отсутствующие переменные</li>
              <li>Сохраните изменения и перезапустите проект</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}