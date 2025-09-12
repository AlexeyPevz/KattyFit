// Централизованное управление переменными окружения
// Строгая типизация и валидация для v0

import { EnvironmentConfig } from '@/types/api'
import { AppError, ErrorCode, ErrorSeverity } from '@/types/errors'

// ===== УТИЛИТЫ ДЛЯ V0 =====

function getEnvVar(name: string): string | undefined {
  if (typeof process === 'undefined') return undefined
  return process.env[name]
}

function requireEnv(name: string): string {
  const value = getEnvVar(name)
  if (!value || value.length === 0) {
    // В v0 переменные могут быть не установлены во время билда
    if (typeof window === 'undefined') {
      throw new AppError(
        `Missing required environment variable: ${name}. Please configure it in v0 Environment Variables.`,
        ErrorCode.MISSING_ENV_VAR,
        500,
        ErrorSeverity.CRITICAL,
        { variable: name }
      )
    }
    // На клиенте возвращаем пустую строку для graceful degradation
    return ''
  }
  return value
}

function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return getEnvVar(name) || defaultValue
}

function getBooleanEnv(name: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(name)
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

function getNumberEnv(name: string, defaultValue: number = 0): number {
  const value = getEnvVar(name)
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

function getArrayEnv(name: string, separator: string = ','): string[] {
  const value = getEnvVar(name)
  if (!value) return []
  return value.split(separator).map(item => item.trim()).filter(Boolean)
}

// ===== КОНФИГУРАЦИЯ =====

export const env: EnvironmentConfig = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  
  admin: {
    username: requireEnv('ADMIN_USERNAME'),
    password: requireEnv('ADMIN_PASSWORD'),
    usernamePublic: getOptionalEnv('NEXT_PUBLIC_ADMIN_USERNAME'),
  },
  
  ai: {
    yandexGpt: getEnvVar('YANDEXGPT_API_KEY') ? {
      apiKey: getEnvVar('YANDEXGPT_API_KEY')!,
      folderId: getEnvVar('YANDEXGPT_FOLDER_ID') || '',
    } : undefined,
    
    openai: getEnvVar('OPENAI_API_KEY') ? {
      apiKey: getEnvVar('OPENAI_API_KEY')!,
    } : undefined,
  },
  
  payments: {
    cloudPayments: (getEnvVar('NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID') && getEnvVar('CLOUDPAYMENTS_SECRET')) ? {
      publicId: getEnvVar('NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID')!,
      secret: getEnvVar('CLOUDPAYMENTS_SECRET')!,
    } : undefined,
  },
  
  integrations: {
    vk: getEnvVar('VK_API_TOKEN') ? {
      apiToken: getEnvVar('VK_API_TOKEN')!,
      groupId: getEnvVar('VK_GROUP_ID') || '',
    } : undefined,
    
    telegram: getEnvVar('TELEGRAM_BOT_TOKEN') ? {
      botToken: getEnvVar('TELEGRAM_BOT_TOKEN')!,
    } : undefined,
  },
}

// ===== ДОПОЛНИТЕЛЬНЫЕ ПЕРЕМЕННЫЕ =====

export const additionalEnv = {
  // Общие настройки
  appUrl: getOptionalEnv('NEXT_PUBLIC_APP_URL'),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
  
  // AI сервисы
  elevenLabsApiKey: getOptionalEnv('ELEVENLABS_API_KEY'),
  contentStudioApiKey: getOptionalEnv('CONTENTSTUDIO_API_KEY'),
  
  // Платежи
  metaWebhookToken: getOptionalEnv('META_WEBHOOK_TOKEN'),
  
  // HLS и видео
  hlsAllowedHosts: getArrayEnv('HLS_ALLOWED_HOSTS'),
  hlsJwtSecret: getOptionalEnv('HLS_JWT_SECRET'),
  
  // Supabase Storage
  storageBucket: getOptionalEnv('SUPABASE_STORAGE_BUCKET', 'content'),
  
  // Push уведомления
  vapidPublicKey: getOptionalEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY'),
  vapidPrivateKey: getOptionalEnv('VAPID_PRIVATE_KEY'),
  
  // Прокси
  asocksHost: getOptionalEnv('ASOCKS_HOST'),
  asocksPort: getNumberEnv('ASOCKS_PORT'),
  asocksUsername: getOptionalEnv('ASOCKS_USERNAME'),
  asocksPassword: getOptionalEnv('ASOCKS_PASSWORD'),
  
  begetProxyHost: getOptionalEnv('BEGET_PROXY_HOST'),
  begetProxyPort: getNumberEnv('BEGET_PROXY_PORT'),
  begetProxyApiKey: getOptionalEnv('BEGET_PROXY_API_KEY'),
  
  customProxyHost: getOptionalEnv('CUSTOM_PROXY_HOST'),
  customProxyPort: getNumberEnv('CUSTOM_PROXY_PORT'),
  customProxyUsername: getOptionalEnv('CUSTOM_PROXY_USERNAME'),
  customProxyPassword: getOptionalEnv('CUSTOM_PROXY_PASSWORD'),
  
  // WhatsApp
  waPhoneNumberId: getOptionalEnv('WA_PHONE_NUMBER_ID'),
  waToken: getOptionalEnv('WA_TOKEN'),
  
  // TikTok
  tiktokApiKey: getOptionalEnv('TIKTOK_API_KEY'),
  
  // RuTube
  rutubeApiToken: getOptionalEnv('RUTUBE_API_TOKEN'),
  
  // YouTube
  youtubeClientId: getOptionalEnv('YOUTUBE_CLIENT_ID'),
  youtubeClientSecret: getOptionalEnv('YOUTUBE_CLIENT_SECRET'),
  
  // Настройки приложения
  isProduction: getBooleanEnv('NODE_ENV', false) && getEnvVar('NODE_ENV') === 'production',
  isDevelopment: getBooleanEnv('NODE_ENV', true) && getEnvVar('NODE_ENV') === 'development',
}

// ===== УТИЛИТЫ =====

export function isConfigured(): boolean {
  try {
    // Проверяем критические переменные
    requireEnv('NEXT_PUBLIC_SUPABASE_URL')
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    requireEnv('ADMIN_USERNAME')
    requireEnv('ADMIN_PASSWORD')
    return true
  } catch {
    return false
  }
}

export function getMissingVariables(): string[] {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
  ]
  
  return required.filter(name => !getEnvVar(name))
}

