import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./critical.css"
import "./layout-shift-prevention.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PWAProvider } from "@/components/pwa-provider"
import { ChatWidget } from "@/components/chat/chat-widget"

// Оптимизация шрифтов для LCP
const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

export const metadata: Metadata = {
  title: "KattyFit - Растяжка и Аэройога",
  description: "Персональные тренировки по растяжке и аэройоге с профессиональным тренером",
  keywords: "растяжка, аэройога, фитнес, тренер, персональные тренировки, онлайн курсы",
  authors: [{ name: "KattyFit", url: "https://t.me/kattyFit_bgd" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KattyFit",
  },
  generator: 'v0.app',
  // Оптимизация для Core Web Vitals
  other: {
    'theme-color': '#8b5cf6',
    'msapplication-TileColor': '#8b5cf6',
    'msapplication-config': '/browserconfig.xml'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Критический CSS inline для LCP оптимизации */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS inline для above-the-fold контента */
            *{box-sizing:border-box}
            html{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
            body{margin:0;padding:0;background-color:#ffffff;color:#1a1a1a}
            .hero-section{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center;padding:2rem 1rem}
            .hero-title{font-size:clamp(2.5rem,5vw,4rem);font-weight:700;margin:0 0 1rem 0;line-height:1.2}
            .hero-subtitle{font-size:clamp(1.125rem,2.5vw,1.5rem);margin:0 0 2rem 0;opacity:0.9;max-width:600px}
            .hero-cta{display:inline-block;background:#ff6b6b;color:white;padding:1rem 2rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:1.125rem;transition:transform 0.2s ease}
            .hero-cta:hover{transform:translateY(-2px)}
            .navbar{position:fixed;top:0;left:0;right:0;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(0,0,0,0.1);z-index:1000;padding:1rem 0}
            .nav-container{max-width:1200px;margin:0 auto;padding:0 1rem;display:flex;justify-content:space-between;align-items:center}
            .nav-logo{font-size:1.5rem;font-weight:700;color:#333;text-decoration:none}
            .nav-menu{display:flex;list-style:none;margin:0;padding:0;gap:2rem}
            .nav-link{color:#333;text-decoration:none;font-weight:500;transition:color 0.2s ease}
            .nav-link:hover{color:#667eea}
            @media (max-width:768px){.nav-menu{display:none}.hero-title{font-size:2.5rem}.hero-subtitle{font-size:1.125rem}.hero-cta{padding:0.875rem 1.5rem;font-size:1rem}}
          `
        }} />
        
        {/* Ресурсные подсказки для LCP оптимизации */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preload критических ресурсов */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Prefetch следующих страниц */}
        <link rel="prefetch" href="/courses" />
        <link rel="prefetch" href="/booking" />
        <link rel="prefetch" href="/about" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PWAProvider>
            {children}
            <ChatWidget />
            <Toaster />
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
