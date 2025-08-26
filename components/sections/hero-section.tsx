"use client"

import { Button } from "@/components/ui/button"
import { Play, Star, Users, Award } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background Placeholder */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/trainer-artistic.jpg" alt="Yoga background" fill className="object-cover" priority />
        <div className="absolute inset-0 video-overlay" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-6">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Сертифицированный тренер
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Растяжка и{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Аэройога
              </span>{" "}
              с KattyFit
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Персональные тренировки и онлайн-курсы для развития гибкости, силы и внутренней гармонии. Начните свой
              путь к здоровому телу уже сегодня!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="yoga-gradient text-white hover:opacity-90">
                Записаться на тренировку
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <Play className="w-5 h-5 mr-2" />
                Смотреть демо
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-8 text-white">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">500+</span>
                </div>
                <p className="text-sm opacity-90">Довольных клиентов</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 mr-2" />
                  <span className="text-2xl font-bold">5</span>
                </div>
                <p className="text-sm opacity-90">Лет опыта</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-2xl font-bold">4.9</span>
                </div>
                <p className="text-sm opacity-90">Рейтинг</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 yoga-gradient rounded-full blur-3xl opacity-30 animate-pulse" />
              <Image
                src="/images/trainer-studio.jpg"
                alt="KattyFit тренер"
                width={400}
                height={500}
                className="relative z-10 rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
