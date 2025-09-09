"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Globe,
  Server,
  Zap,
  Settings
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProxyConfig } from "@/lib/proxy-manager"

interface ProxyStats {
  total: number
  active: number
  healthy: number
  proxies: ProxyConfig[]
}

const PROXY_TYPES = [
  { value: 'asocks', label: 'ASOCKS.COM', icon: '🌐', description: 'HTTP/SOCKS прокси' },
  { value: 'beget', label: 'Beget VPS', icon: '🖥️', description: 'Собственный VPS сервер' },
  { value: 'custom', label: 'Custom', icon: '⚙️', description: 'Другой прокси провайдер' }
]

const BLOCKED_SERVICES = [
  'youtube.com',
  'googleapis.com', 
  'instagram.com',
  'tiktok.com',
  'facebook.com',
  'twitter.com',
  'openai.com'
]

export function ProxyManager() {
  const [stats, setStats] = useState<ProxyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [healthChecking, setHealthChecking] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProxy, setEditingProxy] = useState<ProxyConfig | null>(null)
  const [newProxy, setNewProxy] = useState<Partial<ProxyConfig>>({
    type: 'asocks',
    isActive: true,
    priority: 1,
    allowedServices: ['youtube.com', 'googleapis.com']
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/proxy')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики прокси:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    setHealthChecking(true)
    try {
      const response = await fetch('/api/proxy/health', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Ошибка проверки здоровья прокси:', error)
    } finally {
      setHealthChecking(false)
    }
  }

  const addProxy = async () => {
    if (!newProxy.name || !newProxy.host || !newProxy.port) {
      alert('Заполните обязательные поля')
      return
    }

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProxy)
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewProxy({
          type: 'asocks',
          isActive: true,
          priority: 1,
          allowedServices: ['youtube.com', 'googleapis.com']
        })
        loadStats()
      }
    } catch (error) {
      console.error('Ошибка добавления прокси:', error)
    }
  }

  const updateProxy = async (id: string, updates: Partial<ProxyConfig>) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      if (response.ok) {
        loadStats()
      }
    } catch (error) {
      console.error('Ошибка обновления прокси:', error)
    }
  }

  const deleteProxy = async (id: string) => {
    if (!confirm('Удалить прокси?')) return

    try {
      const response = await fetch(`/api/proxy?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        loadStats()
      }
    } catch (error) {
      console.error('Ошибка удаления прокси:', error)
    }
  }

  const getStatusIcon = (proxy: ProxyConfig) => {
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

  const getStatusText = (proxy: ProxyConfig) => {
    if (!proxy.isActive) return 'Отключен'
    if (proxy.isHealthy === undefined) return 'Не проверен'
    if (proxy.isHealthy) return 'Работает'
    return 'Ошибка'
  }

  const getTypeIcon = (type: string) => {
    const typeInfo = PROXY_TYPES.find(t => t.value === type)
    return typeInfo?.icon || '⚙️'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Загрузка прокси...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.active || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.healthy || 0}</p>
                <p className="text-sm text-muted-foreground">Работающих</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{BLOCKED_SERVICES.length}</p>
                <p className="text-sm text-muted-foreground">Заблокированных сервисов</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Управление */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление прокси</CardTitle>
              <CardDescription>
                Настройте прокси для обхода блокировок зарубежных сервисов
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={checkHealth}
                disabled={healthChecking}
              >
                {healthChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Проверить здоровье
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить прокси
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Добавить новый прокси</DialogTitle>
                    <DialogDescription>
                      Настройте прокси для обхода блокировок
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Название</Label>
                        <Input
                          value={newProxy.name || ''}
                          onChange={(e) => setNewProxy({...newProxy, name: e.target.value})}
                          placeholder="ASOCKS Main"
                        />
                      </div>
                      <div>
                        <Label>Тип</Label>
                        <Select
                          value={newProxy.type || 'asocks'}
                          onValueChange={(value: any) => setNewProxy({...newProxy, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROXY_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <span>{type.icon}</span>
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Хост</Label>
                        <Input
                          value={newProxy.host || ''}
                          onChange={(e) => setNewProxy({...newProxy, host: e.target.value})}
                          placeholder="proxy.asocks.com"
                        />
                      </div>
                      <div>
                        <Label>Порт</Label>
                        <Input
                          type="number"
                          value={newProxy.port || ''}
                          onChange={(e) => setNewProxy({...newProxy, port: parseInt(e.target.value)})}
                          placeholder="1080"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Имя пользователя (опционально)</Label>
                        <Input
                          value={newProxy.username || ''}
                          onChange={(e) => setNewProxy({...newProxy, username: e.target.value})}
                          placeholder="username"
                        />
                      </div>
                      <div>
                        <Label>Пароль (опционально)</Label>
                        <Input
                          type="password"
                          value={newProxy.password || ''}
                          onChange={(e) => setNewProxy({...newProxy, password: e.target.value})}
                          placeholder="password"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Приоритет (1 = высший)</Label>
                        <Input
                          type="number"
                          value={newProxy.priority || 1}
                          onChange={(e) => setNewProxy({...newProxy, priority: parseInt(e.target.value)})}
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newProxy.isActive}
                          onCheckedChange={(checked) => setNewProxy({...newProxy, isActive: checked})}
                        />
                        <Label>Активен</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Разрешенные сервисы</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {BLOCKED_SERVICES.map(service => (
                          <label key={service} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newProxy.allowedServices?.includes(service) || false}
                              onChange={(e) => {
                                const services = newProxy.allowedServices || []
                                if (e.target.checked) {
                                  setNewProxy({...newProxy, allowedServices: [...services, service]})
                                } else {
                                  setNewProxy({...newProxy, allowedServices: services.filter(s => s !== service)})
                                }
                              }}
                            />
                            <span className="text-sm">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Отмена
                      </Button>
                      <Button onClick={addProxy}>
                        Добавить
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.proxies && stats.proxies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Прокси</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Сервисы</TableHead>
                  <TableHead>Время отклика</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.proxies.map((proxy) => (
                  <TableRow key={proxy.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(proxy.type)}</span>
                        <div>
                          <p className="font-medium">{proxy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {proxy.host}:{proxy.port}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proxy)}
                        <span className="text-sm">{getStatusText(proxy)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {proxy.allowedServices.slice(0, 2).map(service => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        {proxy.allowedServices.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{proxy.allowedServices.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {proxy.responseTime ? `${proxy.responseTime}ms` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProxy(proxy)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProxy(proxy.id, { isActive: !proxy.isActive })}
                        >
                          {proxy.isActive ? 'Отключить' : 'Включить'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProxy(proxy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Прокси не настроены</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый прокси
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Информация о заблокированных сервисах */}
      <Card>
        <CardHeader>
          <CardTitle>Заблокированные в РФ сервисы</CardTitle>
          <CardDescription>
            Эти сервисы будут автоматически проксироваться
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {BLOCKED_SERVICES.map(service => (
              <Badge key={service} variant="outline" className="justify-center">
                {service}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}