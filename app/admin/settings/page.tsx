"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Database, 
  Mail, 
  Bell, 
  Shield, 
  Globe,
  CreditCard,
  Bot,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useDemoData } from "@/hooks/use-demo-data"
import { DemoDataBanner, DemoDataIndicator } from "@/components/admin/demo-data-banner"
import logger from "@/lib/logger"

interface Settings {
  general: {
    siteName: string
    siteDescription: string
    siteUrl: string
    adminEmail: string
    timezone: string
    language: string
  }
  payments: {
    cloudpaymentsPublicId: string
    cloudpaymentsSecret: string
    currency: string
    testMode: boolean
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    emailFrom: string
    smsProvider: string
  }
  ai: {
    yandexGptApiKey: string
    openaiApiKey: string
    aiEnabled: boolean
    aiModel: string
  }
  integrations: {
    supabaseUrl: string
    supabaseAnonKey: string
    telegramBotToken: string
    vkApiToken: string
  }
}

const defaultSettings: Settings = {
  general: {
    siteName: "KattyFit",
    siteDescription: "Фитнес-студия для здорового образа жизни",
    siteUrl: "https://kattyfit.ru",
    adminEmail: "admin@kattyfit.ru",
    timezone: "Europe/Moscow",
    language: "ru"
  },
  payments: {
    cloudpaymentsPublicId: "",
    cloudpaymentsSecret: "",
    currency: "RUB",
    testMode: true
  },
  notifications: {
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: false,
    emailFrom: "noreply@kattyfit.ru",
    smsProvider: "sms.ru"
  },
  ai: {
    yandexGptApiKey: "",
    openaiApiKey: "",
    aiEnabled: false,
    aiModel: "yandexgpt"
  },
  integrations: {
    supabaseUrl: "",
    supabaseAnonKey: "",
    telegramBotToken: "",
    vkApiToken: ""
  }
}

