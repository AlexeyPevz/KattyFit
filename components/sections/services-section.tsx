"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Users, Clock, Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const services = [
  {
    id: 1,
    title: "Онлайн курсы",
    description: "Структурированные программы для самостоятельного изучения",
    image: "/images/trainer-artistic.jpg",
    price: "от 2,990 ₽",
    duration: "4-8 недель",
    students: "150+",
    rating: 4.9,
    features: ["HD видео-уроки", "Персональная поддержка", "Сертификат"],
    gradient: "yoga-gradient",
  },
  {
    id: 2,
    title: "Персональные тренировки",
    description: "Индивидуальные занятия с персональным подходом",
    image: "/images/trainer-studio.jpg",
    price: "от 3,500 ₽",
    duration: "60 мин",
    students: "1:1",
    rating: 5.0,
    features: ["Индивидуальная программа", "Онлайн/офлайн", "Гибкий график"],
    gradient: "stretch-gradient",
  },
  {
    id: 3,
    title: "Аэройога",
    description: "Уникальные занятия в воздушных полотнах",
    image: "/images/trainer-outdoor.jpg",
    price: "от 2,500 ₽",
    duration: "90 мин",
    students: "2-6",
    rating: 4.8,
    features: ["Групповые занятия", "Все уровни", "Оборудование включено"],
    gradient: "wellness-gradient",
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Наши услуги
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Выберите свой путь к{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              совершенству
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Профессиональные программы тренировок для любого уровня подготовки
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 ${service.gradient} opacity-20`} />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-black">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {service.rating}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <span className="text-lg font-bold text-primary">{service.price}</span>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {service.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {service.students}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Подробнее</Button>
                    <Button variant="outline" size="icon">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
