import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { PWAProvider } from "@/components/pwa-provider"
import dynamic from "next/dynamic"

const ChatWidget = dynamic(
  () => import("@/components/chat/chat-widget").then(mod => mod.ChatWidget),
  { ssr: false }
)

const inter = Inter({ subsets: ["latin", "cyrillic"] })

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
  generator: 'v0.app'
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
