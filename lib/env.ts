export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// Centralized access to env variables. Values may be empty in local build environments.
// Runtime routes should validate presence when needed and return a helpful error if missing.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || '',

  // AI/Integrations
  yandexGptApiKey: process.env.YANDEXGPT_API_KEY || '',
  yandexGptFolderId: process.env.YANDEXGPT_FOLDER_ID || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  contentStudioApiKey: process.env.CONTENTSTUDIO_API_KEY || '',

  // Payments/Webhooks
  cloudPaymentsPublicId: process.env.NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID || '',
  cloudPaymentsSecret: process.env.CLOUDPAYMENTS_SECRET || '',
  metaWebhookToken: process.env.META_WEBHOOK_TOKEN || '',

  // HLS security
  hlsAllowedHosts: (process.env.HLS_ALLOWED_HOSTS || '').split(',').map(h => h.trim()).filter(Boolean),
  hlsJwtSecret: process.env.HLS_JWT_SECRET || '',

  // Storage
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'content',

  // Push Notifications
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',

  // Admin credentials
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminUsernamePublic: process.env.NEXT_PUBLIC_ADMIN_USERNAME || '',
}
