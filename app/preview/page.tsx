// Server Component версия для v0 preview
// Этот файл используется v0 для отображения превью
import { Hero } from "@/components/landing/hero"
import { Navbar } from "@/components/landing/navbar"
import { CourseGrid } from "@/components/landing/course-grid"
import { AboutTrainer } from "@/components/landing/about-trainer"
import { Testimonials } from "@/components/landing/testimonials"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export const metadata = {
  title: 'KattyFit - Preview',
  description: 'AI-powered content creation and management platform - Preview for v0',
}

export default function PreviewPage() {
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