import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "KattyFit - Админ панель",
  description: "Панель управления фитнес-платформой KattyFit",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
