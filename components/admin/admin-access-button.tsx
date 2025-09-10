"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, Shield, LogIn, User, BarChart3 } from "lucide-react"

export function AdminAccessButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = () => {
        try {
          const sessionData = localStorage.getItem("admin_session")
          if (!sessionData) {
            setIsAuthenticated(false)
            return
          }

          const session = JSON.parse(sessionData)
          const now = Date.now()

          // Check if session is expired
          if (now > session.expiresAt) {
            localStorage.removeItem("admin_session")
            setIsAuthenticated(false)
            return
          }

          // Check if username matches expected admin username
          // В production это должно быть из переменных окружения
          const expectedUser = "KattyFit"
          if (session.username === expectedUser) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error("Auth check error:", error)
          localStorage.removeItem("admin_session")
          setIsAuthenticated(false)
        }
      }

      checkAuth()
    }
  }, [])

  const adminUser = isAuthenticated
    ? (() => {
        try {
          const sessionData = localStorage.getItem("admin_session")
          if (sessionData) {
            const session = JSON.parse(sessionData)
            return { username: session.username }
          }
          return null
        } catch {
          return null
        }
      })()
    : null

  const handleLogout = async () => {
    // Call API to logout and clear cookie
    await fetch("/api/admin/auth", {
      method: "DELETE",
    })
    
    // Clear localStorage
    localStorage.removeItem("admin_session")
    setIsAuthenticated(false)
    
    // Redirect to login page
    window.location.href = "/admin/auth"
  }

  if (isAuthenticated && adminUser) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">{adminUser.username}</span>
            <Badge variant="secondary" className="text-xs">
              Admin
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{adminUser.username}</p>
            <p className="text-xs text-muted-foreground">Администратор</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Панель управления
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/courses/builder" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Конструктор курсов
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/clients" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              CRM клиентов
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogIn className="mr-2 h-4 w-4" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Link href="/admin/auth">
      <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
        <Settings className="h-4 w-4" />
        <span className="hidden md:inline">Админ</span>
      </Button>
    </Link>
  )
}
