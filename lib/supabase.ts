import { createClient } from '@supabase/supabase-js'

// Эти переменные должны быть установлены в переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для таблиц Supabase
export interface ContentRow {
  id: string
  title: string
  description?: string
  type: 'short' | 'lesson'
  status: 'draft' | 'processing' | 'published'
  filename?: string
  original_name?: string
  size?: number
  mime_type?: string
  platform?: string
  video_id?: string
  url?: string
  embed_url?: string
  duration?: number
  languages: string[]
  target_languages: string[]
  platforms: string[]
  views: number
  thumbnail?: string
  created_at: string
  updated_at: string
}

export interface PublicationRow {
  id: string
  content_id: string
  platform: string
  language: string
  status: 'pending' | 'processing' | 'published' | 'failed'
  url?: string
  scheduled_at?: string
  published_at?: string
  error?: string
  created_at: string
}

export interface IntegrationRow {
  id: string
  service: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ThumbnailRow {
  id: string
  content_id: string
  language: string
  url: string
  type: 'generated' | 'custom'
  created_at: string
}