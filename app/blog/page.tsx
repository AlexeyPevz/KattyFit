"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Clock, Eye, Heart, Share2, BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const blogPosts = [
  {
    id: 1,
    title: "5 мифов о растяжке, которые мешают вашему прогрессу",
    excerpt: "Разбираем самые популярные заблуждения о растяжке и объясняем, как правильно развивать гибкость без риска травм.",
    content: "Полный текст статьи...",
    image: "/images/trainer-studio.jpg",
    category: "Растяжка",
    author: "KattyFit",
    date: "15 января 2025",
    readTime: "5 мин",
    views: 1234,
    likes: 89,
    tags: ["растяжка", "мифы", "безопасность"]
  },
  {
    id: 2,
    title: "Аэройога для начинающих: с чего начать?",
    excerpt: "Пошаговое руководство для тех, кто хочет попробовать аэройогу. Базовые позиции, техника безопасности и первые упражнения.",
    content: "Полный текст статьи...",
    image: "/images/trainer-outdoor.jpg",
    category: "Аэройога",
    author: "KattyFit",
    date: "10 января 2025",
    readTime: "7 мин",
    views: 856,
    likes: 124,
    tags: ["аэройога", "начинающим", "гайд"]
  },
  {
    id: 3,
    title: "Утренняя растяжка: 10-минутный комплекс для бодрого дня",
    excerpt: "Простые упражнения, которые помогут проснуться, улучшить самочувствие и зарядиться энергией на весь день.",
    content: "Полный текст статьи...",
    image: "/images/trainer-artistic.jpg",
    category: "Практика",
    author: "KattyFit",
    date: "5 января 2025",
    readTime: "4 мин",
    views: 2341,
    likes: 201,
    tags: ["утро", "растяжка", "энергия"]
  },
  {
    id: 4,
    title: "Как сесть на шпагат за 30 дней: реальный план",
    excerpt: "Детальная программа тренировок с прогрессией от простых упражнений к полному шпагату. Включает видео и фото инструкции.",
    content: "Полный текст статьи...",
    image: "/images/trainer-studio.jpg",
    category: "Растяжка",
    author: "KattyFit",
    date: "28 декабря 2024",
    readTime: "10 мин",
    views: 4567,
    likes: 342,
    tags: ["шпагат", "программа", "30 дней"]
  },
  {
    id: 5,
    title: "Питание для гибкости: что есть до и после тренировки",
    excerpt: "Рекомендации по питанию для улучшения результатов в растяжке. Продукты, которые помогают мышцам и связкам.",
    content: "Полный текст статьи...",
    image: "/images/trainer-outdoor.jpg",
    category: "Питание",
    author: "KattyFit",
    date: "20 декабря 2024",
    readTime: "6 мин",
    views: 1890,
    likes: 156,
    tags: ["питание", "диета", "гибкость"]
  },
  {
    id: 6,
    title: "Йога vs Пилатес: что выбрать для развития гибкости?",
    excerpt: "Сравниваем две популярные практики, разбираем их особенности и помогаем определиться с выбором.",
    content: "Полный текст статьи...",
    image: "/images/trainer-artistic.jpg",
    category: "Обзоры",
    author: "KattyFit",
    date: "15 декабря 2024",
    readTime: "8 мин",
    views: 2103,
    likes: 178,
    tags: ["йога", "пилатес", "сравнение"]
  }
]

const categories = ["Все статьи", "Растяжка", "Аэройога", "Практика", "Питание", "Обзоры"]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Все статьи")
  const [sortBy, setSortBy] = useState("Новые")
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "Все статьи" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "Популярные":
        return b.views - a.views
      case "Обсуждаемые":
        return b.likes - a.likes
      default: // "Новые"
        return b.id - a.id
    }
  })

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Блог о{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              гибкости и здоровье
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Полезные статьи, советы экспертов и практические руководства для вашего развития
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск статей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Новые">Новые</SelectItem>
                <SelectItem value="Популярные">Популярные</SelectItem>
                <SelectItem value="Обсуждаемые">Обсуждаемые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-white/90 text-black">
                    {post.category}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">
                    {post.title}
                  </CardTitle>
                  
                  <CardDescription className="line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </div>
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Heart 
                          className={`w-4 h-4 ${
                            likedPosts.includes(post.id) ? "fill-red-500 text-red-500" : ""
                          }`} 
                        />
                        {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                      </button>
                    </div>
                    <button className="hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/blog/${post.id}`}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Читать далее
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Загрузить еще статьи
          </Button>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-2">Не пропустите новые статьи</h3>
          <p className="text-muted-foreground mb-6">
            Подпишитесь на рассылку и получайте полезные материалы каждую неделю
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input 
              placeholder="Ваш email" 
              type="email"
              className="flex-1"
            />
            <Button className="yoga-gradient text-white">
              Подписаться
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
