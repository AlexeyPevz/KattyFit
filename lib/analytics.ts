// Простая система аналитики для v0
// В продакшене можно заменить на Google Analytics, Яндекс.Метрику или Amplitude

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp: Date
  userId?: string
  sessionId: string
}

class Analytics {
  private sessionId: string
  private userId: string | null = null
  private queue: AnalyticsEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    // Генерируем ID сессии
    this.sessionId = this.getOrCreateSessionId()
    
    // Загружаем userId если есть
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userEmail') || null
    }

    // Отправляем события каждые 10 секунд
    if (typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flush(), 10000)
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  // Отслеживание события
  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.sessionId
    }

    this.queue.push(analyticsEvent)

    // Если очередь большая, отправляем сразу
    if (this.queue.length >= 10) {
      this.flush()
    }

    // Логируем в консоль для отладки (убрать в продакшене)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties)
    }
  }

  // Установка userId
  identify(userId: string) {
    this.userId = userId
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_user_id', userId)
    }
  }

  // Отслеживание просмотра страницы
  page(pageName?: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page: pageName || (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      ...properties
    })
  }

  // Отправка событий на сервер
  private async flush() {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      })
    } catch (error) {
      // В случае ошибки возвращаем события в очередь
      this.queue = [...events, ...this.queue]
    }
  }

  // Очистка при закрытии страницы
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Экспортируем singleton
export const analytics = typeof window !== 'undefined' ? new Analytics() : null

// Удобные функции для использования
export function trackEvent(event: string, properties?: Record<string, any>) {
  analytics?.track(event, properties)
}

export function trackPageView(pageName?: string, properties?: Record<string, any>) {
  analytics?.page(pageName, properties)
}

export function identifyUser(userId: string) {
  analytics?.identify(userId)
}

// Предопределенные события для консистентности
export const ANALYTICS_EVENTS = {
  // Конверсионные события
  SIGN_UP: 'user_signed_up',
  LOGIN: 'user_logged_in',
  PURCHASE: 'purchase_completed',
  BOOKING_CREATED: 'booking_created',
  COURSE_STARTED: 'course_started',
  
  // Вовлеченность
  VIDEO_PLAYED: 'video_played',
  VIDEO_COMPLETED: 'video_completed',
  CHAT_OPENED: 'chat_opened',
  MESSAGE_SENT: 'message_sent',
  
  // E-commerce
  PRODUCT_VIEWED: 'product_viewed',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PROMO_APPLIED: 'promo_code_applied',
  
  // Навигация
  MENU_CLICKED: 'menu_clicked',
  FILTER_APPLIED: 'filter_applied',
  SEARCH: 'search_performed',
  
  // Ошибки
  ERROR: 'error_occurred',
  PAYMENT_FAILED: 'payment_failed'
}
