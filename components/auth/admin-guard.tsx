"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { env } from "@/lib/env"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Public paths that don't require authentication
  const publicPaths = ["/admin/auth", "/admin/quick-access"]

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("admin_session")

        if (!sessionData) {
          console.log("AdminGuard: No session data found")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        const session = JSON.parse(sessionData)
        const now = Date.now()

        // Check if session is expired
        if (now > session.expiresAt) {
          console.log("AdminGuard: Session expired")
          localStorage.removeItem("admin_session")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Check if username matches expected admin username
        const expectedUser = env.adminUsernamePublic
        console.log("AdminGuard auth check:", {
          sessionUsername: session.username,
          expectedUser: expectedUser,
          match: session.username === expectedUser
        })
        
        if (session.username === expectedUser) {
          console.log("AdminGuard: Authentication successful")
          setIsAuthenticated(true)
        } else {
          console.log("AdminGuard: Username mismatch")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("admin_session")
        setIsAuthenticated(false)
      }

      setIsLoading(false)
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
  }, [pathname])

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
    // Only redirect if we're not already on the auth page
    if (pathname !== "/admin/auth") {
      console.log("AdminGuard: Redirecting to auth page from", pathname)
      // Use window.location for more reliable redirect
      window.location.href = "/admin/auth"
    }
    // Don't render anything if not authenticated
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
