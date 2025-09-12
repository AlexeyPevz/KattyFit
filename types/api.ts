// Строгие типы для API контрактов
// Основа для всех остальных исправлений

// ===== БАЗОВЫЕ ТИПЫ =====

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// ===== АУТЕНТИФИКАЦИЯ =====

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin' | 'trainer'
  createdAt: string
  lastLoginAt?: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
  refreshToken?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AdminCredentials {
  username: string
  password: string
}

// ===== ЧАТ И RAG =====

export interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  sender: 'user' | 'assistant' | 'system'
  platform: 'web' | 'telegram' | 'vk' | 'whatsapp'
  metadata?: Record<string, unknown>
}

export interface RAGContext {
  userMessage: string
  chatHistory: ChatMessage[]
  platform: string
  userName?: string
  userContext: UserContext
  conversationId?: string
}

export interface UserContext {
  userId?: string
  preferences?: Record<string, unknown>
  location?: GeoLocation
  deviceInfo?: DeviceInfo
  knowledge?: KnowledgeItem[]
}

export interface GeoLocation {
  latitude: number
  longitude: number
  city?: string
  country?: string
  timezone?: string
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  os: string
  browser: string
  userAgent: string
}

export interface KnowledgeItem {
  id: string
  type: 'faq' | 'dialog_example' | 'course_info' | 'pricing'
  question: string
  answer: string
  context?: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ===== КУРСЫ И ОБУЧЕНИЕ =====

export interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  price: number
  duration: number // в минутах
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  modules: CourseModule[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CourseModule {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  content: LessonContent
  duration: number // в минутах
  order: number
  isCompleted: boolean
  completedAt?: string
}

export interface LessonContent {
  videoUrl?: string
  text?: string
  quiz?: Quiz
  assignment?: Assignment
}

export interface Quiz {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  instructions: string
  dueDate?: string
  maxScore: number
}

// ===== БРОНИРОВАНИЯ =====

export interface Booking {
  id: string
  userId: string
  trainerId: string
  serviceType: string
  bookingDate: string
  bookingTime: string
  duration: number // в минутах
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  price: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TrainerSchedule {
  id: string
  trainerId: string
  workDays: number[] // 0-6 (воскресенье-суббота)
  workHours: {
    start: string // HH:MM
    end: string // HH:MM
  }
  slotDuration: number // в минутах
  breakDuration: number // в минутах
  unavailableDates: string[] // YYYY-MM-DD
}

// ===== CRM И ЛИДЫ =====

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

// ===== ПЛАТЕЖИ =====

export interface Payment {
  id: string
  transactionId: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  description?: string
  metadata?: Record<string, unknown>
  paidAt?: string
  createdAt: string
}

export interface Promocode {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxUses?: number
  usedCount: number
  isActive: boolean
  validFrom: string
  validUntil: string
  createdAt: string
}

// ===== КОНТЕНТ И МЕДИА =====

export interface Content {
  id: string
  title: string
  description: string
  type: 'short' | 'lesson'
  status: 'draft' | 'processing' | 'published'
  filename?: string
  originalName?: string
  size?: number
  mimeType?: string
  platform?: string
  videoId?: string
  url?: string
  embedUrl?: string
  duration?: number
  languages: string[]
  targetLanguages: string[]
  platforms: string[]
  views: number
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

export interface VideoUploadResult {
  platform: string
  success: boolean
  videoId?: string
  url?: string
  embedUrl?: string
  error?: string
}

// ===== ИНТЕГРАЦИИ =====

export interface Integration {
  id: string
  service: string
  name: string
  icon: string
  requiresOAuth: boolean
  requiresBusinessAccount?: boolean
  connected: boolean
  hasApiKey: boolean
  config?: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  service: string
  keyName: string
  keyValue: string
  isActive: boolean
  createdAt: string
}

// ===== ПРОКСИ =====

export interface ProxyConfig {
  id: string
  name: string
  type: 'asocks' | 'beget' | 'custom'
  host: string
  port: number
  username?: string
  password?: string
  isActive: boolean
  priority: number
  allowedServices: string[]
  healthCheckUrl?: string
  lastChecked?: string
  isHealthy?: boolean
  responseTime?: number
}

export interface ProxyRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: string | FormData | Record<string, unknown>
  timeout?: number
}

export interface ProxyResponse {
  success: boolean
  data?: unknown
  error?: string
  proxyUsed?: string
  responseTime?: number
}

// ===== НАСТРОЙКИ =====

export interface AppSettings {
  general: {
    siteName: string
    siteDescription: string
    timezone: string
    language: string
  }
  payments: {
    testMode: boolean
    currency: string
    taxRate: number
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  integrations: {
    [key: string]: boolean
  }
}

// ===== АНАЛИТИКА =====

export interface AnalyticsEvent {
  id: string
  eventType: string
  eventData: Record<string, unknown>
  userId?: string
  sessionId?: string
  platform: string
  userAgent: string
  ipAddress?: string
  createdAt: string
}

export interface AnalyticsData {
  revenue: {
    today: number
    week: number
    month: number
    growth: number
  }
  users: {
    total: number
    new: number
    active: number
    growth: number
  }
  courses: {
    total: number
    published: number
    sold: number
  }
  bookings: {
    total: number
    confirmed: number
    pending: number
  }
}

// ===== УТИЛИТЫ =====

export type Status = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Platform = 'web' | 'mobile' | 'telegram' | 'vk' | 'whatsapp'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FilterOptions {
  search?: string
  status?: Status
  platform?: Platform
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

// ===== ВАЛИДАЦИЯ =====

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// ===== КОНФИГУРАЦИЯ =====

export interface ConfigStatus {
  isConfigured: boolean
  missingVars: string[]
  warnings: string[]
  recommendations: string[]
}

export interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  admin: {
    username: string
    password: string
    usernamePublic: string
  }
  ai: {
    yandexGpt?: {
      apiKey: string
      folderId: string
    }
    openai?: {
      apiKey: string
    }
  }
  payments: {
    cloudPayments?: {
      publicId: string
      secret: string
    }
  }
  integrations: {
    vk?: {
      apiToken: string
      groupId: string
    }
    telegram?: {
      botToken: string
    }
  }
}