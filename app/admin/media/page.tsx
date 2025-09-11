"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Upload,
  FolderPlus,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Copy,
  Move,
  ImageIcon,
  Video,
  FileText,
  Eye,
  Share2,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { DemoDataBanner, DemoDataIndicator } from "@/components/admin/demo-data-banner"
import { useDemoData } from "@/hooks/use-demo-data"

interface MediaFile {
  id: string
  name: string
  type: "image" | "video" | "document"
  url: string
  size: number
  folder: string
  tags: string[]
  uploadedAt: string
  dimensions?: { width: number; height: number }
  duration?: number
}

interface MediaFolder {
  id: string
  name: string
  parentId?: string
  itemCount: number
  createdAt: string
}

const mockFolders: MediaFolder[] = [
  { id: "1", name: "Курсы", itemCount: 45, createdAt: "2024-01-01" },
  { id: "2", name: "Тренировки", itemCount: 23, createdAt: "2024-01-02" },
  { id: "3", name: "Маркетинг", itemCount: 12, createdAt: "2024-01-03" },
  { id: "4", name: "Сертификаты", itemCount: 8, createdAt: "2024-01-04" },
]

const mockFiles: MediaFile[] = [
  {
    id: "1",
    name: "yoga-pose-1.jpg",
    type: "image",
    url: "/images/trainer-outdoor.jpg",
    size: 2048000,
    folder: "Курсы",
    tags: ["йога", "растяжка", "поза"],
    uploadedAt: "2024-01-15",
    dimensions: { width: 1920, height: 1080 },
  },
  {
    id: "2",
    name: "stretching-tutorial.mp4",
    type: "video",
    url: "/placeholder.svg",
    size: 15728640,
    folder: "Курсы",
    tags: ["видео", "урок", "растяжка"],
    uploadedAt: "2024-01-14",
    duration: 1200,
  },
  {
    id: "3",
    name: "certificate-template.pdf",
    type: "document",
    url: "/placeholder.svg",
    size: 512000,
    folder: "Сертификаты",
    tags: ["сертификат", "шаблон"],
    uploadedAt: "2024-01-13",
  },
]

export default function MediaManagerPage() {
  const { shouldShowDemo } = useDemoData()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleSelectAll = () => {
    setSelectedFiles(filteredFiles.map((file) => file.id))
  }

  const handleDeselectAll = () => {
    setSelectedFiles([])
  }

  const filteredFiles = (shouldShowDemo('courses') ? mockFiles : []).filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFolder = currentFolder === "all" || file.folder === currentFolder
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => file.tags.includes(tag))

    return matchesSearch && matchesFolder && matchesTags
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const allTags = Array.from(new Set((shouldShowDemo('courses') ? mockFiles : []).flatMap((file) => file.tags)))

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Медиа-менеджер</h1>
              <p className="text-muted-foreground">Управление файлами и медиа-контентом</p>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Новая папка
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать папку</DialogTitle>
                    <DialogDescription>Создайте новую папку для организации файлов</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folder-name">Название папки</Label>
                      <Input id="folder-name" placeholder="Введите название папки" />
                    </div>
                    <div>
                      <Label htmlFor="parent-folder">Родительская папка</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите папку" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="root">Корневая папка</SelectItem>
                          {mockFolders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Создать папку</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="yoga-gradient text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить файлы
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Загрузка файлов</DialogTitle>
                    <DialogDescription>Перетащите файлы или выберите их для загрузки</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Перетащите файлы сюда</p>
                      <p className="text-muted-foreground mb-4">или</p>
                      <Button variant="outline">Выбрать файлы</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="upload-folder">Папка</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите папку" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockFolders.map((folder) => (
                              <SelectItem key={folder.id} value={folder.id}>
                                {folder.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="upload-tags">Теги</Label>
                        <Input id="upload-tags" placeholder="Введите теги через запятую" />
                      </div>
                    </div>

                    <Button className="w-full yoga-gradient text-white">Загрузить файлы</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Папки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={currentFolder === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentFolder("all")}
                >
                  <div className="flex items-center gap-2">
                    Все файлы ({shouldShowDemo('courses') ? mockFiles.length : 0})
                    {shouldShowDemo('courses') && <DemoDataIndicator type="courses" />}
                  </div>
                </Button>
                {mockFolders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant={currentFolder === folder.name ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentFolder(folder.name)}
                  >
                    {folder.name} ({folder.itemCount})
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Теги</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTags([...selectedTags, tag])
                            } else {
                              setSelectedTags(selectedTags.filter((t) => t !== tag))
                            }
                          }}
                        />
                        <Label htmlFor={tag} className="text-sm">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Поиск файлов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedFiles.length} выбрано</Badge>
                    <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                      Отменить выбор
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Действия
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Move className="w-4 h-4 mr-2" />
                          Переместить
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Копировать
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={filteredFiles.length === 0}>
                  Выбрать все
                </Button>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* File Grid/List */}
            <DemoDataBanner type="courses">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedFiles.includes(file.id) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      <div className="relative aspect-square">
                        {file.type === "image" ? (
                          <Image
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Просмотр
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Скачать
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Поделиться
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {selectedFiles.includes(file.id) && (
                          <div className="absolute top-2 left-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {file.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{file.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex items-center p-4 hover:bg-muted/50 cursor-pointer ${
                          selectedFiles.includes(file.id) ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => handleFileSelect(file.id)}
                          />

                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            {file.type === "image" ? (
                              <Image
                                src={file.url || "/placeholder.svg"}
                                alt={file.name}
                                width={40}
                                height={40}
                                className="object-cover rounded"
                              />
                            ) : (
                              getFileIcon(file.type)
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.folder} • {formatFileSize(file.size)} •{" "}
                              {new Date(file.uploadedAt).toLocaleDateString("ru-RU")}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {file.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Скачать
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}
            </DemoDataBanner>

            {filteredFiles.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">Файлы не найдены</p>
                  <p className="text-muted-foreground">
                    Попробуйте изменить параметры поиска или загрузите новые файлы
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
