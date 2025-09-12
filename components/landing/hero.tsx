"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Users, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="hero-section">
      {/* Background gradient - оптимизирован для LCP */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20" />
      
      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Text content - критический контент для LCP */}
          <div className="space-y-8 fade-in-up">
            <div className="space-y-4">
              <Badge className="mb-4" variant="secondary">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Топ-тренер по растяжке
              </Badge>
              
              <h1 className="hero-title">
                Достигни гибкости своей мечты с{" "}
                <span className="bg-gradient-to-r from-violet-700 to-pink-700 bg-clip-text text-transparent">
                  KattyFit
                </span>
              </h1>
              
              <p className="hero-subtitle">
                Онлайн-курсы растяжки и аэройоги от сертифицированного тренера. 
                Занимайся в удобное время, достигай результатов быстрее!
              </p>
            </div>

            {/* Stats */}
            <dl className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center space-y-1">
                <dt className="sr-only">Количество учеников</dt>
                <dd className="text-3xl font-bold">1000+</dd>
                <dd className="text-sm text-muted-foreground">Учеников</dd>
              </div>
              <div className="text-center space-y-1">
                <dt className="sr-only">Количество курсов</dt>
                <dd className="text-3xl font-bold">50+</dd>
                <dd className="text-sm text-muted-foreground">Курсов</dd>
              </div>
              <div className="text-center space-y-1">
                <dt className="sr-only">Рейтинг курсов</dt>
                <dd className="text-3xl font-bold">4.9</dd>
                <dd className="text-sm text-muted-foreground">Рейтинг</dd>
              </div>
            </dl>

            {/* CTA buttons - оптимизированы для LCP */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="hero-cta gap-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600" 
                asChild
              >
                <Link href="#courses">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Начать заниматься
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="hero-cta gap-2 focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2" 
                asChild
              >
                <Link href="/booking">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  Записаться на тренировку
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span>Занимаются онлайн</span>
              </div>
              <div className="flex -space-x-2" role="img" aria-label="Аватары учеников">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 border-2 border-background"
                    aria-hidden="true"
                  />
                ))}
                <div className="h-8 px-2 rounded-full bg-muted border-2 border-background flex items-center">
                  <span className="text-xs font-medium">+100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero image/video */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/5] bg-gradient-to-br from-violet-200 to-pink-200 dark:from-violet-800 dark:to-pink-800">
                {/* Placeholder for hero image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-32 w-32 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" aria-hidden="true" />
                    </div>
                    <p className="text-white font-medium">Смотреть видео о курсах</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-violet-200 dark:bg-violet-800 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-pink-200 dark:bg-pink-800 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
