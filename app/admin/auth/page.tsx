"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminAuthPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const next = sp.get("next") || "/admin"

  useEffect(() => {
    // if already authed, go next
    if (document.cookie.includes("admin_auth=")) {
      router.replace(next)
    }
  }, [next])

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      if (res.ok) {
        router.replace(next)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Вход в админ-панель</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={handleLogin} className="w-full" disabled={loading || !username || !password}>
            {loading ? "Входим..." : "Войти"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (username === "KattyFit" && password === "BestTrainer") {
      // Create session data
      const sessionData = {
        username: "KattyFit",
        loginTime: Date.now(),
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      }

      localStorage.setItem("admin_session", JSON.stringify(sessionData))

      // Force redirect to admin panel
      window.location.href = "/admin"
    } else {
      setError("Неверный логин или пароль")
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
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Тестовые данные:</p>
            <p>
              Логин: <strong>KattyFit</strong>
            </p>
            <p>
              Пароль: <strong>BestTrainer</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
