"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Languages, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Download,
  RefreshCw,
  Volume2
} from "lucide-react"

interface ContentTranslationManagerProps {
  contentId: string
  contentTitle: string
  onClose: () => void
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
]

export function ContentTranslationManager({ contentId, contentTitle, onClose }: ContentTranslationManagerProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [dubbing, setDubbing] = useState(false)
  const [dubbingId, setDubbingId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("idle")
  const [progress, setProgress] = useState(0)
  const [dubbedUrls, setDubbedUrls] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dubbingId) {
      const interval = setInterval(() => {
        checkDubbingStatus()
      }, 5000) // Проверяем каждые 5 секунд

      return () => clearInterval(interval)
    }
  }, [dubbingId])

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    )
  }

  const startDubbing = async () => {
    if (selectedLanguages.length === 0) return

    setDubbing(true)
    setError(null)
    setStatus("starting")

    try {
      const response = await fetch("/api/content/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          targetLanguages: selectedLanguages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ошибка запуска дубляжа")
      }

      setDubbingId(data.dubbingId)
      setStatus("processing")
    } catch (error: any) {
      console.error("Ошибка:", error)
      setError(error.message)
      setDubbing(false)
      setStatus("error")
    }
  }

  const checkDubbingStatus = async () => {
    if (!dubbingId) return

    try {
      const response = await fetch(`/api/content/translate?dubbingId=${dubbingId}`)
      const data = await response.json()

      if (data.success) {
        setProgress(data.progress || 0)
        setStatus(data.status)

        if (data.status === "completed") {
          setDubbedUrls(data.dubbedUrls || {})
          setDubbing(false)
        } else if (data.status === "failed") {
          setError(data.error || "Ошибка дубляжа")
          setDubbing(false)
        }
      }
    } catch (error) {
      console.error("Ошибка проверки статуса:", error)
    }
  }

  const downloadDubbedVideo = (language: string, url: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `${contentTitle}-${language}.mp4`
    link.click()
  }

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "processing":
      case "starting":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "error":
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Languages className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "starting":
        return "Запуск дубляжа..."
      case "processing":
        return `Обработка... ${progress}%`
      case "completed":
        return "Дубляж завершен!"
      case "error":
      case "failed":
        return "Ошибка дубляжа"
      default:
        return "Готов к запуску"
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Перевод и дубляж
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Выбор языков */}
          <Card>
            <CardContent className="pt-6">
              <Label className="mb-3 block">Выберите языки для дубляжа</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleLanguage(lang.code)}
                    disabled={dubbing || status === "completed"}
                    className="justify-start"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Статус дубляжа */}
          {(dubbing || status === "completed" || error) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-medium">{getStatusText()}</span>
                  </div>
                  {dubbing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={checkDubbingStatus}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {progress > 0 && status === "processing" && (
                  <Progress value={progress} className="mb-4" />
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {status === "completed" && Object.keys(dubbedUrls).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Готовые версии:
                    </p>
                    {Object.entries(dubbedUrls).map(([lang, url]) => {
                      const language = LANGUAGES.find(l => l.code === lang)
                      return (
                        <div
                          key={lang}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {language?.flag} {language?.name}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(url, "_blank")}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Просмотр
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadDubbedVideo(lang, url)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Информация об ElevenLabs */}
          <Alert>
            <Languages className="h-4 w-4" />
            <AlertDescription>
              Дубляж выполняется через ElevenLabs Dubbing API. 
              Поддерживаются видео длительностью до 2.5 часов. 
              Сохраняются эмоции и синхронизация губ.
            </AlertDescription>
          </Alert>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            <Button
              onClick={startDubbing}
              disabled={selectedLanguages.length === 0 || dubbing || status === "completed"}
            >
              {dubbing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Начать дубляж
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}