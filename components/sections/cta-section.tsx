"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Gift, ArrowRight, Phone, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 yoga-gradient opacity-10" />

      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm">
              <Gift className="w-4 h-4 mr-2" />
              Специальное предложение
            </Badge>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Начните свой путь к{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                гибкости
              </span>{" "}
              уже сегодня!
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Получите бесплатную консультацию и скидку 20% на первый курс. Ограниченное предложение для новых учеников!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="flex gap-2">
              <Input placeholder="Введите ваш email" className="flex-1" />
              <Button className="yoga-gradient text-white">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button size="lg" className="yoga-gradient text-white">
              <Phone className="w-5 h-5 mr-2" />
              Записаться на консультацию
            </Button>
            <Button size="lg" variant="outline">
              <MessageCircle className="w-5 h-5 mr-2" />
              Написать в Telegram
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Поддержка учеников</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Гарантия результата</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">30 дней</div>
              <p className="text-muted-foreground">Возврат средств</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
