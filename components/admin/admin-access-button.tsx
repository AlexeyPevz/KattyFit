"use client"

import { useState } from "react"
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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_authenticated") === "true"
    }
    return false
  })

  const adminUser = isAuthenticated
    ? (() => {
        try {
          const userStr = localStorage.getItem("admin_user")
          return userStr ? JSON.parse(userStr) : null
        } catch {
          return null
        }
      })()
    : null

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_user")
    setIsAuthenticated(false)
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
