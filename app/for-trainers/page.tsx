import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Users, Zap, Globe, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ForTrainersPage() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Все клиенты в одном месте",
      description: "CRM система для управления клиентами, записями и платежами"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
      title: "AI-ассистент 24/7",
      description: "Автоматические ответы в Telegram, Instagram, VK и WhatsApp"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "Автопостинг контента",
      description: "Публикация во все соцсети одной кнопкой через ContentStudio"
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "Мультиязычность",
      description: "Автоматический дубляж видео на 10 языков для международной аудитории"
    }
  ]

  const results = [
    { metric: "Экономия времени", value: "15+ часов в неделю" },
    { metric: "Рост конверсии", value: "до 40%" },
    { metric: "Увеличение охвата", value: "в 3-5 раз" },
    { metric: "Рост дохода", value: "от 30%" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container px-4 py-16 text-center">
        <Badge className="mb-4" variant="secondary">
          Специальное предложение от KattyFit
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Платформа автоматизации для фитнес-тренеров
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Освободите время для тренировок, пока AI работает с клиентами, 
          а система публикует контент во все соцсети автоматически
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
            Получить демо-доступ
          </Button>
          <Button size="lg" variant="outline">
            Посмотреть как работает Катя
          </Button>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container px-4 py-8">
        <Card className="max-w-2xl mx-auto border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <img 
                src="/katty-avatar.jpg" 
                alt="KattyFit" 
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold">Катя @kattyfit_bgd</h3>
                <p className="text-sm text-muted-foreground">
                  "Эта платформа изменила мой бизнес! Теперь я провожу на 70% больше 
                  тренировок, а клиенты получают ответы мгновенно"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Что вы получаете
        </h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  {feature.icon}
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="container px-4 py-16 bg-purple-50 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Результаты наших клиентов
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {results.map((result, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {result.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {result.metric}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container px-4 py-16">
        <Card className="max-w-2xl mx-auto border-purple-200">
          <CardHeader className="text-center">
            <Badge className="w-fit mx-auto mb-4" variant="destructive">
              Скидка 20% по промокоду KATTYFIT
            </Badge>
            <CardTitle className="text-3xl">Специальная цена для подписчиков Кати</CardTitle>
            <CardDescription className="text-lg mt-2">
              Полный доступ ко всем функциям платформы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold">
                <span className="line-through text-muted-foreground text-3xl">₽9,900</span>
                {" "}₽7,900
              </div>
              <div className="text-muted-foreground">в месяц</div>
            </div>
            <div className="space-y-2">
              {[
                "Неограниченное количество клиентов",
                "AI-ассистент на всех платформах",
                "Автопостинг во все соцсети",
                "Дубляж видео на 10 языков",
                "CRM и аналитика",
                "Техническая поддержка 24/7"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Начать бесплатный период (14 дней)
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Без привязки карты • Отмена в любой момент
            </p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Частые вопросы
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Нужны ли технические знания?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Нет! Платформа создана для тренеров. Всё интуитивно понятно, 
              а мы поможем с настройкой и проведем обучение.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Сколько времени займет настройка?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>От 30 минут до 2 часов. Мы поможем подключить ваши соцсети и 
              настроить AI-ассистента под ваши задачи.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Можно ли протестировать бесплатно?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Да! 14 дней полного доступа без ограничений и без привязки карты. 
              Посмотрите, как это работает у Кати.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-16">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Готовы автоматизировать свой фитнес-бизнес?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Присоединяйтесь к Кате и другим успешным тренерам
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="font-bold"
            >
              Начать бесплатно с промокодом KATTYFIT
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container px-4 py-8 text-center text-muted-foreground">
        <p>Разработано с ❤️ для фитнес-тренеров</p>
        <p className="mt-2">
          <Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link>
          {" • "}
          <Link href="/terms" className="hover:underline">Условия использования</Link>
        </p>
      </footer>
    </div>
  )
}