export default function SettingsPage() {
  const { shouldShowDemo } = useDemoData()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      logger.error('Ошибка загрузки настроек', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        // Показать уведомление об успехе
        logger.info('Настройки сохранены')
      }
    } catch (error) {
      logger.error('Ошибка сохранения настроек', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const getStatusIcon = (isConfigured: boolean) => {
    return isConfigured ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-orange-500" />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка настроек...</p>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold">Настройки системы</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="general" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Общие</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Платежи</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Уведомления</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Интеграции</span>
              </TabsTrigger>
            </TabsList>

            {/* Общие настройки */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Общие настройки</CardTitle>
                  <CardDescription>Основные параметры сайта и системы</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteName">Название сайта</Label>
                      <Input
                        id="siteName"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteUrl">URL сайта</Label>
                      <Input
                        id="siteUrl"
                        value={settings.general.siteUrl}
                        onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="siteDescription">Описание сайта</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adminEmail">Email администратора</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={settings.general.adminEmail}
                        onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Часовой пояс</Label>
                      <Input
                        id="timezone"
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Настройки платежей */}
            <TabsContent value="payments" className="space-y-6">
              <DemoDataBanner type="bookings">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Настройки платежей</CardTitle>
                        <CardDescription>Конфигурация CloudPayments и других платежных систем</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(!!settings.payments.cloudpaymentsPublicId && !!settings.payments.cloudpaymentsSecret)}
                        <Badge variant={settings.payments.testMode ? "secondary" : "default"}>
                          {settings.payments.testMode ? "Тестовый режим" : "Продакшн"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cloudpaymentsPublicId">CloudPayments Public ID</Label>
                        <Input
                          id="cloudpaymentsPublicId"
                          type="password"
                          value={settings.payments.cloudpaymentsPublicId}
                          onChange={(e) => updateSetting('payments', 'cloudpaymentsPublicId', e.target.value)}
                          placeholder="pk_..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="cloudpaymentsSecret">CloudPayments Secret</Label>
                        <Input
                          id="cloudpaymentsSecret"
                          type="password"
                          value={settings.payments.cloudpaymentsSecret}
                          onChange={(e) => updateSetting('payments', 'cloudpaymentsSecret', e.target.value)}
                          placeholder="sk_..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Валюта</Label>
                        <Input
                          id="currency"
                          value={settings.payments.currency}
                          onChange={(e) => updateSetting('payments', 'currency', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="testMode"
                          checked={settings.payments.testMode}
                          onCheckedChange={(checked) => updateSetting('payments', 'testMode', checked)}
                        />
                        <Label htmlFor="testMode">Тестовый режим</Label>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Для работы с CloudPayments необходимо получить API ключи в личном кабинете.
                        <br />
                        <a href="https://cloudpayments.ru" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Перейти в CloudPayments →
                        </a>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </DemoDataBanner>
            </TabsContent>

            {/* Настройки уведомлений */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>Настройка каналов уведомлений</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Email уведомления</Label>
                        <p className="text-sm text-muted-foreground">Отправка уведомлений по электронной почте</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailEnabled}
                        onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">SMS уведомления</Label>
                        <p className="text-sm text-muted-foreground">Отправка SMS сообщений</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsEnabled}
                        onCheckedChange={(checked) => updateSetting('notifications', 'smsEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Push уведомления</Label>
                        <p className="text-sm text-muted-foreground">Уведомления в браузере</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushEnabled}
                        onCheckedChange={(checked) => updateSetting('notifications', 'pushEnabled', checked)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailFrom">Email отправителя</Label>
                      <Input
                        id="emailFrom"
                        type="email"
                        value={settings.notifications.emailFrom}
                        onChange={(e) => updateSetting('notifications', 'emailFrom', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smsProvider">SMS провайдер</Label>
                      <Input
                        id="smsProvider"
                        value={settings.notifications.smsProvider}
                        onChange={(e) => updateSetting('notifications', 'smsProvider', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI настройки */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI настройки</CardTitle>
                      <CardDescription>Конфигурация искусственного интеллекта</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!!settings.ai.yandexGptApiKey || !!settings.ai.openaiApiKey)}
                      <Badge variant={settings.ai.aiEnabled ? "default" : "secondary"}>
                        {settings.ai.aiEnabled ? "Включен" : "Выключен"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Включить AI</Label>
                      <p className="text-sm text-muted-foreground">Активировать AI-ассистента</p>
                    </div>
                    <Switch
                      checked={settings.ai.aiEnabled}
                      onCheckedChange={(checked) => updateSetting('ai', 'aiEnabled', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yandexGptApiKey">YandexGPT API ключ</Label>
                      <Input
                        id="yandexGptApiKey"
                        type="password"
                        value={settings.ai.yandexGptApiKey}
                        onChange={(e) => updateSetting('ai', 'yandexGptApiKey', e.target.value)}
                        placeholder="AQVN..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="openaiApiKey">OpenAI API ключ</Label>
                      <Input
                        id="openaiApiKey"
                        type="password"
                        value={settings.ai.openaiApiKey}
                        onChange={(e) => updateSetting('ai', 'openaiApiKey', e.target.value)}
                        placeholder="sk-..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aiModel">AI модель</Label>
                    <Input
                      id="aiModel"
                      value={settings.ai.aiModel}
                      onChange={(e) => updateSetting('ai', 'aiModel', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Интеграции */}
            <TabsContent value="integrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Интеграции</CardTitle>
                  <CardDescription>Внешние сервисы и API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supabaseUrl">Supabase URL</Label>
                      <Input
                        id="supabaseUrl"
                        value={settings.integrations.supabaseUrl}
                        onChange={(e) => updateSetting('integrations', 'supabaseUrl', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                      <Input
                        id="supabaseAnonKey"
                        type="password"
                        value={settings.integrations.supabaseAnonKey}
                        onChange={(e) => updateSetting('integrations', 'supabaseAnonKey', e.target.value)}
                        placeholder="eyJ..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
                      <Input
                        id="telegramBotToken"
                        type="password"
                        value={settings.integrations.telegramBotToken}
                        onChange={(e) => updateSetting('integrations', 'telegramBotToken', e.target.value)}
                        placeholder="123456789:ABC..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="vkApiToken">VK API Token</Label>
                      <Input
                        id="vkApiToken"
                        type="password"
                        value={settings.integrations.vkApiToken}
                        onChange={(e) => updateSetting('integrations', 'vkApiToken', e.target.value)}
                        placeholder="vk1.a..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={saveSettings} disabled={saving} className="min-w-[120px]">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
