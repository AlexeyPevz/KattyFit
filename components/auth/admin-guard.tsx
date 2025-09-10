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
        console.log("AdminGuard: Checking auth, sessionData:", sessionData)

        if (!sessionData) {
          console.log("AdminGuard: No session data found")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        const session = JSON.parse(sessionData)
        const now = Date.now()
        console.log("AdminGuard: Session data:", session, "Current time:", now, "Expires at:", session.expiresAt)

        // Check if session is expired
        if (now > session.expiresAt) {
          console.log("AdminGuard: Session expired")
          localStorage.removeItem("admin_session")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        // Check if username matches expected admin username
        const expectedUser = env.adminUsername
        console.log("AdminGuard: Expected user:", expectedUser, "Session user:", session.username)
        if (session.username === expectedUser) {
          console.log("AdminGuard: Authentication successful")
          setIsAuthenticated(true)
        } else {
          console.log("AdminGuard: Username mismatch")
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("AdminGuard: Auth check error:", error)
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
    // Only redirect if we're not already on the auth page
    if (pathname !== "/admin/auth") {
      router.push("/admin/auth")
    }
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
