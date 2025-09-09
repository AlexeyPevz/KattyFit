"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Анна Петрова",
    course: "Шпагат за 60 дней",
    text: "Никогда не думала, что смогу сесть на шпагат в 35 лет! Катя - потрясающий тренер, объясняет каждое движение, следит за техникой. За 2 месяца достигла своей мечты!",
    rating: 5,
    avatar: "АП",
    date: "2 недели назад"
  },
  {
    id: 2,
    name: "Мария Иванова", 
    course: "Гибкая спина",
    text: "Прошла курс для спины - забыла о болях! Раньше к вечеру спина просто отваливалась от офисной работы. Теперь чувствую себя легко весь день. Спасибо огромное!",
    rating: 5,
    avatar: "МИ",
    date: "1 месяц назад"
  },
  {
    id: 3,
    name: "Елена Сидорова",
    course: "Аэройога: Первые полеты",
    text: "Аэройога - это нечто невероятное! Боялась высоты, но Катя так мягко и постепенно все объясняет, что страх ушел с первого занятия. Теперь летаю как птичка!",
    rating: 5,
    avatar: "ЕС",
    date: "3 недели назад"
  },
  {
    id: 4,
    name: "Ольга Козлова",
    course: "Растяжка для начинающих",
    text: "Начинала с полного нуля, была деревянная как столб. Катя подбирает упражнения индивидуально, всегда на связи, отвечает на вопросы. Прогресс виден уже через неделю!",
    rating: 5,
    avatar: "ОК",
    date: "1 неделя назад"
  },
  {
    id: 5,
    name: "Светлана Морозова",
    course: "Утренняя йога",
    text: "15 минут утром полностью изменили мой день! Просыпаюсь с радостью, зная что меня ждет приятная практика. Катя заряжает позитивом на весь день!",
    rating: 5,
    avatar: "СМ",
    date: "2 месяца назад"
  },
  {
    id: 6,
    name: "Татьяна Волкова",
    course: "Продвинутая растяжка",
    text: "Занималась растяжкой сама несколько лет, но с Катей вышла на новый уровень. Такие фишки показывает, о которых я даже не знала! Супер-профессионал!",
    rating: 5,
    avatar: "ТВ",
    date: "1 месяц назад"
  }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Отзывы учеников
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Более 1000 человек уже достигли своих целей. Присоединяйтесь!
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-muted-foreground/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Text */}
                <p className="text-muted-foreground mb-6 line-clamp-4">
                  "{testimonial.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.course} • {testimonial.date}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold mb-2">4.9/5</p>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground">Средний рейтинг курсов</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold mb-2">98%</p>
              <p className="text-muted-foreground">Учеников рекомендуют курсы друзьям</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-bold mb-2">1000+</p>
              <p className="text-muted-foreground">Довольных учеников по всему миру</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
