"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  Download, 
  RefreshCw, 
  Wand2, 
  Palette, 
  Type,
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContentThumbnailGeneratorProps {
  contentId: string
  onClose: () => void
}

const THUMBNAIL_TEMPLATES = [
  { id: "gradient", name: "Градиент", colors: ["#8b5cf6", "#3b82f6"] },
  { id: "solid", name: "Однотонный", colors: ["#8b5cf6"] },
  { id: "pattern", name: "Паттерн", colors: ["#8b5cf6", "#ec4899"] },
  { id: "photo", name: "С фото", colors: ["#000000"] },
]

const FONTS = [
  { id: "inter", name: "Inter", value: "Inter, sans-serif" },
  { id: "montserrat", name: "Montserrat", value: "Montserrat, sans-serif" },
  { id: "playfair", name: "Playfair Display", value: "Playfair Display, serif" },
]

const LANGUAGES = [
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
]

export function ContentThumbnailGenerator({ contentId, onClose }: ContentThumbnailGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generating, setGenerating] = useState(false)
  const [generationType, setGenerationType] = useState<"ai" | "template">("template")
  const [selectedTemplate, setSelectedTemplate] = useState("gradient")
  const [title, setTitle] = useState("Растяжка для начинающих")
  const [subtitle, setSubtitle] = useState("Урок 1")
  const [selectedFont, setSelectedFont] = useState("inter")
  const [fontSize, setFontSize] = useState([48])
  const [selectedLanguage, setSelectedLanguage] = useState("ru")
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [aiError, setAiError] = useState(false)

  // Функция отрисовки на canvas
  const drawThumbnail = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Устанавливаем размеры для 16:9
    canvas.width = 1920
    canvas.height = 1080

    const template = THUMBNAIL_TEMPLATES.find(t => t.id === selectedTemplate)
    if (!template) return

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Рисуем фон в зависимости от шаблона
    if (template.id === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, template.colors[0])
      gradient.addColorStop(1, template.colors[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (template.id === "solid") {
      ctx.fillStyle = template.colors[0]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (template.id === "pattern") {
      // Простой паттерн из кругов
      ctx.fillStyle = template.colors[0]
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = template.colors[1] + "20"
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          ctx.beginPath()
          ctx.arc(i * 100 + 50, j * 100 + 50, 30, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Добавляем полупрозрачный слой для улучшения читаемости текста
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.4)

    // Настройки текста
    const font = FONTS.find(f => f.id === selectedFont)
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Заголовок
    ctx.font = `bold ${fontSize[0]}px ${font?.value || "Inter, sans-serif"}`
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 50)

    // Подзаголовок
    if (subtitle) {
      ctx.font = `${fontSize[0] * 0.6}px ${font?.value || "Inter, sans-serif"}`
      ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 50)
    }

    // Бренд
    ctx.font = "bold 36px Inter, sans-serif"
    ctx.fillText("KattyFit", canvas.width / 2, canvas.height - 100)

    // Сохраняем как data URL
    setThumbnailUrl(canvas.toDataURL("image/png"))
  }

  // Перерисовываем при изменении параметров
  useEffect(() => {
    if (generationType === "template") {
      drawThumbnail()
    }
  }, [title, subtitle, selectedTemplate, selectedFont, fontSize, generationType])

  const handleAiGeneration = async () => {
    setGenerating(true)
    setAiError(false)

    // Симуляция AI генерации
    setTimeout(() => {
      // В реальном приложении здесь будет вызов AI API
      // Если ошибка, переключаемся на шаблон
      setAiError(true)
      setGenerationType("template")
      setGenerating(false)
    }, 2000)
  }

  const handleDownload = () => {
    if (thumbnailUrl) {
      const link = document.createElement("a")
      link.download = `thumbnail-${contentId}-${selectedLanguage}.png`
      link.href = thumbnailUrl
      link.click()
    }
  }

  const handleSave = async () => {
    if (!thumbnailUrl) return

    try {
      const response = await fetch("/api/content/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          language: selectedLanguage,
          imageData: thumbnailUrl,
          type: "generated",
        }),
      })

      if (!response.ok) {
        throw new Error("Ошибка сохранения")
      }

      const data = await response.json()
      console.log("Обложка сохранена:", data)
      
      // Закрываем диалог после успешного сохранения
      onClose()
    } catch (error) {
      console.error("Ошибка сохранения обложки:", error)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Генератор обложек</DialogTitle>
        </DialogHeader>

        <Tabs value={generationType} onValueChange={(v) => setGenerationType(v as "ai" | "template")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" disabled={aiError}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI генерация
            </TabsTrigger>
            <TabsTrigger value="template">
              <Palette className="mr-2 h-4 w-4" />
              Шаблоны
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            {aiError ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  AI генерация временно недоступна. Используйте шаблоны для создания обложки.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      {generating ? (
                        <div className="text-center">
                          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">Генерация обложки...</p>
                        </div>
                      ) : (
                        <Button onClick={handleAiGeneration}>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Сгенерировать с AI
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Настройки */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Язык</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Шаблон</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {THUMBNAIL_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant={selectedTemplate === template.id ? "default" : "outline"}
                        onClick={() => setSelectedTemplate(template.id)}
                        className="justify-start"
                      >
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{
                            background: template.colors.length > 1
                              ? `linear-gradient(45deg, ${template.colors[0]}, ${template.colors[1]})`
                              : template.colors[0]
                          }}
                        />
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Подзаголовок</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Введите подзаголовок (опционально)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Шрифт</Label>
                  <Select value={selectedFont} onValueChange={setSelectedFont}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((font) => (
                        <SelectItem key={font.id} value={font.id}>
                          <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Размер шрифта: {fontSize[0]}px</Label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    min={24}
                    max={72}
                    step={2}
                  />
                </div>
              </div>

              {/* Превью */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button onClick={drawThumbnail} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Обновить
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Скачать
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
