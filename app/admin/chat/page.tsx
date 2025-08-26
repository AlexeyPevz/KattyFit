"use client"

import { AdminGuard } from "@/components/auth/admin-guard"
import { OmnichannelDashboard } from "@/components/admin/chat/omnichannel-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Settings, Bot } from "lucide-react"
import Link from "next/link"

export default function OmnichannelChatPage() {
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
              <h1 className="text-2xl font-bold">Омниканальные чаты</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Tabs defaultValue="chats" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chats" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Чаты
              </TabsTrigger>
              <TabsTrigger value="bot" className="gap-2">
                <Bot className="h-4 w-4" />
                AI Настройки
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chats">
              <Card>
                <CardHeader>
                  <CardTitle>Все чаты</CardTitle>
                  <CardDescription>
                    Управляйте всеми диалогами из одного места
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <OmnichannelDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bot" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки AI-ассистента</CardTitle>
                  <CardDescription>
                    Настройте поведение автоматических ответов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">База знаний</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Загрузите документы и примеры диалогов для обучения бота
                      </p>
                      <Button variant="outline">Управление базой знаний</Button>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Стиль общения</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Настройте тон и манеру общения бота
                      </p>
                      <Button variant="outline">Настроить стиль</Button>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Автоматические ответы</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Настройте быстрые ответы на частые вопросы
                      </p>
                      <Button variant="outline">Настроить ответы</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Подключенные платформы</CardTitle>
                  <CardDescription>
                    Управление webhook и настройками платформ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">✈️</span>
                          <h3 className="font-medium">Telegram</h3>
                        </div>
                        <Badge className="bg-green-500">Подключено</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Webhook: https://yourdomain.com/api/chat/webhook/telegram
                      </p>
                      <Button size="sm" variant="outline">Настроить</Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📱</span>
                          <h3 className="font-medium">VKontakte</h3>
                        </div>
                        <Badge className="bg-green-500">Подключено</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Callback URL: https://yourdomain.com/api/chat/webhook/vk
                      </p>
                      <Button size="sm" variant="outline">Настроить</Button>
                    </div>

                    <div className="border rounded-lg p-4 opacity-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📷</span>
                          <h3 className="font-medium">Instagram</h3>
                        </div>
                        <Badge variant="secondary">Требует настройки</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Требуется ContentStudio или Meta Business
                      </p>
                      <Button size="sm" variant="outline" disabled>Подключить</Button>
                    </div>

                    <div className="border rounded-lg p-4 opacity-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">💬</span>
                          <h3 className="font-medium">WhatsApp</h3>
                        </div>
                        <Badge variant="secondary">Требует настройки</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Требуется WhatsApp Business API
                      </p>
                      <Button size="sm" variant="outline" disabled>Подключить</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}