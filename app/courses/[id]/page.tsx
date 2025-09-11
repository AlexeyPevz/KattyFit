"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  CheckCircle2,
  Lock,
  Video,
  FileText,
  Download,
  Shield,
  RefreshCw,
  Sparkles
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Детальная информация о курсе (в реальном приложении загружается из БД)
const courseDetails = {
  id: "1",
  title: "Растяжка для начинающих",
  description: "Базовый курс для тех, кто хочет стать гибким с нуля. Пошаговая программа на 30 дней с детальными объяснениями каждого упражнения.",
  price: 2990,
  oldPrice: 4990,
  thumbnail: "/api/placeholder/1200/600",
  duration: "30 дней",
  totalVideos: 35,
  totalHours: "10 часов",
  students: 523,
  rating: 4.9,
  reviewsCount: 127,
  level: "beginner",
  lastUpdated: "Декабрь 2023",
  
  benefits: [
    "Пошаговая программа от простого к сложному",
    "35 видеоуроков с детальными объяснениями",
    "Доступ к курсу навсегда",
    "Поддержка тренера в чате",
    "Сертификат по окончании",
    "Гарантия возврата 14 дней"
  ],
  
  requirements: [
    "Коврик для йоги",
    "Удобная одежда",
    "30 минут в день",
    "Желание стать гибким"
  ],
  
  modules: [
    {
      id: "1",
      title: "Введение и разминка",
      lessons: 5,
      duration: "1.5 часа",
      items: [
        { title: "Приветствие и знакомство", duration: "5:30", isPreview: true },
        { title: "Техника безопасности", duration: "8:15", isPreview: true },
        { title: "Базовая разминка", duration: "15:00", isPreview: false },
        { title: "Дыхательные практики", duration: "12:45", isPreview: false },
        { title: "Первая диагностика гибкости", duration: "10:00", isPreview: false },
      ]
    },
    {
      id: "2", 
      title: "Работа с ногами",
      lessons: 8,
      duration: "2.5 часа",
      items: [
        { title: "Растяжка икроножных мышц", duration: "12:00", isPreview: false },
        { title: "Работа с бедрами", duration: "15:30", isPreview: false },
        { title: "Подготовка к продольному шпагату", duration: "20:00", isPreview: false },
        { title: "Упражнения у стены", duration: "18:00", isPreview: false },
      ]
    },
    {
      id: "3",
      title: "Гибкость спины",
      lessons: 7,
      duration: "2 часа",
      items: [
        { title: "Мягкие прогибы", duration: "14:00", isPreview: false },
        { title: "Скручивания позвоночника", duration: "16:30", isPreview: false },
        { title: "Упражнения для поясницы", duration: "12:00", isPreview: false },
      ]
    },
    {
      id: "4",
      title: "Комплексная растяжка",
      lessons: 10,
      duration: "3 часа", 
      items: [
        { title: "Утренний комплекс", duration: "20:00", isPreview: false },
        { title: "Вечерняя растяжка", duration: "25:00", isPreview: false },
        { title: "Интенсивная практика", duration: "30:00", isPreview: false },
      ]
    },
    {
      id: "5",
      title: "Закрепление результатов",
      lessons: 5,
      duration: "1 час",
      items: [
        { title: "Контрольная диагностика", duration: "15:00", isPreview: false },
        { title: "План дальнейших тренировок", duration: "10:00", isPreview: false },
        { title: "Заключительное слово", duration: "5:00", isPreview: false },
      ]
    }
  ],
  
  reviews: [
    {
      id: "1",
      name: "Анна П.",
      rating: 5,
      date: "2 недели назад",
      text: "Отличный курс для новичков! Все очень понятно объясняется, прогресс виден уже через неделю."
    },
    {
      id: "2", 
      name: "Мария И.",
      rating: 5,
      date: "1 месяц назад",
      text: "Наконец-то я начала заниматься растяжкой правильно. Спасибо за подробные объяснения!"
    },
    {
      id: "3",
      name: "Елена С.", 
      rating: 4,
      date: "2 месяца назад",
      text: "Хороший курс, но хотелось бы больше упражнений для рук. В остальном все супер!"
    }
  ]
}

