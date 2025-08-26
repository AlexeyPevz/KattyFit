"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Video, 
  Globe, 
  Clock, 
  Eye, 
  Edit,
  Trash2,
  Image as ImageIcon,
  Languages,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ContentThumbnailGenerator } from "./content-thumbnail-generator"

// Моковые данные для демонстрации
const mockContent = [
  {
    id: "1",
    title: "Растяжка для начинающих - Урок 1",
    type: "lesson",
    duration: "45:30",
    status: "published",
    languages: ["ru", "en", "es"],
    platforms: ["youtube", "rutube"],
    views: 1234,
    thumbnail: "/images/trainer-studio.jpg",
    createdAt: "2024-01-20",
  },
  {
    id: "2",
    title: "Утренняя разминка за 5 минут",
    type: "short",
    duration: "2:45",
    status: "processing",
    languages: ["ru"],
    platforms: ["instagram", "tiktok"],
    views: 5678,
    thumbnail: "/images/trainer-outdoor.jpg",
    createdAt: "2024-01-19",
  },
  {
    id: "3",
    title: "Аэройога: базовые позиции",
    type: "lesson",
    duration: "32:15",
    status: "draft",
    languages: ["ru"],
    platforms: [],
    views: 0,
    thumbnail: null,
    createdAt: "2024-01-18",
  },
]

const statusConfig = {
  draft: { label: "Черновик", color: "secondary", icon: AlertCircle },
  processing: { label: "Обработка", color: "warning", icon: Loader2 },
  published: { label: "Опубликовано", color: "success", icon: CheckCircle2 },
}

const platformConfig = {
  youtube: { label: "YouTube", color: "#FF0000" },
  rutube: { label: "RuTube", color: "#00A651" },
  instagram: { label: "Instagram", color: "#E4405F" },
  tiktok: { label: "TikTok", color: "#000000" },
  vk: { label: "VK", color: "#0077FF" },
  telegram: { label: "Telegram", color: "#0088CC" },
}

export function ContentList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [showThumbnailGenerator, setShowThumbnailGenerator] = useState(false)

  const filteredContent = mockContent.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || content.type === filterType
    const matchesStatus = filterStatus === "all" || content.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Фильтры и поиск */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Тип контента" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="short">Короткие ролики</SelectItem>
            <SelectItem value="lesson">Длинные уроки</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="draft">Черновики</SelectItem>
            <SelectItem value="processing">В обработке</SelectItem>
            <SelectItem value="published">Опубликовано</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список контента */}
      <div className="grid gap-4">
        {filteredContent.map((content) => {
          const StatusIcon = statusConfig[content.status as keyof typeof statusConfig].icon
          
          return (
            <Card key={content.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Миниатюра */}
                  <div className="relative w-48 h-32 bg-muted flex-shrink-0">
                    {content.thumbnail ? (
                      <img
                        src={content.thumbnail}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 right-2 bg-black/70 text-white"
                    >
                      {content.duration}
                    </Badge>
                  </div>

                  {/* Информация о контенте */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold line-clamp-1">{content.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {content.createdAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {content.views.toLocaleString()} просмотров
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedContent(content.id)
                            setShowThumbnailGenerator(true)
                          }}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Генерировать обложку
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Languages className="mr-2 h-4 w-4" />
                            Управление локализацией
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Globe className="mr-2 h-4 w-4" />
                            Публикация
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {/* Статус */}
                      <Badge 
                        variant={statusConfig[content.status as keyof typeof statusConfig].color as any}
                        className="gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[content.status as keyof typeof statusConfig].label}
                      </Badge>

                      {/* Тип контента */}
                      <Badge variant="outline">
                        {content.type === "short" ? "Короткий" : "Урок"}
                      </Badge>

                      {/* Языки */}
                      {content.languages.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Languages className="h-3 w-3 text-muted-foreground" />
                          {content.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="px-1.5">
                              {lang.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Платформы */}
                      {content.platforms.length > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                          {content.platforms.map((platform) => (
                            <Badge 
                              key={platform} 
                              variant="outline"
                              style={{ 
                                borderColor: platformConfig[platform as keyof typeof platformConfig].color,
                                color: platformConfig[platform as keyof typeof platformConfig].color 
                              }}
                            >
                              {platformConfig[platform as keyof typeof platformConfig].label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Контент не найден</p>
        </div>
      )}

      {/* Модальное окно генератора обложек */}
      {showThumbnailGenerator && selectedContent && (
        <ContentThumbnailGenerator
          contentId={selectedContent}
          onClose={() => {
            setShowThumbnailGenerator(false)
            setSelectedContent(null)
          }}
        />
      )}
    </div>
  )
}