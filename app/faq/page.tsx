"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, CreditCard, Calendar, Award, Shield, Heart } from "lucide-react"
import { useState } from "react"

const faqCategories = [
  {
    id: "general",
    title: "Общие вопросы",
    icon: MessageCircle,
    questions: [
      {
        question: "Что такое KattyFit?",
        answer: "KattyFit - это онлайн-платформа для тренировок по растяжке, аэройоге и фитнесу. Мы предлагаем видеокурсы, персональные тренировки и групповые занятия с профессиональным тренером."
      },
      {
        question: "Как начать заниматься?",
        answer: "Для начала занятий вам нужно зарегистрироваться на сайте, выбрать подходящий курс или записаться на тренировку. После оплаты вы получите доступ к материалам курса или ссылку на онлайн-занятие."
      },
      {
        question: "Нужна ли специальная подготовка?",
        answer: "Для большинства курсов специальная подготовка не требуется. Мы предлагаем программы для разных уровней - от начинающих до продвинутых. В описании каждого курса указан рекомендуемый уровень подготовки."
      },
      {
        question: "Какое оборудование понадобится?",
        answer: "Для базовых тренировок достаточно коврика для йоги. Для некоторых курсов могут понадобиться дополнительные аксессуары: блоки для йоги, ремни, фитбол. Для аэройоги необходимы специальные полотна."
      }
    ]
  },
  {
    id: "payment",
    title: "Оплата и возврат",
    icon: CreditCard,
    questions: [
      {
        question: "Какие способы оплаты доступны?",
        answer: "Мы принимаем оплату банковскими картами (Visa, MasterCard, МИР), через электронные кошельки (Яндекс.Деньги, QIWI), а также через системы быстрых платежей."
      },
      {
        question: "Можно ли вернуть деньги за курс?",
        answer: "Да, мы предоставляем гарантию возврата денег в течение 14 дней с момента покупки, если вы прошли менее 20% курса. Для возврата обратитесь в службу поддержки."
      },
      {
        question: "Есть ли рассрочка?",
        answer: "Да, для курсов стоимостью от 5000 рублей доступна рассрочка на 3-6 месяцев без процентов через наших партнеров."
      },
      {
        question: "Действуют ли скидки?",
        answer: "Мы регулярно проводим акции и предоставляем скидки для постоянных клиентов. Подпишитесь на нашу рассылку, чтобы не пропустить выгодные предложения."
      }
    ]
  },
  {
    id: "schedule",
    title: "Расписание и записи",
    icon: Calendar,
    questions: [
      {
        question: "Как записаться на тренировку?",
        answer: "Перейдите в раздел 'Запись на тренировку', выберите удобное время и тип занятия, оплатите и получите подтверждение с ссылкой на онлайн-встречу."
      },
      {
        question: "Можно ли перенести занятие?",
        answer: "Да, вы можете перенести занятие не позднее чем за 24 часа до его начала. Для этого свяжитесь с нами через личный кабинет или мессенджер."
      },
      {
        question: "Что если я опоздаю на занятие?",
        answer: "Мы рекомендуем подключаться за 5-10 минут до начала. Если вы опоздали, можете присоединиться в любой момент, но старайтесь не нарушать ход занятия."
      },
      {
        question: "Записываются ли тренировки?",
        answer: "Персональные тренировки записываются по вашему желанию. Групповые занятия обычно не записываются из соображений приватности участников."
      }
    ]
  },
  {
    id: "courses",
    title: "О курсах",
    icon: Award,
    questions: [
      {
        question: "Как долго доступен курс после покупки?",
        answer: "После покупки курс доступен вам навсегда. Вы можете проходить его в удобном темпе и возвращаться к урокам в любое время."
      },
      {
        question: "Можно ли скачать видео?",
        answer: "Видео доступны только для онлайн-просмотра в целях защиты авторских прав. Однако вы можете скачать дополнительные материалы: планы тренировок, чек-листы."
      },
      {
        question: "Есть ли обратная связь от тренера?",
        answer: "В премиум-курсах предусмотрена проверка домашних заданий и обратная связь от тренера. В базовых курсах вы можете задавать вопросы в комментариях."
      },
      {
        question: "Выдается ли сертификат?",
        answer: "Да, после успешного прохождения курса и выполнения всех заданий вы получите именной сертификат о прохождении."
      }
    ]
  },
  {
    id: "safety",
    title: "Безопасность и здоровье",
    icon: Shield,
    questions: [
      {
        question: "Есть ли противопоказания для занятий?",
        answer: "Перед началом занятий рекомендуем проконсультироваться с врачом, особенно при наличии хронических заболеваний, травм или в период беременности."
      },
      {
        question: "Что делать, если появилась боль?",
        answer: "При появлении боли немедленно прекратите выполнение упражнения. Легкий дискомфорт при растяжке нормален, но острая боль - сигнал остановиться."
      },
      {
        question: "Как избежать травм?",
        answer: "Всегда начинайте с разминки, следуйте инструкциям тренера, не форсируйте события. Прогресс в растяжке требует времени и регулярности."
      },
      {
        question: "Можно ли заниматься во время беременности?",
        answer: "Мы предлагаем специальные программы для беременных. Обязательно получите разрешение врача и предупредите тренера о вашем положении."
      }
    ]
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredQuestions = faqCategories
    .filter(category => selectedCategory === "all" || category.id === selectedCategory)
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 py-8 mt-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Часто задаваемые вопросы
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Найдите ответы на популярные вопросы о наших услугах и тренировках
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Все вопросы
          </button>
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.title}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {filteredQuestions.map((category) => (
            <div key={category.id} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <category.icon className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-semibold">{category.title}</h2>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-muted/30 rounded-lg p-8">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Не нашли ответ на свой вопрос?</h3>
          <p className="text-muted-foreground mb-6">
            Свяжитесь с нами, и мы с радостью поможем вам
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/kattyfit"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Написать в Telegram
            </a>
            <a
              href="mailto:info@kattyfit.ru"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Отправить email
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}