import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Instagram, MessageCircle, Youtube, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full yoga-gradient flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KattyFit
              </span>
            </div>
            <p className="text-muted-foreground">
              Профессиональные тренировки по растяжке и аэройоге для здорового образа жизни
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Быстрые ссылки</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors">
                Курсы
              </Link>
              <Link href="/booking" className="text-muted-foreground hover:text-primary transition-colors">
                Запись на тренировку
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Личный кабинет
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                О тренере
              </Link>

              {/* Добавить ссылку на админку */}
              <Link href="/admin/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Админ-панель
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Услуги</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Персональные тренировки
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Групповые занятия
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Онлайн курсы
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Аэройога
              </Link>
            </nav>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Контакты</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+7 (999) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@kattyfit.ru</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Москва, Россия</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Новости и акции</h4>
              <div className="flex gap-2">
                <Input placeholder="Email" className="flex-1" />
                <Button size="sm" className="yoga-gradient text-white">
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">© 2024 KattyFit. Все права защищены.</p>
          <nav className="flex space-x-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Условия использования
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
