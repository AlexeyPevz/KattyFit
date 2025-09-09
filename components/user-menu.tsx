"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, BookOpen, Calendar } from "lucide-react"

interface UserSession {
  email: string
  name: string
  provider?: string
  loginTime: number
}

export function UserMenu() {
  const [user, setUser] = useState<UserSession | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem("user_session")
      if (sessionData) {
        setUser(JSON.parse(sessionData))
      } else {
        setUser(null)
      }
    }

    checkSession()
    window.addEventListener("storage", checkSession)
    
    return () => {
      window.removeEventListener("storage", checkSession)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user_session")
    setUser(null)
    router.push("/")
  }

  if (!user) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/login">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Мой профиль
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <BookOpen className="mr-2 h-4 w-4" />
            Мои курсы
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/booking">
            <Calendar className="mr-2 h-4 w-4" />
            Записаться
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Настройки
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
