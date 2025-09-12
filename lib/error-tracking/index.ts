// Главный файл для экспорта всех функций error tracking
export * from './sentry'
export * from './error-boundary'
export * from './performance-monitoring'
export * from './user-feedback'

// Инициализация всех сервисов
import { initSentry } from './sentry'
import { performanceMonitor } from './performance-monitoring'
import { userFeedbackManager } from './user-feedback'

// Функция для инициализации всех сервисов error tracking
export function initializeErrorTracking() {
  // Инициализируем Sentry
  initSentry()
  
  // Инициализируем мониторинг производительности
  performanceMonitor.initialize()
  
  // Инициализируем менеджер фидбека
  userFeedbackManager.initialize()
  
  console.log('Error tracking services initialized')
}
