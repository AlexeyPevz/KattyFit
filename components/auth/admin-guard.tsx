"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Public paths that don't require authentication
  const publicPaths = ["/admin/auth", "/admin/quick-access"]

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("admin_session")

        if (!sessionData) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        const session = JSON.parse(sessionData)
        const now = Date.now()

        // Check if session is expired
        if (now > session.expiresAt) {
          localStorage.removeItem("admin_session")
          setIsAuthenticated(false)
          setIsLoading(false)
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

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // If it's a public path, render children directly
  if (publicPaths.includes(pathname)) {
    return <>{children}</>
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/auth"
    }
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
