"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Upload, Save, RotateCcw, Download, Smartphone, Monitor, Tablet } from "lucide-react"
import Image from "next/image"

interface BrandingSettings {
  logo: {
    primary: string
    secondary: string
    favicon: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    fontSize: number
    lineHeight: number
  }
  layout: {
    borderRadius: number
    spacing: number
    shadowIntensity: number
  }
  texts: {
    siteName: string
    tagline: string
    description: string
    footerText: string
    contactEmail: string
    contactPhone: string
  }
  social: {
    telegram: string
    instagram: string
    youtube: string
    vk: string
  }
}

const defaultSettings: BrandingSettings = {
  logo: {
    primary: "/placeholder.svg?height=60&width=200",
    secondary: "/placeholder.svg?height=40&width=40",
    favicon: "/placeholder.svg?height=32&width=32",
  },
  colors: {
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#06b6d4",
    background: "#ffffff",
    text: "#1f2937",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSize: 16,
    lineHeight: 1.6,
  },
  layout: {
    borderRadius: 8,
    spacing: 16,
    shadowIntensity: 2,
  },
  texts: {
    siteName: "KattyFit",
    tagline: "Растяжка и Аэройога с профессиональным тренером",
    description: "Персональные тренировки и онлайн-курсы для развития гибкости, силы и внутренней гармонии",
    footerText: "© 2024 KattyFit. Все права защищены.",
    contactEmail: "info@kattyfit.ru",
    contactPhone: "+7 (999) 123-45-67",
  },
  social: {
    telegram: "@kattyFit_bgd",
    instagram: "@kattyfit",
    youtube: "@kattyfit",
    vk: "kattyfit",
  },
}

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
]

