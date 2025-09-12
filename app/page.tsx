"use client"

import { Suspense, lazy, useEffect } from "react"
import { trackPageView } from "@/lib/analytics"

// Критические компоненты - загружаются сразу для LCP
import { Hero } from "@/components/landing/hero"
import { Navbar } from "@/components/landing/navbar"

// Не-критические компоненты - lazy loading для оптимизации
const CourseGrid = lazy(() => import("@/components/landing/course-grid").then(m => ({ default: m.CourseGrid })))
const AboutTrainer = lazy(() => import("@/components/landing/about-trainer").then(m => ({ default: m.AboutTrainer })))
const Testimonials = lazy(() => import("@/components/landing/testimonials").then(m => ({ default: m.Testimonials })))
const CTASection = lazy(() => import("@/components/landing/cta-section").then(m => ({ default: m.CTASection })))
const Footer = lazy(() => import("@/components/landing/footer").then(m => ({ default: m.Footer })))

// Компонент загрузки для Suspense
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  )
}

export default function HomePage() {
  useEffect(() => {
    trackPageView("home")
  }, [])
  
  return (
    <div className="min-h-screen">
      {/* Критические компоненты для LCP */}
      <Navbar />
      <Hero />
      
      {/* Не-критические компоненты с lazy loading */}
      <Suspense fallback={<LoadingFallback />}>
        <CourseGrid />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <AboutTrainer />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <CTASection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
  )
}
