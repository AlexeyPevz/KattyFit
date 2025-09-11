"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { 
  Languages, 
  Globe, 
  Download, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Pause
} from "lucide-react"
import logger from "@/lib/logger"

interface ContentTranslationManagerProps {
  contentId: string
  contentTitle: string
  onClose: () => void
}

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", status: "completed" },
  { code: "es", name: "Español", flag: "🇪🇸", status: "in_progress" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", status: "pending" },
  { code: "fr", name: "Français", flag: "🇫🇷", status: "pending" },
  { code: "it", name: "Italiano", flag: "🇮🇹", status: "pending" },
  { code: "pt", name: "Português", flag: "🇧🇷", status: "pending" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷", status: "pending" },
]

export function ContentTranslationManager({ contentId, contentTitle, onClose }: ContentTranslationManagerProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [translating, setTranslating] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [translationProgress, setTranslationProgress] = useState(0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const startTranslation = async (languageCode: string) => {
    setTranslating(true)
    setTranslationProgress(0)

    try {
      const response = await fetch("/api/content/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          targetLanguage: languageCode,
          autoTranslate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Симуляция прогресса
        const interval = setInterval(() => {
          setTranslationProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval)
              setTranslating(false)
              setTranslations(prev => ({
                ...prev,
                [languageCode]: data.translation
              }))
              return 100
            }
            return prev + 20
          })
        }, 500)
      }
    } catch (error) {
      logger.error("Ошибка перевода", { error: error instanceof Error ? error.message : String(error) })
      setTranslating(false)
    }
  }

  const downloadTranslation = (languageCode: string) => {
    const translation = translations[languageCode]
    if (!translation) return

    const data = {
      title: translation.title,
      description: translation.description,
      language: languageCode,
      contentId,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translation_${languageCode}_${contentId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Управление локализацией
          </DialogTitle>
          <DialogDescription>
            Создайте переводы контента "{contentTitle}" на разные языки
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Настройки */}
          <Card>
            <CardHeader>
              <CardTitle>Настройки перевода</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-translate">Автоматический перевод</Label>
                  <p className="text-sm text-muted-foreground">
                    Использовать AI для автоматического перевода контента
                  </p>
                </div>
                <Switch
                  id="auto-translate"
                  checked={autoTranslate}
                  onCheckedChange={setAutoTranslate}
                />
              </div>

              {translating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Перевод в процессе...</span>
                    <span>{translationProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${translationProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Список языков */}
          <Card>
            <CardHeader>
              <CardTitle>Доступные языки</CardTitle>
              <CardDescription>
                Выберите язык для создания перевода
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <div
                    key={language.code}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedLanguage === language.code
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground"
                    }`}
                    onClick={() => setSelectedLanguage(language.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {language.code.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(language.status)}
                        <Badge className={getStatusColor(language.status)}>
                          {language.status === "completed" ? "Готово" :
                           language.status === "in_progress" ? "В процессе" : "Ожидает"}
                        </Badge>
                      </div>
                    </div>

                    {selectedLanguage === language.code && (
                      <div className="mt-4 space-y-2">
                        {translations[language.code] ? (
                          <div className="space-y-2">
                            <div>
                              <Label>Переведенное название</Label>
                              <Input
                                value={translations[language.code].title || ""}
                                onChange={(e) => setTranslations(prev => ({
                                  ...prev,
                                  [language.code]: {
                                    ...prev[language.code],
                                    title: e.target.value
                                  }
                                }))}
                                placeholder="Введите название на выбранном языке"
                              />
                            </div>
                            <div>
                              <Label>Переведенное описание</Label>
                              <Textarea
                                value={translations[language.code].description || ""}
                                onChange={(e) => setTranslations(prev => ({
                                  ...prev,
                                  [language.code]: {
                                    ...prev[language.code],
                                    description: e.target.value
                                  }
                                }))}
                                placeholder="Введите описание на выбранном языке"
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => downloadTranslation(language.code)}
                                variant="outline"
                                size="sm"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Скачать
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-muted-foreground mb-4">
                              Перевод для этого языка еще не создан
                            </p>
                            <Button
                              onClick={() => startTranslation(language.code)}
                              disabled={translating}
                              size="sm"
                            >
                              {translating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Перевод...
                                </>
                              ) : (
                                <>
                                  <Globe className="mr-2 h-4 w-4" />
                                  Создать перевод
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика переводов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {SUPPORTED_LANGUAGES.filter(l => l.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Готово</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {SUPPORTED_LANGUAGES.filter(l => l.status === "in_progress").length}
                  </div>
                  <div className="text-sm text-muted-foreground">В процессе</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {SUPPORTED_LANGUAGES.filter(l => l.status === "pending").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ожидает</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Подсказки */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Совет:</strong> Автоматический перевод создает базовую версию, 
              которую можно затем отредактировать вручную для лучшего качества.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
