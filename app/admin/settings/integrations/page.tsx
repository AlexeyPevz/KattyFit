"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Info,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface Integration {
  id: string
  name: string
  icon: string
  color: string
  connected: boolean
  requiresOAuth: boolean
  requiresBusinessAccount?: boolean
  setupGuide?: string
  clientIdRequired?: boolean
  clientSecretRequired?: boolean
  apiKeyRequired?: boolean
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: "contentstudio",
    name: "ContentStudio",
    icon: "🚀",
    color: "#5C6BC0",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://app.contentstudio.io/docs/api",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "🎬",
    color: "#FF0000",
    connected: false,
    requiresOAuth: true,
    clientIdRequired: true,
    clientSecretRequired: true,
    setupGuide: "https://developers.google.com/youtube/v3/getting-started",
  },
  {
    id: "tiktok",
    name: "TikTok Business",
    icon: "🎵",
    color: "#000000",
    connected: false,
    requiresOAuth: true,
    requiresBusinessAccount: true,
    apiKeyRequired: true,
    setupGuide: "https://developers.tiktok.com/",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    icon: "🎙️",
    color: "#667EEA",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://elevenlabs.io/docs/api-reference/getting-started",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    color: "#10A37F",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://platform.openai.com/docs/quickstart",
  },
  {
    id: "vk",
    name: "VKontakte",
    icon: "📱",
    color: "#0077FF",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://dev.vk.com/api/getting-started",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: "✈️",
    color: "#0088CC",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://core.telegram.org/bots",
  },
  {
    id: "yandexgpt",
    name: "YandexGPT",
    icon: "🤖",
    color: "#FF6B35",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://yandex.cloud/ru/docs/foundation-model/concepts/quickstart",
  },
  {
    id: "cloudpayments",
    name: "CloudPayments",
    icon: "💳",
    color: "#00D4AA",
    connected: false,
    requiresOAuth: false,
    apiKeyRequired: true,
    setupGuide: "https://cloudpayments.ru/Docs/Api",
  },
  {
    id: "proxy",
    name: "Прокси",
    icon: "🌐",
    color: "#10B981",
    connected: true,
    requiresOAuth: false,
    apiKeyRequired: false,
    setupGuide: "/admin/settings/proxy",
  },
]