export function getOptionalVariables(): string[] {
  const optional = [
    'YANDEXGPT_API_KEY',
    'OPENAI_API_KEY',
    'VK_API_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'CLOUDPAYMENTS_SECRET',
    'ELEVENLABS_API_KEY',
    'CONTENTSTUDIO_API_KEY',
  ]
  
  return optional.filter(name => !getEnvVar(name))
}

// ===== ВАЛИДАЦИЯ КОНФИГУРАЦИИ =====

export function validateConfiguration(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Проверяем критические переменные
  const missing = getMissingVariables()
  if (missing.length > 0) {
    errors.push(`Missing required variables: ${missing.join(', ')}`)
  }
  
  // Проверяем URL Supabase
  if (env.supabase.url && !env.supabase.url.startsWith('https://')) {
    errors.push('SUPABASE_URL must use HTTPS in production')
  }
  
  // Проверяем наличие хотя бы одного AI сервиса
  if (!env.ai.yandexGpt && !env.ai.openai) {
    errors.push('At least one AI service (YandexGPT or OpenAI) should be configured')
  }
  
  // Проверяем наличие хотя бы одного интеграционного сервиса
  if (!env.integrations.vk && !env.integrations.telegram) {
    errors.push('At least one integration service (VK or Telegram) should be configured')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ===== ЭКСПОРТ =====

export default env