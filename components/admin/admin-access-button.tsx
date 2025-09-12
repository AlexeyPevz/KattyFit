"use client"

import { useState, useEffect } from "react"
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
import { env } from "@/lib/env"
import logger from "@/lib/logger"

export function AdminAccessButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkAuth = () => {
        try {
          const sessionData = localStorage.getItem("admin_session")
          if (!sessionData) {
            logger.debug("AdminAccessButton: No session data found")
            setIsAuthenticated(false)
            return
          }

          const session = JSON.parse(sessionData)
          const now = Date.now()

          // Check if session is expired
          if (now > session.expiresAt) {
            logger.debug("AdminAccessButton: Session expired")
            localStorage.removeItem("admin_session")
            setIsAuthenticated(false)
            return
          }

          // Check if username matches expected admin username
          const expectedUser = process.env.ADMIN_USERNAME
          logger.debug("AdminAccessButton auth check", {
            sessionUsername: session.username,
            expectedUser: expectedUser,
            match: session.username === expectedUser
          })
          
          if (session.username === expectedUser) {
            logger.debug("AdminAccessButton: Authentication successful")
            setIsAuthenticated(true)
          } else {
            logger.debug("AdminAccessButton: Username mismatch")
            setIsAuthenticated(false)
          }
        } catch (error) {
          logger.error("Auth check error", { error: error instanceof Error ? error.message : String(error) })
          localStorage.removeItem("admin_session")
          setIsAuthenticated(false)
        }
      }

      // Small delay to ensure localStorage is available
      const timeoutId = setTimeout(checkAuth, 100)
      
      // Also listen for storage changes to update auth state
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "admin_session") {
          checkAuth()
        }
      }
      
      window.addEventListener("storage", handleStorageChange)
      
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener("storage", handleStorageChange)
      }
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
    
    // Force page reload to clear all state
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
          <DropdownMenuItem onClick={() => window.location.href = "/admin"}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Панель управления
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = "/admin/courses/builder"}>
            <Settings className="mr-2 h-4 w-4" />
            Конструктор курсов
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = "/admin/clients"}>
            <User className="mr-2 h-4 w-4" />
            CRM клиентов
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
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center space-x-2 bg-transparent"
      onClick={() => {
        window.location.href = "/admin/auth"
      }}
    >
      <Settings className="h-4 w-4" />
      <span className="hidden md:inline">Админ</span>
    </Button>
  )
}
