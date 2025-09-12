// Утилита для проверки конфигурации v0
// Помогает диагностировать проблемы с переменными окружения

import logger from './logger'

export interface ConfigStatus {
  isConfigured: boolean
  missingVars: string[]
  warnings: string[]
  recommendations: string[]
}

export function checkV0Configuration(): ConfigStatus {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'NEXT_PUBLIC_ADMIN_USERNAME'
  ]

  const optionalVars = [
    'YANDEXGPT_API_KEY',
    'OPENAI_API_KEY',
    'VK_API_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'CLOUDPAYMENTS_SECRET',
    'NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID'
  ]

  const missingVars: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // Проверяем обязательные переменные
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  })

  // Проверяем опциональные переменные
  const missingOptional = optionalVars.filter(varName => !process.env[varName])
  
  if (missingOptional.length > 0) {
    warnings.push(`Отсутствуют опциональные переменные: ${missingOptional.join(', ')}`)
  }

  // Проверяем специфичные конфигурации
  if (!process.env.YANDEXGPT_API_KEY && !process.env.OPENAI_API_KEY) {
    warnings.push('Не настроен ни один AI сервис - чат-бот будет работать в ограниченном режиме')
    recommendations.push('Настройте YANDEXGPT_API_KEY или OPENAI_API_KEY в v0 Environment Variables')
  }

  if (!process.env.VK_API_TOKEN && !process.env.TELEGRAM_BOT_TOKEN) {
    warnings.push('Не настроены социальные сети - публикация контента будет недоступна')
    recommendations.push('Настройте VK_API_TOKEN и/или TELEGRAM_BOT_TOKEN')
  }

  if (!process.env.CLOUDPAYMENTS_SECRET) {
    warnings.push('Не настроены платежи - функция оплаты будет недоступна')
    recommendations.push('Настройте CLOUDPAYMENTS_SECRET и NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID')
  }

  // Проверяем корректность URL
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL должен начинаться с https://')
  }

  return {
    isConfigured: missingVars.length === 0,
    missingVars,
    warnings,
    recommendations
  }
}

// Функция для отображения статуса конфигурации в консоли
export function logConfigStatus(): void {
  const status = checkV0Configuration()
  
  logger.info('🔧 v0 Configuration Status')
  
  if (status.isConfigured) {
    logger.info('✅ Все обязательные переменные настроены')
  } else {
    logger.error('❌ Отсутствуют обязательные переменные', { missingVars: status.missingVars })
  }
  
  if (status.warnings.length > 0) {
    logger.warn('⚠️ Предупреждения:')
    status.warnings.forEach(warning => logger.warn(`  - ${warning}`))
  }
  
  if (status.recommendations.length > 0) {
    logger.info('💡 Рекомендации:')
    status.recommendations.forEach(rec => logger.info(`  - ${rec}`))
  }
  
  // Group end not needed with logger
}

// Функция для проверки конфигурации в runtime
export function validateRuntimeConfig(): boolean {
  try {
    const status = checkV0Configuration()
    
    if (!status.isConfigured) {
      logger.error('❌ Критическая ошибка конфигурации v0', { missingVars: status.missingVars })
      return false
    }
    
    return true
  } catch (error) {
    logger.error('❌ Ошибка проверки конфигурации', { error: error instanceof Error ? error.message : String(error) })
    return false
  }
}