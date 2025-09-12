// Типы для CRM компонентов
// Централизованные типы для всех CRM-связанных компонентов

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  source: 'website' | 'instagram' | 'vk' | 'telegram' | 'referral'
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'customer'
  value: number
  tags: string[]
  notes: string
  metadata: Record<string, unknown>
  score: number
  lastContact?: string
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  id: string
  leadId: string
  type: 'created' | 'contact' | 'email' | 'call' | 'meeting' | 'note'
  description: string
  source?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface CRMStats {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  customers: number
  conversionRate: number
  averageValue: number
  monthlyGrowth: number
}

export interface LeadFilters {
  search: string
  stage: string
  source: string
  dateFrom: string
  dateTo: string
  tags: string[]
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  source: string
  stage: string
  value: number
  tags: string[]
  notes: string
}

export interface CRMViewMode {
  type: 'list' | 'kanban' | 'calendar'
  sortBy: 'name' | 'createdAt' | 'value' | 'score'
  sortOrder: 'asc' | 'desc'
}
