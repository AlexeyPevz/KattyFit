import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Instagram, 
  Youtube, 
  Send, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Facebook,
  Twitter
} from "lucide-react"

const footerLinks = {
  courses: [
    { label: "Растяжка для начинающих", href: "/courses/1" },
    { label: "Шпагат за 60 дней", href: "/courses/2" },
    { label: "Аэройога", href: "/courses/3" },
    { label: "Все курсы", href: "/#courses" },
  ],
  company: [
    { label: "О тренере", href: "/#about" },
    { label: "Отзывы", href: "/#testimonials" },
    { label: "Блог", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Политика конфиденциальности", href: "/privacy" },
    { label: "Пользовательское соглашение", href: "/terms" },
    { label: "Возврат средств", href: "/refund" },
    { label: "Оферта", href: "/offer" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                KattyFit
              </span>
            </Link>
            <p className="text-muted-foreground">
              Ваш путь к гибкости и здоровью. Онлайн-курсы и персональные тренировки 
              от сертифицированного тренера.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Подпишитесь на рассылку</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Ваш email" 
                  className="max-w-[250px]"
                />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Получайте полезные материалы и скидки первыми
              </p>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              <a href="https://instagram.com/kattyfit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Instagram className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://youtube.com/@kattyfit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Youtube className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://t.me/kattyfit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://facebook.com/kattyfit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://twitter.com/kattyfit" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Курсы</h3>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Компания</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="tel:+79991234567"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +7 (999) 123-45-67
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@kattyfit.ru"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  info@kattyfit.ru
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Москва, Россия
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 KattyFit. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Сделано с <Heart className="h-3 w-3 fill-current text-red-500" /> для KattyFit
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Разработчик:</span>
                <a href="https://t.me/alex_dmr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <Send className="h-3 w-3" />
                  <span>Связаться</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}