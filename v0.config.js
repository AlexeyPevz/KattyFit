/** @type {import('v0').V0Config} */
const v0Config = {
  // Настройки для v0 preview
  preview: {
    // Отключаем middleware в preview режиме
    skipMiddleware: true,
    // Используем fallback значения для переменных окружения
    fallbackEnv: {
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
  },
  
  // Настройки для деплоя
  deploy: {
    // Платформа для деплоя
    platform: 'vercel',
    // Настройки сборки
    build: {
      command: 'npm run build',
      output: '.next'
    },
    // Переменные окружения для production
    env: {
      NODE_ENV: 'production'
    }
  },
  
  // Настройки совместимости
  compatibility: {
    // Отключаем проблемные функции в preview
    disableInPreview: [
      'supabase',
      'external-apis',
      'file-uploads',
      'real-time-features'
    ],
    // Включаем fallback режим
    enableFallback: true
  }
}

module.exports = v0Config
