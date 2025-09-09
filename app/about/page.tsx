"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, Clock, Star, Heart, Trophy, Target, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const achievements = [
  {
    icon: Award,
    title: "Сертифицированный тренер",
    description: "Международные сертификаты по йоге и растяжке"
  },
  {
    icon: Users,
    title: "1000+ учеников",
    description: "Помогла достичь гибкости тысячам людей"
  },
  {
    icon: Clock,
    title: "10+ лет опыта",
    description: "Профессиональный опыт в фитнесе и йоге"
  },
  {
    icon: Star,
    title: "4.9 рейтинг",
    description: "Средняя оценка от учеников"
  }
]

const certifications = [
  "Yoga Alliance RYT-500",
  "Аэройога инструктор",
  "Спортивная растяжка",
  "Функциональный тренинг",
  "Пилатес инструктор",
  "Детский фитнес"
]

const values = [
  {
    icon: Heart,
    title: "Индивидуальный подход",
    description: "Каждый ученик уникален, поэтому я создаю персональные программы с учетом особенностей и целей"
  },
  {
    icon: Trophy,
    title: "Результат превыше всего",
    description: "Моя цель - помочь вам достичь желаемой гибкости безопасно и эффективно"
  },
  {
    icon: Target,
    title: "Постоянное развитие",
    description: "Регулярно обучаюсь новым методикам и совершенствую свои навыки"
  },
  {
    icon: Sparkles,
    title: "Позитивная атмосфера",
    description: "Создаю комфортную среду, где каждый чувствует поддержку и мотивацию"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Привет! Я{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KattyFit
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Сертифицированный тренер по растяжке и аэройоге с более чем 10-летним опытом
            </p>
            <p className="text-muted-foreground mb-8">
              Моя миссия - сделать гибкость доступной каждому. Я верю, что с правильным подходом 
              и регулярными тренировками любой человек может достичь удивительных результатов, 
              независимо от возраста и начального уровня подготовки.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="yoga-gradient text-white" size="lg" asChild>
                <Link href="/booking">Записаться на тренировку</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/courses">Смотреть курсы</Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/images/trainer-studio.jpg"
                alt="KattyFit"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-full p-6 shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm">лет опыта</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Достижения и опыт</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <achievement.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Моя история</h2>
              <p className="text-muted-foreground">
                Мой путь в мир фитнеса начался более 10 лет назад, когда я сама столкнулась 
                с проблемами гибкости и осанки. Долгие часы за компьютером привели к болям 
                в спине и ощущению скованности во всем теле.
              </p>
              <p className="text-muted-foreground">
                Начав заниматься растяжкой и йогой, я не только избавилась от болей, 
                но и открыла для себя удивительный мир возможностей своего тела. 
                Это вдохновило меня получить профессиональное образование и помогать 
                другим людям на их пути к здоровью и гибкости.
              </p>
              <p className="text-muted-foreground">
                За годы практики я разработала авторские методики, которые помогают 
                достигать результатов быстрее и безопаснее. Мои ученики садятся на шпагат, 
                встают на мостик и выполняют сложные элементы аэройоги, о которых раньше 
                только мечтали.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Image
                src="/images/trainer-outdoor.jpg"
                alt="Тренировка на природе"
                width={300}
                height={400}
                className="rounded-lg object-cover h-full"
              />
              <Image
                src="/images/trainer-artistic.jpg"
                alt="Художественная растяжка"
                width={300}
                height={400}
                className="rounded-lg object-cover h-full"
              />
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Сертификаты и образование</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {certifications.map((cert) => (
              <Badge key={cert} variant="outline" className="px-4 py-2 text-base">
                {cert}
              </Badge>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Мои принципы работы</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <value.icon className="w-8 h-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-muted/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Готовы начать свой путь к гибкости?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к моим тренировкам и откройте новые возможности своего тела
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="yoga-gradient text-white" size="lg" asChild>
              <Link href="/booking">Записаться на пробное занятие</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="https://t.me/kattyfit">Задать вопрос в Telegram</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
