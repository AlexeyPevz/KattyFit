import { HeroSection } from "@/components/sections/hero-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AboutSection } from "@/components/sections/about-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { CTASection } from "@/components/sections/cta-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <CTASection />

        {/* Скрытая кнопка админки - появляется при двойном клике на логотип */}
        <div className="fixed bottom-4 right-4 z-50">
          <Link href="/admin/quick-access">
            <Button
              variant="outline"
              size="sm"
              className="opacity-20 hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
