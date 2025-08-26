"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Анна Петрова",
    role: "Офис-менеджер",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Катя — потрясающий тренер! За 3 месяца занятий я стала намного гибче и увереннее в себе. Персональный подход и профессионализм на высшем уровне.",
    beforeAfter: {
      before: "/placeholder.svg?height=200&width=150",
      after: "/placeholder.svg?height=200&width=150",
    },
  },
  {
    id: 2,
    name: "Мария Сидорова",
    role: "Дизайнер",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Аэройога с Катей — это что-то невероятное! Никогда не думала, что смогу делать такие элементы. Теперь это моя любимая тренировка.",
    beforeAfter: {
      before: "/placeholder.svg?height=200&width=150",
      after: "/placeholder.svg?height=200&width=150",
    },
  },
  {
    id: 3,
    name: "Елена Козлова",
    role: "Предприниматель",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    text: "Онлайн-курсы Кати помогли мне заниматься в удобное время. Качество видео отличное, объяснения понятные. Рекомендую всем!",
    beforeAfter: {
      before: "/placeholder.svg?height=200&width=150",
      after: "/placeholder.svg?height=200&width=150",
    },
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Отзывы клиентов
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Истории{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              трансформации
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Реальные результаты наших учеников говорят сами за себя
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-semibold">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <div className="relative mb-6">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                    <p className="text-muted-foreground italic pl-6">{testimonial.text}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">До</p>
                      <div className="relative h-24 rounded-lg overflow-hidden">
                        <Image
                          src={testimonial.beforeAfter.before || "/placeholder.svg"}
                          alt="До тренировок"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-2">После</p>
                      <div className="relative h-24 rounded-lg overflow-hidden">
                        <Image
                          src={testimonial.beforeAfter.after || "/placeholder.svg"}
                          alt="После тренировок"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
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