export default function BrandingPage() {
  const [settings, setSettings] = useState<BrandingSettings>(defaultSettings)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [activeTab, setActiveTab] = useState("logo")

  const updateSettings = (section: keyof BrandingSettings, key: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "branding-settings.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Настройки брендинга</h1>
              <p className="text-muted-foreground">Настройка внешнего вида и фирменного стиля</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Сбросить
              </Button>
              <Button variant="outline" onClick={exportSettings}>
                <Download className="w-4 h-4 mr-2" />
                Экспорт
              </Button>
              <Button className="yoga-gradient text-white">
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="logo">Логотип</TabsTrigger>
                <TabsTrigger value="colors">Цвета</TabsTrigger>
                <TabsTrigger value="typography">Шрифты</TabsTrigger>
                <TabsTrigger value="layout">Макет</TabsTrigger>
                <TabsTrigger value="content">Контент</TabsTrigger>
              </TabsList>

              {/* Logo Tab */}
              <TabsContent value="logo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Логотипы и иконки</CardTitle>
                    <CardDescription>Загрузите логотипы для разных частей сайта</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label>Основной логотип</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Image
                            src={settings.logo.primary || "/placeholder.svg"}
                            alt="Primary logo"
                            width={200}
                            height={60}
                            className="mx-auto mb-3"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Загрузить
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Рекомендуемый размер: 200x60px</p>
                      </div>

                      <div className="space-y-3">
                        <Label>Иконка</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Image
                            src={settings.logo.secondary || "/placeholder.svg"}
                            alt="Icon"
                            width={40}
                            height={40}
                            className="mx-auto mb-3"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Загрузить
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Рекомендуемый размер: 40x40px</p>
                      </div>

                      <div className="space-y-3">
                        <Label>Favicon</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Image
                            src={settings.logo.favicon || "/placeholder.svg"}
                            alt="Favicon"
                            width={32}
                            height={32}
                            className="mx-auto mb-3"
                          />
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Загрузить
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Рекомендуемый размер: 32x32px</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Цветовая схема</CardTitle>
                    <CardDescription>Настройте основные цвета вашего бренда</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="primary-color">Основной цвет</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <Input
                              id="primary-color"
                              type="color"
                              value={settings.colors.primary}
                              onChange={(e) => updateSettings("colors", "primary", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={settings.colors.primary}
                              onChange={(e) => updateSettings("colors", "primary", e.target.value)}
                              placeholder="#8b5cf6"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="secondary-color">Вторичный цвет</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <Input
                              id="secondary-color"
                              type="color"
                              value={settings.colors.secondary}
                              onChange={(e) => updateSettings("colors", "secondary", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={settings.colors.secondary}
                              onChange={(e) => updateSettings("colors", "secondary", e.target.value)}
                              placeholder="#ec4899"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="accent-color">Акцентный цвет</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <Input
                              id="accent-color"
                              type="color"
                              value={settings.colors.accent}
                              onChange={(e) => updateSettings("colors", "accent", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={settings.colors.accent}
                              onChange={(e) => updateSettings("colors", "accent", e.target.value)}
                              placeholder="#06b6d4"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="background-color">Цвет фона</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <Input
                              id="background-color"
                              type="color"
                              value={settings.colors.background}
                              onChange={(e) => updateSettings("colors", "background", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={settings.colors.background}
                              onChange={(e) => updateSettings("colors", "background", e.target.value)}
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="text-color">Цвет текста</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <Input
                              id="text-color"
                              type="color"
                              value={settings.colors.text}
                              onChange={(e) => updateSettings("colors", "text", e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={settings.colors.text}
                              onChange={(e) => updateSettings("colors", "text", e.target.value)}
                              placeholder="#1f2937"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Label className="text-base font-medium mb-3 block">Предустановленные палитры</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { name: "Фиолетовая", primary: "#8b5cf6", secondary: "#ec4899" },
                          { name: "Синяя", primary: "#3b82f6", secondary: "#06b6d4" },
                          { name: "Зеленая", primary: "#10b981", secondary: "#84cc16" },
                          { name: "Оранжевая", primary: "#f59e0b", secondary: "#ef4444" },
                        ].map((palette) => (
                          <Button
                            key={palette.name}
                            variant="outline"
                            className="h-auto p-3 flex flex-col items-center bg-transparent"
                            onClick={() => {
                              updateSettings("colors", "primary", palette.primary)
                              updateSettings("colors", "secondary", palette.secondary)
                            }}
                          >
                            <div className="flex space-x-1 mb-2">
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.primary }} />
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.secondary }} />
                            </div>
                            <span className="text-xs">{palette.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Типографика</CardTitle>
                    <CardDescription>Настройка шрифтов и размеров текста</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="heading-font">Шрифт заголовков</Label>
                        <Select
                          value={settings.typography.headingFont}
                          onValueChange={(value) => updateSettings("typography", "headingFont", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="body-font">Шрифт основного текста</Label>
                        <Select
                          value={settings.typography.bodyFont}
                          onValueChange={(value) => updateSettings("typography", "bodyFont", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Размер шрифта: {settings.typography.fontSize}px</Label>
                        <Slider
                          value={[settings.typography.fontSize]}
                          onValueChange={([value]) => updateSettings("typography", "fontSize", value)}
                          max={24}
                          min={12}
                          step={1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>12px</span>
                          <span>24px</span>
                        </div>
                      </div>

                      <div>
                        <Label>Межстрочный интервал: {settings.typography.lineHeight}</Label>
                        <Slider
                          value={[settings.typography.lineHeight]}
                          onValueChange={([value]) => updateSettings("typography", "lineHeight", value)}
                          max={2}
                          min={1}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>1.0</span>
                          <span>2.0</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Label className="text-base font-medium mb-3 block">Предпросмотр типографики</Label>
                      <div
                        className="p-4 border rounded-lg"
                        style={{
                          fontFamily: settings.typography.bodyFont,
                          fontSize: `${settings.typography.fontSize}px`,
                          lineHeight: settings.typography.lineHeight,
                        }}
                      >
                        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: settings.typography.headingFont }}>
                          Заголовок первого уровня
                        </h1>
                        <h2
                          className="text-xl font-semibold mb-2"
                          style={{ fontFamily: settings.typography.headingFont }}
                        >
                          Заголовок второго уровня
                        </h2>
                        <p className="mb-2">
                          Это пример основного текста. Здесь вы можете увидеть, как будет выглядеть обычный текст с
                          выбранными настройками шрифта.
                        </p>
                        <p className="text-sm text-muted-foreground">Это пример вторичного текста меньшего размера.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки макета</CardTitle>
                    <CardDescription>Настройка внешнего вида элементов интерфейса</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Скругление углов: {settings.layout.borderRadius}px</Label>
                        <Slider
                          value={[settings.layout.borderRadius]}
                          onValueChange={([value]) => updateSettings("layout", "borderRadius", value)}
                          max={24}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>0px (прямые углы)</span>
                          <span>24px (сильное скругление)</span>
                        </div>
                      </div>

                      <div>
                        <Label>Отступы: {settings.layout.spacing}px</Label>
                        <Slider
                          value={[settings.layout.spacing]}
                          onValueChange={([value]) => updateSettings("layout", "spacing", value)}
                          max={32}
                          min={8}
                          step={2}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>8px (компактно)</span>
                          <span>32px (просторно)</span>
                        </div>
                      </div>

                      <div>
                        <Label>Интенсивность теней: {settings.layout.shadowIntensity}</Label>
                        <Slider
                          value={[settings.layout.shadowIntensity]}
                          onValueChange={([value]) => updateSettings("layout", "shadowIntensity", value)}
                          max={5}
                          min={0}
                          step={1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>0 (без теней)</span>
                          <span>5 (сильные тени)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Label className="text-base font-medium mb-3 block">Предпросмотр элементов</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          className="p-4 bg-white border"
                          style={{
                            borderRadius: `${settings.layout.borderRadius}px`,
                            padding: `${settings.layout.spacing}px`,
                            boxShadow: `0 ${settings.layout.shadowIntensity}px ${settings.layout.shadowIntensity * 2}px rgba(0,0,0,0.1)`,
                          }}
                        >
                          <h3 className="font-semibold mb-2">Карточка</h3>
                          <p className="text-sm text-muted-foreground">Пример карточки с настройками</p>
                        </div>

                        <Button
                          style={{
                            borderRadius: `${settings.layout.borderRadius}px`,
                            backgroundColor: settings.colors.primary,
                          }}
                          className="text-white"
                        >
                          Кнопка
                        </Button>

                        <Input
                          placeholder="Поле ввода"
                          style={{
                            borderRadius: `${settings.layout.borderRadius}px`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Контент и тексты</CardTitle>
                    <CardDescription>Настройка текстового содержимого сайта</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="site-name">Название сайта</Label>
                          <Input
                            id="site-name"
                            value={settings.texts.siteName}
                            onChange={(e) => updateSettings("texts", "siteName", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="tagline">Слоган</Label>
                          <Input
                            id="tagline"
                            value={settings.texts.tagline}
                            onChange={(e) => updateSettings("texts", "tagline", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Описание</Label>
                          <Textarea
                            id="description"
                            value={settings.texts.description}
                            onChange={(e) => updateSettings("texts", "description", e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="footer-text">Текст в подвале</Label>
                          <Input
                            id="footer-text"
                            value={settings.texts.footerText}
                            onChange={(e) => updateSettings("texts", "footerText", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="contact-email">Email для связи</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={settings.texts.contactEmail}
                            onChange={(e) => updateSettings("texts", "contactEmail", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="contact-phone">Телефон для связи</Label>
                          <Input
                            id="contact-phone"
                            value={settings.texts.contactPhone}
                            onChange={(e) => updateSettings("texts", "contactPhone", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label className="text-base font-medium mb-3 block">Социальные сети</Label>
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="telegram">Telegram</Label>
                              <Input
                                id="telegram"
                                value={settings.social.telegram}
                                onChange={(e) => updateSettings("social", "telegram", e.target.value)}
                                placeholder="@username"
                              />
                            </div>

                            <div>
                              <Label htmlFor="instagram">Instagram</Label>
                              <Input
                                id="instagram"
                                value={settings.social.instagram}
                                onChange={(e) => updateSettings("social", "instagram", e.target.value)}
                                placeholder="@username"
                              />
                            </div>

                            <div>
                              <Label htmlFor="youtube">YouTube</Label>
                              <Input
                                id="youtube"
                                value={settings.social.youtube}
                                onChange={(e) => updateSettings("social", "youtube", e.target.value)}
                                placeholder="@channel"
                              />
                            </div>

                            <div>
                              <Label htmlFor="vk">VK</Label>
                              <Input
                                id="vk"
                                value={settings.social.vk}
                                onChange={(e) => updateSettings("social", "vk", e.target.value)}
                                placeholder="username"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Предпросмотр</CardTitle>
                  <div className="flex items-center space-x-1 border rounded-md p-1">
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "tablet" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("tablet")}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`border rounded-lg overflow-hidden transition-all ${
                    previewDevice === "mobile"
                      ? "max-w-sm mx-auto"
                      : previewDevice === "tablet"
                        ? "max-w-md mx-auto"
                        : "w-full"
                  }`}
                  style={{ backgroundColor: settings.colors.background }}
                >
                  {/* Preview Header */}
                  <div
                    className="p-4 border-b"
                    style={{
                      backgroundColor: settings.colors.primary,
                      color: "white",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                        >
                          <span className="text-sm font-bold">K</span>
                        </div>
                        <span className="font-bold" style={{ fontFamily: settings.typography.headingFont }}>
                          {settings.texts.siteName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div
                    className="p-4 space-y-4"
                    style={{
                      fontFamily: settings.typography.bodyFont,
                      fontSize: `${Math.max(settings.typography.fontSize - 2, 12)}px`,
                      lineHeight: settings.typography.lineHeight,
                      color: settings.colors.text,
                    }}
                  >
                    <div>
                      <h1 className="text-lg font-bold mb-2" style={{ fontFamily: settings.typography.headingFont }}>
                        {settings.texts.tagline}
                      </h1>
                      <p className="text-sm opacity-75">{settings.texts.description}</p>
                    </div>

                    <div
                      className="p-3 rounded border"
                      style={{
                        borderRadius: `${settings.layout.borderRadius}px`,
                        padding: `${Math.max(settings.layout.spacing - 4, 8)}px`,
                        boxShadow: `0 ${settings.layout.shadowIntensity}px ${settings.layout.shadowIntensity * 2}px rgba(0,0,0,0.1)`,
                      }}
                    >
                      <h3 className="font-semibold mb-1">Пример карточки</h3>
                      <p className="text-xs opacity-75">Контент с настройками</p>
                    </div>

                    <button
                      className="w-full py-2 px-4 text-white font-medium"
                      style={{
                        backgroundColor: settings.colors.primary,
                        borderRadius: `${settings.layout.borderRadius}px`,
                      }}
                    >
                      Кнопка действия
                    </button>

                    <div className="text-xs opacity-50 text-center pt-2 border-t">{settings.texts.footerText}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Основной цвет:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: settings.colors.primary }} />
                      <span className="font-mono text-xs">{settings.colors.primary}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Шрифт:</span>
                    <span className="text-xs">{settings.typography.headingFont}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Скругление:</span>
                    <span className="text-xs">{settings.layout.borderRadius}px</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
