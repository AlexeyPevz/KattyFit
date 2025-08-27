"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { pushNotifications } from "@/lib/push-notifications"
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  MessageSquare, 
  Calendar, 
  BookOpen,
  AlertCircle,
  ArrowLeft,
  Send
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface NotificationSetting {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: React.ElementType
  category: "admin" | "client" | "system"
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Админские уведомления
    {
      id: "chat_escalation",
      name: "Эскалация чата",
      description: "Когда AI агент передает чат оператору",
      enabled: true,
      icon: MessageSquare,
      category: "admin"
    },
    {
      id: "new_booking",
      name: "Новые записи",
      description: "Уведомления о новых записях на тренировки",
      enabled: true,
      icon: Calendar,
      category: "admin"
    },
    {
      id: "course_purchase",
      name: "Покупка курса",
      description: "Когда клиент покупает курс",
      enabled: true,
      icon: BookOpen,
      category: "admin"
    },
    // Клиентские уведомления
    {
      id: "training_reminder",
      name: "Напоминания о тренировках",
      description: "За час до начала тренировки",
      enabled: true,
      icon: Calendar,
      category: "client"
    },
    {
      id: "new_course",
      name: "Новые курсы",
      description: "Когда появляется новый курс",
      enabled: false,
      icon: BookOpen,
      category: "client"
    },
    {
      id: "chat_reply",
      name: "Ответы в чате",
      description: "Когда администратор отвечает в чате",
      enabled: true,
      icon: MessageSquare,
      category: "client"
    },
    // Системные уведомления
    {
      id: "system_updates",
      name: "Обновления системы",
      description: "Важные системные уведомления",
      enabled: true,
      icon: AlertCircle,
      category: "system"
    }
  ])

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    try {
      const subscription = await pushNotifications.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("Ошибка проверки подписки:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const subscription = await pushNotifications.subscribe()
      if (subscription) {
        setIsSubscribed(true)
        toast({
          title: "Уведомления включены",
          description: "Вы будете получать push-уведомления"
        })
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось включить уведомления. Проверьте разрешения в браузере.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Ошибка подписки:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при включении уведомлений",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    setLoading(true)
    try {
      const success = await pushNotifications.unsubscribe()
      if (success) {
        setIsSubscribed(false)
        toast({
          title: "Уведомления отключены",
          description: "Вы больше не будете получать push-уведомления"
        })
      }
    } catch (error) {
      console.error("Ошибка отписки:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось отключить уведомления",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (settingId: string, enabled: boolean) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === settingId ? { ...setting, enabled } : setting
      )
    )
    
    // Здесь можно сохранить настройки на сервере
    toast({
      title: "Настройки сохранены",
      description: "Изменения вступят в силу немедленно"
    })
  }

  const testNotification = async () => {
    try {
      await pushNotifications.showLocalNotification(
        "Тестовое уведомление",
        {
          body: "Это тестовое уведомление от KattyFit",
          tag: "test",
          requireInteraction: false
        }
      )
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить тестовое уведомление",
        variant: "destructive"
      })
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Управление уведомлениями</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          {/* Статус подписки */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isSubscribed ? (
                  <>
                    <Bell className="h-5 w-5 text-green-500" />
                    Push-уведомления включены
                  </>
                ) : (
                  <>
                    <BellOff className="h-5 w-5 text-gray-500" />
                    Push-уведомления отключены
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isSubscribed 
                  ? "Вы будете получать уведомления на это устройство"
                  : "Включите уведомления, чтобы не пропускать важные события"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {isSubscribed ? (
                  <>
                    <Button 
                      onClick={handleUnsubscribe} 
                      variant="destructive"
                      disabled={loading}
                    >
                      <BellOff className="h-4 w-4 mr-2" />
                      Отключить уведомления
                    </Button>
                    <Button 
                      onClick={testNotification}
                      variant="outline"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Тестовое уведомление
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Включить уведомления
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Настройки уведомлений */}
          <Tabs defaultValue="admin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin">Для админа</TabsTrigger>
              <TabsTrigger value="client">Для клиентов</TabsTrigger>
              <TabsTrigger value="system">Системные</TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Административные уведомления</CardTitle>
                  <CardDescription>
                    Уведомления для администраторов и тренеров
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings
                    .filter(s => s.category === "admin")
                    .map(setting => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <setting.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor={setting.id} className="text-base font-medium">
                              {setting.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={setting.id}
                          checked={setting.enabled}
                          onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="client">
              <Card>
                <CardHeader>
                  <CardTitle>Клиентские уведомления</CardTitle>
                  <CardDescription>
                    Уведомления для клиентов приложения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings
                    .filter(s => s.category === "client")
                    .map(setting => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <setting.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor={setting.id} className="text-base font-medium">
                              {setting.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={setting.id}
                          checked={setting.enabled}
                          onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Системные уведомления</CardTitle>
                  <CardDescription>
                    Важные системные сообщения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings
                    .filter(s => s.category === "system")
                    .map(setting => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <setting.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label htmlFor={setting.id} className="text-base font-medium">
                              {setting.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={setting.id}
                          checked={setting.enabled}
                          onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}