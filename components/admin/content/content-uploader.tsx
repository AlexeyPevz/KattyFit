"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, Video, FileVideo, Loader2, Check, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import logger from "@/lib/logger"

const contentSchema = z.object({
  type: z.enum(["short", "lesson"]),
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  enableTranslation: z.boolean(),
  targetLanguages: z.array(z.string()).min(1, "Выберите хотя бы один язык"),
})

const SUPPORTED_LANGUAGES = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
]

export function ContentUploader() {
  const [uploadType, setUploadType] = useState<"file" | "link">("file")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [rutubeUrl, setRutubeUrl] = useState("")
  const [contentType, setContentType] = useState<"short" | "lesson">("short")
  const [enableTranslation, setEnableTranslation] = useState(true)
  const [selectedLanguages, setSelectedLanguages] = useState(["en"])
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")

  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: "short",
      title: "",
      description: "",
      enableTranslation: true,
      targetLanguages: ["en"],
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Автоматически определяем тип контента по длительности (позже)
      if (file.size > 100 * 1024 * 1024) { // > 100MB
        setContentType("lesson")
      }
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    setUploadProgress(0)

    try {
      if (uploadType === "file" && selectedFile) {
        // Загрузка файла
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("title", title)
        formData.append("description", subtitle)
        formData.append("type", contentType)
        formData.append("enableTranslation", enableTranslation.toString())
        formData.append("targetLanguages", JSON.stringify(selectedLanguages))

        const response = await fetch("/api/content/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Ошибка загрузки")
        }

        const data = await response.json()
        logger.info("Контент загружен", { data })
        
        // Симуляция прогресса
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval)
              setUploading(false)
              // Очистка формы после успешной загрузки
              setSelectedFile(null)
              setTitle("")
              setSubtitle("")
              return 100
            }
            return prev + 20
          })
        }, 200)
      } else if (uploadType === "link" && rutubeUrl) {
        // Обработка ссылки RuTube
        const response = await fetch("/api/content/rutube", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: rutubeUrl,
            title,
            description: subtitle,
            type: contentType,
            enableTranslation,
            targetLanguages: selectedLanguages,
          }),
        })

        if (!response.ok) {
          throw new Error("Ошибка обработки ссылки")
        }

        const data = await response.json()
        logger.info("Ссылка обработана", { data })
        
        setUploadProgress(100)
        setTimeout(() => {
          setUploading(false)
          // Очистка формы
          setRutubeUrl("")
          setTitle("")
          setSubtitle("")
        }, 1000)
      }
    } catch (error) {
      logger.error("Ошибка", { error: error instanceof Error ? error.message : String(error) })
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages((prev) => 
      prev.includes(langCode)
        ? prev.filter((l) => l !== langCode)
        : [...prev, langCode]
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as "file" | "link")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">
            <FileVideo className="h-4 w-4 mr-2" />
            Загрузить файл
          </TabsTrigger>
          <TabsTrigger value="link">
            <Link className="h-4 w-4 mr-2" />
            Ссылка на RuTube
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <label
              htmlFor="video-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Нажмите для выбора видео или перетащите файл сюда
              </p>
              <p className="text-xs text-muted-foreground">
                MP4, MOV, AVI до 2GB
              </p>
            </label>
          </div>

          {selectedFile && (
            <Alert>
              <Video className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{selectedFile.name}</span>
                <Badge variant="secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="link" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rutube-url">Ссылка на видео RuTube</Label>
            <Input
              id="rutube-url"
              type="url"
              placeholder="https://rutube.ru/video/..."
              value={rutubeUrl}
              onChange={(e) => setRutubeUrl(e.target.value)}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Вставьте полную ссылку на видео с RuTube
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Тип контента</Label>
          <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as "short" | "lesson")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="short" id="short" />
              <Label htmlFor="short" className="cursor-pointer">
                Короткий ролик (до 3 минут)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lesson" id="lesson" />
              <Label htmlFor="lesson" className="cursor-pointer">
                Длинный урок (более 3 минут)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input
            id="title"
            placeholder="Введите название видео"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание (опционально)</Label>
          <Textarea
            id="description"
            placeholder="Введите описание видео"
            rows={3}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            disabled={uploading}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-0.5">
                <Label htmlFor="enable-translation">Включить перевод</Label>
                <p className="text-xs text-muted-foreground">
                  Автоматически создать версии на других языках
                </p>
              </div>
              <Switch
                id="enable-translation"
                checked={enableTranslation}
                onCheckedChange={setEnableTranslation}
                disabled={uploading}
              />
            </div>

            {enableTranslation && (
              <div className="space-y-2">
                <Label>Целевые языки</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUPPORTED_LANGUAGES.filter(lang => lang.code !== "ru").map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleLanguage(lang.code)}
                      disabled={uploading}
                      className="justify-start"
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Загрузка...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedFile(null)
            setRutubeUrl("")
            setContentType("short")
            setEnableTranslation(true)
            setSelectedLanguages(["en"])
            setTitle("")
            setSubtitle("")
          }}
          disabled={uploading}
        >
          Очистить
        </Button>
        <Button
          onClick={handleUpload}
          disabled={uploading || (!selectedFile && !rutubeUrl)}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Загрузить
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
