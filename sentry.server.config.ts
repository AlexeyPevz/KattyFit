// Sentry configuration for server-side
// This file is used by Sentry's webpack plugin

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  
  // Настройки для сервера
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: undefined }),
  ],

  // Фильтрация чувствительных данных
  beforeSend(event: any) {
    // Удаляем cookies и headers с чувствительными данными
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    
    if (event.request?.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
      sensitiveHeaders.forEach(header => {
        if (event.request?.headers?.[header]) {
          event.request.headers[header] = '[REDACTED]'
        }
      })
    }
    
    // Фильтруем пароли и токены в extra данных
    if (event.extra) {
      Object.keys(event.extra).forEach(key => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('key')) {
          event.extra[key] = '[REDACTED]'
        }
      })
    }

    return event
  },

  // Настройки тегов
  initialScope: {
    tags: {
      component: 'web-app-server',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    }
  }
})