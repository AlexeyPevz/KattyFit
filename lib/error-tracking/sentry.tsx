// Sentry интеграция для error tracking
// Централизованное отслеживание ошибок и производительности

import * as Sentry from '@sentry/nextjs'
import { SeverityLevel } from '@sentry/types'

// Конфигурация Sentry
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const SENTRY_ORG = process.env.SENTRY_ORG
const SENTRY_PROJECT = process.env.SENTRY_PROJECT
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN

// Инициализация Sentry
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured, error tracking disabled')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    // Настройки для Next.js
    integrations: [
      new Sentry.BrowserTracing({
        // Настройки трассировки
        routingInstrumentation: Sentry.nextjsRouterInstrumentation(
          require('next/router')
        ),
      }),
      new Sentry.Replay({
        // Настройки записи сессий
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Настройки производительности
    beforeSend(event: any) {
      // Фильтруем чувствительные данные
      if (event.request?.cookies) {
        delete event.request.cookies
      }
      
      // Фильтруем пароли и токены
      if (event.extra) {
        Object.keys(event.extra).forEach(key => {
          if (key.toLowerCase().includes('password') || 
              key.toLowerCase().includes('token') ||
              key.toLowerCase().includes('secret')) {
            event.extra[key] = '[REDACTED]'
          }
        })
      }

      return event
    },

    // Настройки пользователей
    beforeSendTransaction(event: any) {
      // Фильтруем транзакции с чувствительными данными
      if (event.transaction?.includes('password') || 
          event.transaction?.includes('token')) {
        return null
      }
      return event
    },

    // Настройки тегов
    initialScope: {
      tags: {
        component: 'web-app',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
      }
    }
  })
}

// Утилиты для работы с Sentry
export class SentryService {
  /**
   * Отправляет ошибку в Sentry
   */
  static captureException(error: Error, context?: Record<string, unknown>): void {
    Sentry.withScope((scope: any) => {
      if (context) {
        scope.setContext('error_context', context)
      }
      Sentry.captureException(error)
    })
  }

  /**
   * Отправляет сообщение в Sentry
   */
  static captureMessage(
    message: string, 
    level: SeverityLevel = 'info',
    context?: Record<string, unknown>
  ): void {
    Sentry.withScope((scope: any) => {
      if (context) {
        scope.setContext('message_context', context)
      }
      scope.setLevel(level)
      Sentry.captureMessage(message)
    })
  }

  /**
   * Устанавливает пользователя для контекста
   */
  static setUser(user: {
    id: string
    email?: string
    username?: string
    [key: string]: unknown
  }): void {
    Sentry.setUser(user)
  }

  /**
   * Очищает контекст пользователя
   */
  static clearUser(): void {
    Sentry.setUser(null)
  }

  /**
   * Устанавливает теги
   */
  static setTags(tags: Record<string, string>): void {
    Sentry.setTags(tags)
  }

  /**
   * Устанавливает контекст
   */
  static setContext(key: string, context: Record<string, unknown>): void {
    Sentry.setContext(key, context)
  }

  /**
   * Добавляет хлебные крошки (breadcrumbs)
   */
  static addBreadcrumb(message: string, category?: string, level?: SeverityLevel): void {
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
      timestamp: Date.now() / 1000
    })
  }

  /**
   * Создает транзакцию для отслеживания производительности
   */
  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op })
  }

  /**
   * Создает span для отслеживания операций
   */
  static startSpan<T>(name: string, callback: (span: Sentry.Span) => T): T {
    return Sentry.startSpan({ name }, callback)
  }

  /**
   * Отправляет пользовательское событие
   */
  static captureEvent(event: {
    message?: string
    level?: SeverityLevel
    tags?: Record<string, string>
    extra?: Record<string, unknown>
    user?: Record<string, unknown>
  }): void {
    Sentry.captureEvent(event)
  }

  /**
   * Получает ID текущей сессии
   */
  static getCurrentSessionId(): string | undefined {
    return Sentry.getCurrentHub().getScope()?.getSession()?.sid
  }

  /**
   * Принудительно отправляет все ожидающие события
   */
  static flush(timeout?: number): Promise<boolean> {
    return Sentry.flush(timeout)
  }

  /**
   * Закрывает клиент Sentry
   */
  static close(): Promise<void> {
    return Sentry.close()
  }
}

// React компонент для обработки ошибок
export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }: { error: any; resetError: any }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Что-то пошло не так
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
              </p>
              <div className="mt-4">
                <button
                  onClick={resetError}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      beforeCapture={(scope: any, error: any, errorInfo: any) => {
        scope.setTag('errorBoundary', true)
        scope.setContext('errorInfo', errorInfo)
        scope.setLevel('error')
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}

// Хук для использования Sentry в React компонентах
export function useSentry() {
  return {
    captureException: SentryService.captureException,
    captureMessage: SentryService.captureMessage,
    setUser: SentryService.setUser,
    clearUser: SentryService.clearUser,
    setTags: SentryService.setTags,
    setContext: SentryService.setContext,
    addBreadcrumb: SentryService.addBreadcrumb,
    startTransaction: SentryService.startTransaction,
    startSpan: SentryService.startSpan,
    captureEvent: SentryService.captureEvent,
    getCurrentSessionId: SentryService.getCurrentSessionId,
    flush: SentryService.flush
  }
}

// Утилиты для интеграции с существующим logger
export function enhanceLoggerWithSentry(logger: { error: (message: string, context?: Record<string, unknown>) => void; warn: (message: string, context?: Record<string, unknown>) => void; info: (message: string, context?: Record<string, unknown>) => void }) {
  const originalError = logger.error
  logger.error = (message: string, context?: Record<string, unknown>) => {
    originalError.call(logger, message, context)
    SentryService.captureMessage(message, 'error', context)
  }

  return logger
}

// Автоматическая инициализация
if (typeof window !== 'undefined') {
  initSentry()
}