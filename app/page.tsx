"use client"

import { Hero } from "@/components/landing/hero"
import { CourseGrid } from "@/components/landing/course-grid"
import { AboutTrainer } from "@/components/landing/about-trainer"
import { Testimonials } from "@/components/landing/testimonials"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/landing/navbar"

import { useEffect } from "react"
import { trackPageView } from "@/lib/analytics"

export default function HomePage() {
  useEffect(() => {
    trackPageView("home")
  }, [])
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <CourseGrid />
      <AboutTrainer />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  )
}
