/**
 * Утилиты для определения режима v0 и работы с preview
 */

export function isV0Preview(): boolean {
  if (typeof window === 'undefined') {
    // На сервере проверяем заголовки
    return false
  }
  
  // На клиенте проверяем URL или другие признаки v0
  return (
    window.location.hostname.includes('v0.dev') ||
    window.location.hostname.includes('v0.app') ||
    window.location.search.includes('v0-preview=true') ||
    // Проверяем наличие специальных заголовков v0
    document.documentElement.hasAttribute('data-v0-preview')
  )
}

export function isVercelPreview(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  return (
    window.location.hostname.includes('vercel.app') ||
    window.location.search.includes('vercel-preview=true')
  )
}

export function isPreviewMode(): boolean {
  return isV0Preview() || isVercelPreview()
}

/**
 * Получает fallback значения для preview режима
 */
export function getFallbackEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'demo-key',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
    ELEVENLABS_API_KEY: 'demo-key',
    OPENAI_API_KEY: 'demo-key',
    YANDEXGPT_API_KEY: 'demo-key',
    VK_API_TOKEN: 'demo-token',
    TELEGRAM_BOT_TOKEN: 'demo-token',
    TIKTOK_API_KEY: 'demo-key',
    CONTENTSTUDIO_API_KEY: 'demo-key',
    NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID: 'demo-id',
    CLOUDPAYMENTS_SECRET: 'demo-secret',
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'demo-key',
    WA_PHONE_NUMBER_ID: 'demo-id',
    WA_TOKEN: 'demo-token'
  }
}

/**
 * Проверяет, нужно ли использовать fallback значения
 */
export function shouldUseFallback(): boolean {
  return isPreviewMode()
}

/**
 * Получает значение переменной окружения с fallback
 */
export function getEnvVar(key: string, fallback?: string): string | undefined {
  if (shouldUseFallback()) {
    const fallbackEnv = getFallbackEnv()
    return fallbackEnv[key as keyof typeof fallbackEnv] || fallback
  }
  
  return process.env[key] || fallback
}
