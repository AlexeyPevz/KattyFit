"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, Clock, Users, Play, ShoppingCart, Heart, BookOpen } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

const courses = [
  {
    id: 1,
    title: "Основы растяжки для начинающих",
    description: "Комплексная программа для развития гибкости с нуля",
    image: "/images/trainer-studio.jpg",
    price: 2990,
    originalPrice: 3990,
    rating: 4.9,
    students: 156,
    duration: "4 недели",
    lessons: 16,
    level: "Новичок",
    category: "Растяжка",
    tags: ["Новичок", "Базовый курс", "Гибкость"],
    instructor: "KattyFit",
    features: ["HD видео", "Персональная поддержка", "Сертификат", "Доступ навсегда"],
    discount: 25,
  },
  {
    id: 2,
    title: "Аэройога: полеты в воздухе",
    description: "Изучите основы аэройоги и научитесь красивым элементам",
    image: "/images/trainer-outdoor.jpg",
    price: 4990,
    originalPrice: 6990,
    rating: 4.8,
    students: 89,
    duration: "6 недель",
    lessons: 24,
    level: "Средний",
    category: "Аэройога",
    tags: ["Аэройога", "Воздушные полотна", "Акробатика"],
    instructor: "KattyFit",
    features: ["Профессиональное оборудование", "Техника безопасности", "Прогрессивная программа"],
    discount: 30,
  },
  {
    id: 3,
    title: "Продвинутая растяжка",
    description: "Для тех, кто готов к серьезным вызовам",
    image: "/images/trainer-artistic.jpg",
    price: 3990,
    originalPrice: 4990,
    rating: 5.0,
    students: 67,
    duration: "8 недель",
    lessons: 32,
    level: "Продвинутый",
    category: "Растяжка",
    tags: ["Продвинутый", "Шпагаты", "Мостики"],
    instructor: "KattyFit",
    features: ["Индивидуальные корректировки", "Сложные элементы", "Мастер-классы"],
    discount: 20,
  },
  {
    id: 4,
    title: "Йога для гибкости",
    description: "Сочетание классической йоги и растяжки",
    image: "/images/trainer-studio.jpg",
    price: 2490,
    originalPrice: 2990,
    rating: 4.7,
    students: 203,
    duration: "5 недель",
    lessons: 20,
    level: "Новичок",
    category: "Йога",
    tags: ["Йога", "Медитация", "Гибкость"],
    instructor: "KattyFit",
    features: ["Дыхательные практики", "Медитация", "Философия йоги"],
    discount: 15,
  },
]

const categories = ["Все", "Растяжка", "Аэройога", "Йога"]
const levels = ["Все уровни", "Новичок", "Средний", "Продвинутый"]
const sortOptions = ["По популярности", "По цене (возр.)", "По цене (убыв.)", "По рейтингу"]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Все")
  const [selectedLevel, setSelectedLevel] = useState("Все уровни")
  const [sortBy, setSortBy] = useState("По популярности")
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (courseId: number) => {
    setFavorites((prev) => (prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]))
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Все" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "Все уровни" || course.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Онлайн{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">курсы</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Профессиональные программы тренировок для развития гибкости и силы
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Все курсы</TabsTrigger>
              <TabsTrigger value="popular">Популярные</TabsTrigger>
              <TabsTrigger value="new">Новые</TabsTrigger>
              <TabsTrigger value="free">Бесплатные</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Поиск курсов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white">-{course.discount}%</Badge>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      onClick={() => toggleFavorite(course.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(course.id) ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                      />
                    </Button>
                    <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                      <Play className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.lessons} уроков
                      </div>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>

                  <CardTitle className="text-lg leading-tight mb-2">{course.title}</CardTitle>

                  <CardDescription className="text-sm">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students} учеников
                    </div>
                    <div>by {course.instructor}</div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">{course.price.toLocaleString()} ₽</span>
                      <span className="text-sm text-muted-foreground line-through">
                        {course.originalPrice.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 yoga-gradient text-white"
                      onClick={() => {
                        // Временная заглушка - в реальном приложении добавляем в корзину
                        alert('Курс добавлен в корзину! (Функционал корзины в разработке)')
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />В корзину
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/courses/${course.id}`}>Подробнее</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Загрузить еще курсы
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
