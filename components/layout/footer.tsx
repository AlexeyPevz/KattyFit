import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Instagram, Youtube, Phone, Mail, MapPin, Send } from "lucide-react"

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
              <Button variant="outline" size="icon" asChild>
                <a href="https://instagram.com/kattyfit" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://tiktok.com/@kattyfit" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://youtube.com/@kattyfit" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://vk.com/kattyfit" target="_blank" rel="noopener noreferrer" aria-label="VKontakte">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.717-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.030-2.763-5.304-2.763-5.771 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.61 2.18-3.61.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.745-.576.745z"/>
                  </svg>
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="https://t.me/kattyfit" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                  <Send className="h-4 w-4" />
                </a>
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
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-muted-foreground text-sm">© 2025 KattyFit. Все права защищены.</p>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              Разработка: 
              <a href="https://t.me/alex_dmr" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                <Send className="h-3 w-3" />
                @alex_dmr
              </a>
            </p>
          </div>
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
