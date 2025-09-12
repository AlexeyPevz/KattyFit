"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Image as ImageIcon, 
  Wand2, 
  Download, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import logger from "@/lib/logger"

interface ContentThumbnailGeneratorProps {
  contentId: string
  onClose: () => void
}

export function ContentThumbnailGenerator({ contentId, onClose }: ContentThumbnailGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("modern")
  const [generating, setGenerating] = useState(false)
  const [generatedThumbnails, setGeneratedThumbnails] = useState<string[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const styles = [
    { id: "modern", name: "Современный", description: "Чистый и минималистичный дизайн" },
    { id: "vibrant", name: "Яркий", description: "Яркие цвета и динамичные элементы" },
    { id: "elegant", name: "Элегантный", description: "Изысканный и профессиональный стиль" },
    { id: "playful", name: "Игривый", description: "Веселый и дружелюбный дизайн" },
  ]

  const generateThumbnails = async () => {
    if (!prompt.trim()) return

    setGenerating(true)
    try {
      // Имитация генерации обложек через AI
      const response = await fetch("/api/content/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          prompt,
          style,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedThumbnails(data.thumbnails || [])
      } else {
        // Fallback - демо обложки
        setGeneratedThumbnails([
          "https://picsum.photos/400/225?random=1",
          "https://picsum.photos/400/225?random=2",
          "https://picsum.photos/400/225?random=3",
          "https://picsum.photos/400/225?random=4",
        ])
      }
    } catch (error) {
      logger.error("Ошибка генерации обложек", { error: error instanceof Error ? error.message : String(error) })
      // Fallback - демо обложки
      setGeneratedThumbnails([
        "https://picsum.photos/400/225?random=1",
        "https://picsum.photos/400/225?random=2",
        "https://picsum.photos/400/225?random=3",
        "https://picsum.photos/400/225?random=4",
      ])
    } finally {
      setGenerating(false)
    }
  }

  const saveThumbnail = async () => {
    if (!selectedThumbnail) return

    setSaving(true)
    try {
      const response = await fetch("/api/content/thumbnail", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          thumbnailUrl: selectedThumbnail,
        }),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      logger.error("Ошибка сохранения обложки", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Генератор обложек
          </DialogTitle>
          <DialogDescription>
            Создайте привлекательную обложку для вашего контента с помощью AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Настройки генерации */}
          <Card>
            <CardHeader>
              <CardTitle>Настройки генерации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Описание обложки</Label>
                <Textarea
                  id="prompt"
                  placeholder="Опишите, как должна выглядеть обложка. Например: 'Фитнес-тренировка, энергичная женщина, яркие цвета, мотивационный стиль'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Стиль дизайна</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {styles.map((styleOption) => (
                    <div
                      key={styleOption.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        style === styleOption.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                      onClick={() => setStyle(styleOption.id)}
                    >
                      <div className="font-medium">{styleOption.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {styleOption.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={generateThumbnails} 
                disabled={generating || !prompt.trim()}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Сгенерировать обложки
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Результаты генерации */}
          {generatedThumbnails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Сгенерированные обложки</CardTitle>
                <CardDescription>
                  Выберите понравившуюся обложку для сохранения
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {generatedThumbnails.map((thumbnail, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedThumbnail === thumbnail
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                      onClick={() => setSelectedThumbnail(thumbnail)}
                    >
                      <img
                        src={thumbnail}
                        alt={`Обложка ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {selectedThumbnail === thumbnail && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedThumbnail && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          Обложка выбрана
                        </span>
                      </div>
                      <Button
                        onClick={saveThumbnail}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          "Сохранить обложку"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Подсказки */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Совет:</strong> Для лучших результатов описывайте обложку детально, 
              включая цвета, настроение, объекты и стиль. AI создаст несколько вариантов 
              на основе вашего описания.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          {selectedThumbnail && (
            <Button onClick={saveThumbnail} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить обложку"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
