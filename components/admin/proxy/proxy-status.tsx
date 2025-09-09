"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Globe,
  Clock,
  Zap
} from "lucide-react"

interface ServiceStatus {
  name: string
  url: string
  available: boolean
  viaProxy: boolean
  responseTime?: number
  error?: string
}

interface StatusData {
  proxy: {
    total: number
    active: number
    healthy: number
    proxies: Array<{
      id: string
      name: string
      type: string
      isActive: boolean
      isHealthy: boolean
      responseTime?: number
      lastChecked?: string
    }>
  }
  services: ServiceStatus[]
  timestamp: string
}

export function ProxyStatus() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const loadStatus = async (checkServices = false) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/proxy/status?checkServices=${checkServices}`)
      const data = await response.json()
      if (data.success) {
        setStatus(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus(true) // Проверяем сервисы при первой загрузке
  }, [])

  const getServiceIcon = (service: ServiceStatus) => {
    if (service.available) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getServiceStatus = (service: ServiceStatus) => {
    if (service.available) {
      return "Доступен"
    }
    return "Недоступен"
  }

  const getProxyIcon = (proxy: any) => {
    if (!proxy.isActive) {
      return <XCircle className="h-4 w-4 text-gray-400" />
    }
    if (proxy.isHealthy === undefined) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    if (proxy.isHealthy) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getProxyStatus = (proxy: any) => {
    if (!proxy.isActive) return "Отключен"
    if (proxy.isHealthy === undefined) return "Не проверен"
    if (proxy.isHealthy) return "Работает"
    return "Ошибка"
  }

  if (!status) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Загрузка статуса...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{status.proxy.total}</p>
                <p className="text-sm text-muted-foreground">Всего прокси</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{status.proxy.active}</p>
                <p className="text-sm text-muted-foreground">Активных</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{status.proxy.healthy}</p>
                <p className="text-sm text-muted-foreground">Работающих</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {status.services?.filter(s => s.available).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Сервисов доступно</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Статус прокси */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Статус прокси</CardTitle>
              <CardDescription>
                Состояние всех настроенных прокси серверов
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => loadStatus(false)}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {status.proxy.proxies.length > 0 ? (
            <div className="space-y-3">
              {status.proxy.proxies.map((proxy) => (
                <div key={proxy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getProxyIcon(proxy)}
                    <div>
                      <p className="font-medium">{proxy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {proxy.type} • {getProxyStatus(proxy)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {proxy.responseTime && (
                      <p className="text-sm text-muted-foreground">
                        {proxy.responseTime}ms
                      </p>
                    )}
                    {proxy.lastChecked && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(proxy.lastChecked).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Прокси не настроены</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статус сервисов */}
      {status.services && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Доступность сервисов</CardTitle>
                <CardDescription>
                  Проверка доступности заблокированных в РФ сервисов
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => loadStatus(true)}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Проверить сервисы
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(service)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.viaProxy ? "Через прокси" : "Прямое соединение"}
                      </p>
                      {service.error && (
                        <p className="text-xs text-red-500">{service.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={service.available ? "default" : "destructive"}>
                      {getServiceStatus(service)}
                    </Badge>
                    {service.responseTime && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Информация о последнем обновлении */}
      {lastUpdate && (
        <div className="text-center text-sm text-muted-foreground">
          Последнее обновление: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  )
}