"use client"

import { CRMDashboardComponent } from "@/components/admin/crm/crm-dashboard"
import { Lead, CRMStats } from "@/components/admin/crm/types"

// Mock data for development
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Иван Петров",
    email: "ivan@example.com",
    phone: "+7 (999) 123-45-67",
    source: "website",
    stage: "new",
    value: 50000,
    tags: ["VIP", "Горячий"],
    notes: "Заинтересован в курсе по React",
    metadata: {},
    score: 85,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Мария Сидорова",
    email: "maria@example.com",
    phone: "+7 (999) 234-56-78",
    source: "instagram",
    stage: "contacted",
    value: 30000,
    tags: ["Повторный"],
    notes: "Уже была клиентом, интересуется новыми курсами",
    metadata: {},
    score: 70,
    createdAt: "2024-01-14T14:30:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
    lastContact: "2024-01-16T09:15:00Z"
  },
  {
    id: "3",
    name: "Алексей Козлов",
    email: "alex@example.com",
    phone: "+7 (999) 345-67-89",
    source: "vk",
    stage: "qualified",
    value: 75000,
    tags: ["Корпоративный"],
    notes: "Представитель IT-компании, интересуется корпоративным обучением",
    metadata: {},
    score: 95,
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-17T11:20:00Z",
    lastContact: "2024-01-17T11:20:00Z"
  }
]

const mockStats: CRMStats = {
  totalLeads: 156,
  newLeads: 23,
  qualifiedLeads: 45,
  customers: 88,
  conversionRate: 56.4,
  averageValue: 45000,
  monthlyGrowth: 12.5
}

export default function CRMPage() {
  return (
    <CRMDashboardComponent 
      initialLeads={mockLeads}
      initialStats={mockStats}
    />
  )
}
