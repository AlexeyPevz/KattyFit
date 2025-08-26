"use client"

import { useState } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { ContentUploader } from "@/components/admin/content/content-uploader"
import { ContentList } from "@/components/admin/content/content-list"
import { ContentPublisher } from "@/components/admin/content/content-publisher"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Video, Image, Globe } from "lucide-react"
import Link from "next/link"

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState("upload")

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
              <h1 className="text-2xl font-bold">Управление контентом</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Загрузка
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <Video className="h-4 w-4" />
                Контент
              </TabsTrigger>
              <TabsTrigger value="publish" className="gap-2">
                <Globe className="h-4 w-4" />
                Публикация
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Загрузка нового контента</CardTitle>
                  <CardDescription>
                    Загрузите видео или укажите ссылку на RuTube для дальнейшей обработки
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentUploader />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Библиотека контента</CardTitle>
                  <CardDescription>
                    Управление загруженными видео и их локализациями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publish" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Публикация на платформах</CardTitle>
                  <CardDescription>
                    Выберите контент и платформы для публикации
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentPublisher />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}