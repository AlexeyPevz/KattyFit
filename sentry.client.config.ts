// Sentry configuration for client-side
// This file is used by Sentry's webpack plugin

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  
  // Настройки для браузера
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.nextjsRouterInstrumentation(
        require('next/router')
      ),
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Фильтрация чувствительных данных
  beforeSend(event: any) {
    // Удаляем cookies
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    
    // Фильтруем пароли и токены
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
      component: 'web-app',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    }
  }
})