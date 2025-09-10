"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

export default function AdminAuthPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get("next") || "/admin"
    }
    return "/admin"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Call API to authenticate
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Include cookies
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Save to localStorage for client-side state
        const sessionData = {
          username: username,
          expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
        }
        console.log("AdminAuth: Saving session data:", sessionData)
        localStorage.setItem("admin_session", JSON.stringify(sessionData))
        
        // Show success message
        setError("")
        
        // Redirect to intended page or admin panel
        const redirectUrl = getRedirectUrl()
        console.log("AdminAuth: Redirecting to:", redirectUrl)
        router.push(redirectUrl)
      } else if (response.status === 429) {
        setError("Слишком много попыток входа. Попробуйте через 15 минут.")
      } else if (response.status === 400) {
        setError(data.details || "Проверьте правильность введенных данных")
      } else if (response.status === 500) {
        setError(data.details || "Ошибка конфигурации сервера. Обратитесь к администратору.")
      } else {
        setError(data.error || "Неверный логин или пароль")
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof Error) {
        setError(`Ошибка: ${error.message}`)
      } else {
        setError("Ошибка при входе. Проверьте подключение к интернету.")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Админ-панель</CardTitle>
          <CardDescription>Войдите в систему управления KattyFit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