export default function CoursePage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("program")
  const [showPreview, setShowPreview] = useState(false)
  
  // В реальном приложении здесь будет загрузка данных курса по ID
  const course = courseDetails

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Главная
            </Link>
            <span>/</span>
            <Link href="/#courses" className="hover:text-foreground transition-colors">
              Курсы
            </Link>
            <span>/</span>
            <span className="text-foreground">{course.title}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Preview */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800 relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" variant="secondary" className="gap-2 group-hover:scale-110 transition-transform" onClick={() => setShowPreview(true)}>
                    <Play className="h-5 w-5" />
                    Смотреть превью
                  </Button>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
                  <Badge variant="secondary">
                    {course.level === "beginner" ? "Начинающий" : 
                     course.level === "intermediate" ? "Средний" : "Продвинутый"}
                  </Badge>
                </div>
                
                <p className="text-lg text-muted-foreground">{course.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-muted-foreground">({course.reviewsCount} отзывов)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{course.students} учеников</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <span>Обновлено {course.lastUpdated}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button asChild size="lg">
                    <Link href={`/checkout/course/${course.id}`}>Купить курс</Link>
                  </Button>
                  <Button variant="outline" size="lg">Бесплатный урок</Button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="program">Программа</TabsTrigger>
                  <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                <TabsContent value="program" className="space-y-6 mt-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Что вы получите</h2>
                    <div className="grid gap-3">
                      {course.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Программа курса</h2>
                    <Accordion type="single" collapsible className="w-full">
                      {course.modules.map((module) => (
                        <AccordionItem key={module.id} value={module.id}>
                          <AccordionTrigger>
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="font-medium">{module.title}</span>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{module.lessons} уроков</span>
                                <span>{module.duration}</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {module.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-muted/50">
                                  <div className="flex items-center gap-3">
                                    {item.isPreview ? (
                                      <Play className="h-4 w-4 text-primary" />
                                    ) : (
                                      <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm">{item.title}</span>
                                    {item.isPreview && (
                                      <Badge variant="secondary" className="text-xs">
                                        Бесплатно
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-sm text-muted-foreground">{item.duration}</span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Что понадобится</h2>
                    <div className="grid gap-2">
                      {course.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    {course.reviews.map((review) => (
                      <Card key={review.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">{review.name}</p>
                              <p className="text-sm text-muted-foreground">{review.date}</p>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="faq" className="space-y-6 mt-6">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="1">
                      <AccordionTrigger>Как долго у меня будет доступ к курсу?</AccordionTrigger>
                      <AccordionContent>
                        Доступ к курсу предоставляется навсегда. Вы сможете проходить уроки в любое удобное время и возвращаться к ним снова и снова.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="2">
                      <AccordionTrigger>Нужна ли специальная подготовка?</AccordionTrigger>
                      <AccordionContent>
                        Нет, курс создан специально для начинающих. Мы начнем с самых базовых упражнений и постепенно будем увеличивать нагрузку.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="3">
                      <AccordionTrigger>Что если у меня не получится?</AccordionTrigger>
                      <AccordionContent>
                        У вас обязательно получится! Я буду поддерживать вас на каждом этапе. Если в течение 14 дней вы поймете, что курс вам не подходит, я верну деньги.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="4">
                      <AccordionTrigger>Как проходит обучение?</AccordionTrigger>
                      <AccordionContent>
                        После оплаты вы получаете доступ к личному кабинету с видеоуроками. Занимайтесь в удобном темпе, задавайте вопросы в чате поддержки.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-24 space-y-6 h-fit">
              {/* Price Card */}
              <Card>
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {course.oldPrice && (
                        <span className="text-2xl text-muted-foreground line-through">
                          {course.oldPrice} ₽
                        </span>
                      )}
                      <Badge variant="destructive">
                        -40%
                      </Badge>
                    </div>
                    <p className="text-4xl font-bold">{course.price} ₽</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    asChild 
                    className="w-full" 
                    size="lg"
                  >
                    <Link href={`/checkout/course/${course.id}`}>
                      Купить курс
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    Подарить курс
                  </Button>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span>{course.totalVideos} видеоуроков</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.totalHours} видео</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Дополнительные материалы</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span>Доступ навсегда</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Shield className="h-4 w-4" />
                      <span>Безопасная оплата</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <RefreshCw className="h-4 w-4" />
                      <span>Гарантия возврата 14 дней</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trainer Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">О тренере</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                    <div>
                      <p className="font-semibold">Екатерина</p>
                      <p className="text-sm text-muted-foreground">Тренер по растяжке</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Сертифицированный тренер с опытом более 5 лет. Помогу вам стать гибкими и здоровыми!
                  </p>
                  <Button variant="outline" className="w-full" size="sm">
                    Все курсы тренера
                  </Button>
                </CardContent>
              </Card>

              {/* Gift Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <p className="font-semibold mb-2">Подарите курс</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Отличный подарок для близких
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Оформить подарок
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Превью курса</DialogTitle>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button asChild>
              <Link href={`/checkout/course/${course.id}`}>Купить курс</Link>
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
