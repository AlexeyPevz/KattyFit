"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Users, Clock, Heart } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const achievements = [
  {
    icon: Award,
    title: "Сертификации",
    description: "Международные сертификаты по йоге и растяжке",
  },
  {
    icon: Users,
    title: "500+ клиентов",
    description: "Довольных учеников за 5 лет работы",
  },
  {
    icon: Clock,
    title: "2000+ часов",
    description: "Проведенных персональных тренировок",
  },
  {
    icon: Heart,
    title: "Индивидуальный подход",
    description: "К каждому ученику и его потребностям",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-4">
              О тренере
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Привет! Я{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Катя</span>
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground mb-8">
              <p>
                Профессиональный тренер по растяжке и аэройоге с 5-летним опытом. Моя миссия — помочь каждому человеку
                раскрыть потенциал своего тела и найти гармонию между физическим и духовным развитием.
              </p>
              <p>
                Я верю, что гибкость — это не только физическое качество, но и состояние души. В своих тренировках я
                сочетаю классические техники растяжки с элементами йоги и современными методиками.
              </p>
              <p>
                Каждый ученик уникален, поэтому я разрабатываю индивидуальные программы, учитывающие особенности тела и
                личные цели.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <achievement.icon className="w-8 h-8 text-primary mb-2" />
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/trainer-outdoor.jpg"
                    alt="KattyFit outdoor training"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image src="/images/trainer-studio.jpg" alt="KattyFit studio" fill className="object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <Image src="/images/trainer-artistic.jpg" alt="KattyFit artistic" fill className="object-cover" />
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden yoga-gradient flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-2xl font-bold mb-2">@kattyFit_bgd</h3>
                    <p className="text-white/90">Следите за новостями в Telegram</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
