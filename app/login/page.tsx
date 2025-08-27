"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Mail, 
  Lock, 
  LogIn,
  UserPlus,
  Phone,
  MessageSquare
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Временная заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: isRegister ? "Регистрация успешна!" : "Вход выполнен!",
        description: "Добро пожаловать в KattyFit"
      })
      
      // Сохраняем в localStorage для демо
      localStorage.setItem("user_session", JSON.stringify({
        email,
        name: email.split("@")[0],
        loginTime: Date.now()
      }))
      
      router.push("/profile")
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось войти. Попробуйте еще раз.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    
    try {
      // В реальном приложении здесь будет OAuth flow
      toast({
        title: "Вход через " + provider,
        description: "Перенаправление на страницу авторизации..."
      })
      
      // Имитация OAuth
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      localStorage.setItem("user_session", JSON.stringify({
        email: `user@${provider}.com`,
        name: `Пользователь ${provider}`,
        provider,
        loginTime: Date.now()
      }))
      
      router.push("/profile")
    } catch (error) {
      toast({
        title: "Ошибка",
        description: `Не удалось войти через ${provider}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isRegister ? "Регистрация" : "Вход в KattyFit"}
          </CardTitle>
          <CardDescription>
            {isRegister 
              ? "Создайте аккаунт для доступа к тренировкам"
              : "Войдите, чтобы продолжить занятия"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Социальные кнопки */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => handleSocialLogin("VKontakte")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.071.587-.964c-.043-.073-.308-.661-1.588-1.87-1.34-1.264-1.16-1.059.453-3.246.983-1.332 1.376-2.145 1.253-2.493-.117-.332-.84-.244-.84-.244l-2.406.015s-.178-.025-.31.056c-.13.079-.212.262-.212.262s-.382 1.03-.89 1.907c-1.07 1.85-1.499 1.948-1.674 1.832-.407-.267-.305-1.075-.305-1.648 0-1.793.267-2.54-.521-2.733-.262-.065-.454-.107-1.123-.114-.858-.009-1.585.003-1.996.208-.274.136-.485.44-.356.457.159.022.519.099.71.364.246.342.237 1.113.237 1.113s.142 2.12-.33 2.383c-.326.18-.772-.188-1.731-1.865-.49-.858-.86-1.807-.86-1.807s-.07-.177-.198-.272c-.155-.115-.372-.151-.372-.151l-2.286.015s-.343.01-.469.161c-.112.135-.009.414-.009.414s1.792 4.266 3.817 6.413c1.858 1.97 3.968 1.84 3.968 1.84h.957z"/>
              </svg>
              Войти через VKontakte
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => handleSocialLogin("Telegram")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.27-1.13 7.75-1.6 10.29-.2 1.08-.59 1.44-.97 1.47-.82.07-1.45-.54-2.24-1.06-1.24-.82-1.95-1.33-3.15-2.13-1.39-.92-.49-1.43.3-2.26.21-.22 3.77-3.46 3.84-3.76.01-.04.01-.17-.06-.25s-.18-.05-.26-.03c-.11.03-1.79 1.14-5.06 3.35-.48.33-.91.49-1.3.49-.43 0-1.25-.13-1.86-.24-.75-.14-1.35-.21-1.3-.45.03-.13.32-.26.89-.4 3.5-.86 5.83-1.43 6.99-1.71 3.33-.8 4.02-.84 4.47-.84.1 0 .32.01.46.11.12.08.15.19.17.28-.01.06.01.24 0 .38z"/>
              </svg>
              Войти через Telegram
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => handleSocialLogin("Яндекс")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.682 21.928v-7.305l2.64 7.305h2.094V7.85h-1.932v7.522L15.9 7.85h-2.218v14.078h1.999zm-4.368-5.733h-1.54c-1.297 0-1.865-.653-1.865-1.646 0-1.045.71-1.67 1.716-1.67h1.69v3.316zm0 1.581v4.152h2.026V12.38c0-2.585-1.2-4.615-4.53-4.615-.833 0-1.753.197-2.218.341v1.756c.465-.145 1.379-.29 2.122-.29 1.875 0 2.6.797 2.6 2.516v.531h-1.788c-2.669 0-3.923 1.376-3.923 3.315 0 1.978 1.297 3.329 3.32 3.329h.023c.986 0 1.787-.339 2.368-.967v.63z"/>
              </svg>
              Войти через Яндекс
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              или
            </span>
          </div>

          {/* Форма входа */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Загрузка..." : (
                <>
                  {isRegister ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Зарегистрироваться
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Войти
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            {isRegister ? (
              <>
                Уже есть аккаунт?{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Войти
                </button>
              </>
            ) : (
              <>
                Нет аккаунта?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Зарегистрироваться
                </button>
              </>
            )}
          </div>

          <Alert className="text-sm">
            <Phone className="h-4 w-4" />
            <AlertDescription>
              Возникли проблемы со входом?{" "}
              <Link href="/contact" className="font-medium underline">
                Свяжитесь с нами
              </Link>
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  )
}