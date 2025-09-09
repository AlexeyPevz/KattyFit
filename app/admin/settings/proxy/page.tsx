"use client"

import { AdminGuard } from "@/components/auth/admin-guard"
import { ProxyManager } from "@/components/admin/proxy/proxy-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Info, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProxySettingsPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/settings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Управление прокси</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Настройка прокси для обхода блокировок:</strong> Система автоматически определяет заблокированные в РФ сервисы 
              и направляет трафик через прокси. Поддерживаются ASOCKS.COM, Beget VPS и другие провайдеры.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Быстрая настройка</CardTitle>
                <CardDescription>
                  Выберите провайдера прокси для быстрой настройки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌐</div>
                      <h3 className="font-semibold mb-2">ASOCKS.COM</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Готовые HTTP/SOCKS прокси. Просто введите данные из личного кабинета.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://asocks.com" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Перейти на сайт
                        </a>
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🖥️</div>
                      <h3 className="font-semibold mb-2">Beget VPS</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Собственный VPS сервер с VPN. Полный контроль над трафиком.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://beget.com/ru/vps" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Заказать VPS
                        </a>
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">⚙️</div>
                      <h3 className="font-semibold mb-2">Другой провайдер</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Настройте любой HTTP/SOCKS прокси с поддержкой аутентификации.
                      </p>
                      <Button variant="outline" size="sm">
                        Настроить вручную
                      </Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <ProxyManager />
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
