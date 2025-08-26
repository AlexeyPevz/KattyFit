"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Globe, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Loader2,
  Lock,
  Briefcase,
  ExternalLink
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Platform {
  id: string
  name: string
  icon?: string
  color: string
  available: boolean
  requiresOAuth?: boolean
  requiresBusinessAccount?: boolean
  authUrl?: string
}

const PLATFORMS: Platform[] = [
  {
    id: "vk",
    name: "VKontakte",
    color: "#0077FF",
    available: true,
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#0088CC",
    available: true,
  },
  {
    id: "rutube",
    name: "RuTube",
    color: "#00A651",
    available: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    available: false,
    requiresOAuth: true,
    authUrl: "/admin/settings/integrations/youtube",
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "#E4405F",
    available: true,
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#000000",
    available: false,
    requiresBusinessAccount: true,
  },
]

const LANGUAGES = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
]

export function ContentPublisher() {
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["ru"])
  const [publishing, setPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<any[]>([])

  // Загрузка статуса публикаций
  useEffect(() => {
    if (selectedContent) {
      fetchPublishStatus(selectedContent)
    }
  }, [selectedContent])

  const fetchPublishStatus = async (contentId: string) => {
    try {
      const response = await fetch(`/api/content/publish?contentId=${contentId}`)
      const data = await response.json()
      if (data.success) {
        setPublishStatus(data.publications)
      }
    } catch (error) {
      console.error("Ошибка загрузки статуса публикаций:", error)
    }
  }

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    )
  }

  const handlePublish = async () => {
    if (!selectedContent || selectedPlatforms.length === 0) {
      return
    }

    setPublishing(true)
    try {
      // Проверяем, есть ли международные платформы
      const internationalPlatforms = selectedPlatforms.filter(p => 
        ["instagram", "tiktok", "youtube"].includes(p)
      )
      const localPlatforms = selectedPlatforms.filter(p => 
        ["vk", "telegram", "rutube"].includes(p)
      )

      // Если есть международные платформы, используем ContentStudio
      if (internationalPlatforms.length > 0) {
        const contentStudioResponse = await fetch("/api/content/contentstudio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "publish",
            contentId: selectedContent,
            platforms: internationalPlatforms,
            languages: selectedLanguages,
          }),
        })

        const csData = await contentStudioResponse.json()
        if (!csData.success) {
          console.error("ContentStudio error:", csData.error)
        }
      }

      // Локальные платформы обрабатываем напрямую
      if (localPlatforms.length > 0) {
        const response = await fetch("/api/content/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentId: selectedContent,
            platforms: localPlatforms,
            languages: selectedLanguages,
          }),
        })

        const data = await response.json()
        if (!data.success) {
          console.error("Local publish error:", data.error)
        }
      }

      // Обновляем статус
      await fetchPublishStatus(selectedContent)
      // Очищаем выбор
      setSelectedPlatforms([])
    } catch (error) {
      console.error("Ошибка публикации:", error)
    } finally {
      setPublishing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Опубликовано"
      case "processing":
        return "Обработка"
      case "pending":
        return "Запланировано"
      default:
        return "Ожидание"
    }
  }

  return (
    <div className="space-y-6">
      {/* Выбор контента */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите контент для публикации</CardTitle>
          <CardDescription>
            Выберите видео из библиотеки для публикации на платформах
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Для демонстрации выбран первый контент из списка. 
              В полной версии здесь будет список контента для выбора.
            </AlertDescription>
          </Alert>
          <Button 
            className="mt-4" 
            onClick={() => setSelectedContent("1")}
            variant={selectedContent ? "default" : "outline"}
          >
            {selectedContent ? "Контент выбран" : "Выбрать контент"}
          </Button>
        </CardContent>
      </Card>

      {selectedContent && (
        <>
          {/* Выбор платформ */}
          <Card>
            <CardHeader>
              <CardTitle>Платформы для публикации</CardTitle>
              <CardDescription>
                Выберите платформы, на которых хотите опубликовать контент
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    className={`relative border rounded-lg p-4 ${
                      platform.available ? "cursor-pointer" : "opacity-50"
                    }`}
                    onClick={() => platform.available && togglePlatform(platform.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        disabled={!platform.available}
                      />
                      <Label className="flex-1 cursor-pointer">
                        <span style={{ color: platform.color }}>{platform.name}</span>
                      </Label>
                    </div>

                    {!platform.available && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {platform.requiresOAuth && (
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            OAuth требуется
                          </div>
                        )}
                        {platform.requiresBusinessAccount && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            Бизнес-аккаунт
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Выбор языков */}
          <Card>
            <CardHeader>
              <CardTitle>Языки локализации</CardTitle>
              <CardDescription>
                Выберите языковые версии для публикации
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                    onClick={() => toggleLanguage(lang.code)}
                    className="justify-start"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Статус публикаций */}
          {publishStatus.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Статус публикаций</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Платформа</TableHead>
                      <TableHead>Язык</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publishStatus.map((pub) => {
                      const platform = PLATFORMS.find(p => p.id === pub.platform)
                      const language = LANGUAGES.find(l => l.code === pub.language)
                      
                      return (
                        <TableRow key={pub.id}>
                          <TableCell>
                            <span style={{ color: platform?.color }}>
                              {platform?.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            {language?.flag} {language?.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(pub.status)}
                              {getStatusLabel(pub.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(pub.published_at || pub.scheduled_at).toLocaleString("ru")}
                          </TableCell>
                          <TableCell>
                            {pub.url && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Кнопка публикации */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handlePublish}
              disabled={publishing || selectedPlatforms.length === 0}
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикация...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Опубликовать
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}