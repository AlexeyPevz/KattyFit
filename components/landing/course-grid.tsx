"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  Users, 
  Star, 
  Search,
  Filter,
  Play,
  ShoppingCart,
  Sparkles
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  price: number
  oldPrice?: number
  duration: string
  students: number
  rating: number
  level: "beginner" | "intermediate" | "advanced"
  category: string
  isNew?: boolean
  isBestseller?: boolean
}

// Моковые данные курсов
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Растяжка для начинающих",
    description: "Базовый курс для тех, кто хочет стать гибким с нуля. Пошаговая программа на 30 дней.",
    thumbnail: "/api/placeholder/400/300",
    price: 2990,
    oldPrice: 4990,
    duration: "30 дней",
    students: 523,
    rating: 4.9,
    level: "beginner",
    category: "stretching",
    isBestseller: true,
  },
  {
    id: "2",
    title: "Шпагат за 60 дней",
    description: "Интенсивная программа для достижения продольного и поперечного шпагата.",
    thumbnail: "/api/placeholder/400/300",
    price: 3990,
    duration: "60 дней",
    students: 412,
    rating: 4.8,
    level: "intermediate",
    category: "stretching",
    isNew: true,
  },
  {
    id: "3",
    title: "Аэройога: Первые полеты",
    description: "Откройте для себя мир воздушной йоги. Безопасно и эффективно.",
    thumbnail: "/api/placeholder/400/300",
    price: 4990,
    duration: "8 недель",
    students: 189,
    rating: 5.0,
    level: "beginner",
    category: "aerial",
    isNew: true,
  },
  {
    id: "4",
    title: "Гибкая спина",
    description: "Специальный курс для здоровья позвоночника и красивой осанки.",
    thumbnail: "/api/placeholder/400/300",
    price: 2490,
    duration: "4 недели",
    students: 667,
    rating: 4.9,
    level: "beginner",
    category: "health",
    isBestseller: true,
  },
  {
    id: "5",
    title: "Продвинутая растяжка",
    description: "Для тех, кто уже гибкий и хочет достичь новых высот.",
    thumbnail: "/api/placeholder/400/300",
    price: 5990,
    duration: "12 недель",
    students: 234,
    rating: 4.7,
    level: "advanced",
    category: "stretching",
  },
  {
    id: "6",
    title: "Утренняя йога",
    description: "15-минутные практики для бодрого начала дня.",
    thumbnail: "/api/placeholder/400/300",
    price: 1990,
    oldPrice: 2990,
    duration: "30 дней",
    students: 891,
    rating: 4.8,
    level: "beginner",
    category: "yoga",
  },
]

const categories = [
  { value: "all", label: "Все курсы" },
  { value: "stretching", label: "Растяжка" },
  { value: "aerial", label: "Аэройога" },
  { value: "yoga", label: "Йога" },
  { value: "health", label: "Здоровье" },
]

const levels = [
  { value: "all", label: "Любой уровень" },
  { value: "beginner", label: "Начинающий" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
]

export function CourseGrid() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "students":
        return b.students - a.students
      default:
        return 0
    }
  })

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "beginner":
        return "secondary"
      case "intermediate":
        return "default"
      case "advanced":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Начинающий"
      case "intermediate":
        return "Средний"
      case "advanced":
        return "Продвинутый"
      default:
        return level
    }
  }

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Выберите свой курс
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Программы для любого уровня подготовки. Занимайтесь в удобном темпе и достигайте результатов.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск курсов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Популярные</SelectItem>
                <SelectItem value="price-low">Сначала дешевые</SelectItem>
                <SelectItem value="price-high">Сначала дорогие</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="students">По количеству учеников</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCourses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                  {course.isNew && (
                    <Badge className="absolute top-4 left-4 gap-1" variant="secondary">
                      <Sparkles className="h-3 w-3" />
                      Новинка
                    </Badge>
                  )}
                  {course.isBestseller && (
                    <Badge className="absolute top-4 right-4" variant="default">
                      Бестселлер
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={getLevelBadgeVariant(course.level)}>
                    {getLevelLabel(course.level)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    {course.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {course.oldPrice} ₽
                      </span>
                    )}
                    <p className="text-2xl font-bold">
                      {course.price} ₽
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/courses/${course.id}`}>
                    Подробнее
                  </Link>
                </Button>
                <Button variant="outline" size="icon">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {sortedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Курсы не найдены. Попробуйте изменить фильтры.</p>
          </div>
        )}
      </div>
    </section>
  )
}
