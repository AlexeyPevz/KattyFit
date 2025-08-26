export interface Content {
  id: string
  title: string
  description?: string
  type: "short" | "lesson"
  status: "draft" | "processing" | "published"
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
  thumbnail?: string | null
  createdAt: string
  updatedAt: string
}

export interface PublishTask {
  id: string
  contentId: string
  platform: string
  language: string
  status: "pending" | "processing" | "published" | "failed"
  url?: string
  scheduledAt?: string
  publishedAt?: string
  error?: string
  createdAt: string
}

export interface Platform {
  id: string
  name: string
  icon?: string
  color: string
  available: boolean
  requiresOAuth?: boolean
  requiresBusinessAccount?: boolean
  authUrl?: string
  maxVideoSize?: number
  maxDuration?: number
  supportedFormats?: string[]
}

export interface Language {
  code: string
  name: string
  flag: string
}

export interface ThumbnailTemplate {
  id: string
  name: string
  colors: string[]
}

export interface Integration {
  id: string
  name: string
  icon: string
  color: string
  connected: boolean
  requiresOAuth: boolean
  requiresBusinessAccount?: boolean
  setupGuide?: string
  clientIdRequired?: boolean
  clientSecretRequired?: boolean
  apiKeyRequired?: boolean
}