export default function IntegrationsPage() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [credentials, setCredentials] = useState<Record<string, any>>({})
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations")
      const data = await response.json()
      
      if (data.success) {
        // Обновляем статус подключения
        const updated = DEFAULT_INTEGRATIONS.map(integration => ({
          ...integration,
          connected: data.services.find((s: any) => s.service === integration.id)?.connected || false
        }))
        setIntegrations(updated)
      }
    } catch (error) {
      console.error("Ошибка загрузки интеграций:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleShowSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSaveCredentials = async (integrationId: string) => {
    setSaving(integrationId)
    try {
      const integration = integrations.find(i => i.id === integrationId)
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: integrationId,
          type: integration?.requiresOAuth ? "oauth" : "api",
          credentials: credentials[integrationId] || {},
        }),
      })

      if (response.ok) {
        await fetchIntegrations() // Обновляем статус
        // Очищаем сохраненные данные
        setCredentials(prev => ({ ...prev, [integrationId]: {} }))
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error)
    } finally {
      setSaving(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
              <h1 className="text-2xl font-bold">Интеграции</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Совет:</strong> Для настройки OAuth интеграций (YouTube, TikTok) рекомендуется провести совместную сессию с разработчиком. 
              За 60-90 минут можно настроить все необходимые доступы прямо на вашем компьютере.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : (
          <div className="grid gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.connected ? (
                            <Badge className="gap-1 bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3" />
                              Подключено
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Не подключено
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {integration.requiresOAuth && "OAuth авторизация"}
                          {integration.requiresBusinessAccount && " • Требуется бизнес-аккаунт"}
                          {!integration.requiresOAuth && "API ключ"}
                        </CardDescription>
                      </div>
                    </div>
                    {integration.setupGuide && (
                      <Button variant="outline" size="sm" asChild>
                        {integration.id === "proxy" ? (
                          <Link href={integration.setupGuide}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Управление
                          </Link>
                        ) : (
                          <a href={integration.setupGuide} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Инструкция
                          </a>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integration.id === "proxy" ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Система автоматически определяет заблокированные в РФ сервисы и направляет трафик через прокси.
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">ASOCKS.COM</Badge>
                          <Badge variant="outline">Beget VPS</Badge>
                          <Badge variant="outline">Custom</Badge>
                        </div>
                        <Button asChild className="w-full">
                          <Link href="/admin/settings/proxy">
                            Настроить прокси
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <>
                        {integration.clientIdRequired && (
                          <div className="space-y-2">
                            <Label htmlFor={`${integration.id}-client-id`}>Client ID</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`${integration.id}-client-id`}
                                placeholder="Введите Client ID"
                                value={credentials[integration.id]?.clientId || ""}
                                onChange={(e) => setCredentials(prev => ({
                                  ...prev,
                                  [integration.id]: {
                                    ...prev[integration.id],
                                    clientId: e.target.value
                                  }
                                }))}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(credentials[integration.id]?.clientId || "")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {integration.clientSecretRequired && (
                          <div className="space-y-2">
                            <Label htmlFor={`${integration.id}-client-secret`}>Client Secret</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`${integration.id}-client-secret`}
                                type={showSecrets[`${integration.id}-secret`] ? "text" : "password"}
                                placeholder="Введите Client Secret"
                                value={credentials[integration.id]?.clientSecret || ""}
                                onChange={(e) => setCredentials(prev => ({
                                  ...prev,
                                  [integration.id]: {
                                    ...prev[integration.id],
                                    clientSecret: e.target.value
                                  }
                                }))}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => toggleShowSecret(`${integration.id}-secret`)}
                              >
                                {showSecrets[`${integration.id}-secret`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {integration.apiKeyRequired && (
                          <div className="space-y-2">
                            <Label htmlFor={`${integration.id}-api-key`}>API Key</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`${integration.id}-api-key`}
                                type={showSecrets[`${integration.id}-key`] ? "text" : "password"}
                                placeholder="Введите API ключ"
                                value={credentials[integration.id]?.apiKey || ""}
                                onChange={(e) => setCredentials(prev => ({
                                  ...prev,
                                  [integration.id]: {
                                    ...prev[integration.id],
                                    apiKey: e.target.value
                                  }
                                }))}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => toggleShowSecret(`${integration.id}-key`)}
                              >
                                {showSecrets[`${integration.id}-key`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {integration.id === "cloudpayments" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="cloudpayments-public-id">Public ID</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="cloudpayments-public-id"
                                  type={showSecrets["cloudpayments-public"] ? "text" : "password"}
                                  placeholder="Введите Public ID"
                                  value={credentials.cloudpayments?.publicId || ""}
                                  onChange={(e) => setCredentials(prev => ({
                                    ...prev,
                                    cloudpayments: {
                                      ...prev.cloudpayments,
                                      publicId: e.target.value
                                    }
                                  }))}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleShowSecret("cloudpayments-public")}
                                >
                                  {showSecrets["cloudpayments-public"] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cloudpayments-secret">Secret Key</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="cloudpayments-secret"
                                  type={showSecrets["cloudpayments-secret"] ? "text" : "password"}
                                  placeholder="Введите Secret Key"
                                  value={credentials.cloudpayments?.secret || ""}
                                  onChange={(e) => setCredentials(prev => ({
                                    ...prev,
                                    cloudpayments: {
                                      ...prev.cloudpayments,
                                      secret: e.target.value
                                    }
                                  }))}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleShowSecret("cloudpayments-secret")}
                                >
                                  {showSecrets["cloudpayments-secret"] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </>
                        )}

                        {integration.requiresOAuth && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              Для получения OAuth учетных данных:
                              <ol className="mt-2 ml-4 list-decimal space-y-1 text-sm">
                                <li>Перейдите в консоль разработчика по ссылке выше</li>
                                <li>Создайте новый проект или выберите существующий</li>
                                <li>Включите необходимые API</li>
                                <li>Создайте OAuth 2.0 учетные данные</li>
                                <li>Добавьте разрешенные redirect URI</li>
                              </ol>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleSaveCredentials(integration.id)}
                            disabled={
                              saving === integration.id ||
                              (integration.clientIdRequired && !credentials[integration.id]?.clientId) ||
                              (integration.clientSecretRequired && !credentials[integration.id]?.clientSecret) ||
                              (integration.apiKeyRequired && !credentials[integration.id]?.apiKey) ||
                              (integration.id === "cloudpayments" && (!credentials.cloudpayments?.publicId || !credentials.cloudpayments?.secret))
                            }
                          >
                            {saving === integration.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Сохранение...
                              </>
                            ) : (
                              "Сохранить"
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Callback URLs</CardTitle>
              <CardDescription>
                Используйте эти URL при настройке OAuth приложений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="text-sm">https://yourdomain.com/api/auth/callback/youtube</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("https://yourdomain.com/api/auth/callback/youtube")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="text-sm">https://yourdomain.com/api/auth/callback/tiktok</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("https://yourdomain.com/api/auth/callback/tiktok")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
