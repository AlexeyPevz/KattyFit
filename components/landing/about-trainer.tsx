"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Award, 
  Calendar, 
  Users, 
  Star,
  CheckCircle2,
  Instagram,
  Youtube
} from "lucide-react"

const achievements = [
  "Сертифицированный тренер по растяжке и йоге",
  "Более 5 лет опыта преподавания",
  "Автор уникальных методик растяжки",
  "Победитель чемпионатов по воздушной гимнастике",
  "Обучила более 1000 учеников онлайн",
  "Регулярные мастер-классы и воркшопы"
]

const stats = [
  { icon: Calendar, value: "5+", label: "Лет опыта" },
  { icon: Users, value: "1000+", label: "Учеников" },
  { icon: Award, value: "50+", label: "Курсов" },
  { icon: Star, value: "4.9", label: "Рейтинг" },
]

export function AboutTrainer() {
  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800">
              {/* Placeholder for trainer photo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <div className="h-32 w-32 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur" />
                  <p className="text-xl font-medium">Фото тренера</p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-violet-200 dark:bg-violet-800 blur-2xl opacity-50" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-pink-200 dark:bg-pink-800 blur-2xl opacity-50" />
            
            {/* Social proof */}
            <Card className="absolute -bottom-6 -right-6 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 border-2 border-background"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">1000+ учеников</p>
                    <p className="text-muted-foreground">по всему миру</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-2">
                О тренере
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold">
                Екатерина - ваш проводник в мир гибкости
              </h2>
              
              <p className="text-lg text-muted-foreground">
                Привет! Я Катя, сертифицированный тренер по растяжке, йоге и аэройоге. 
                Моя миссия - помочь каждому обрести гибкость, здоровье и уверенность в себе.
              </p>
              
              <p className="text-muted-foreground">
                За годы практики я разработала уникальные методики, которые помогают 
                достигать результатов быстрее и безопаснее. Мои ученики садятся на шпагат, 
                избавляются от болей в спине и обретают легкость движений.
              </p>
            </div>

            {/* Achievements */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 py-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg">
                Записаться на консультацию
              </Button>
              <div className="flex gap-2">
                <Button size="lg" variant="outline" className="gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
