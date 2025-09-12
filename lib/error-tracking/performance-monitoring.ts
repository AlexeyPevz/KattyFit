import * as Sentry from './sentry-stub'
import logger from '../logger'

// Интерфейс для метрик производительности
interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count'
  tags?: Record<string, string>
}

// Интерфейс для Web Vitals
interface WebVitals {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  id: string
  delta: number
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'back_forward_cache'
}

// Класс для мониторинга производительности
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private isInitialized = false

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Инициализация мониторинга
  initialize() {
    if (this.isInitialized) return

    // Мониторинг Web Vitals
    this.observeWebVitals()
    
    // Мониторинг загрузки ресурсов
    this.observeResourceTiming()
    
    // Мониторинг навигации
    this.observeNavigationTiming()
    
    // Мониторинг ошибок загрузки ресурсов
    this.observeResourceErrors()

    this.isInitialized = true
    logger.info('Performance monitoring initialized')
  }

  // Мониторинг Web Vitals
  private observeWebVitals() {
    if (typeof window === 'undefined') return

    // Импортируем web-vitals только на клиенте
    import('./web-vitals-stub').then(({ getCLS, getFID, getFCP, getLCP, getTTFB, getINP }) => {
      getCLS((metric: any) => this.reportWebVital(metric))
      getFID((metric: any) => this.reportWebVital(metric))
      getFCP((metric: any) => this.reportWebVital(metric))
      getLCP((metric: any) => this.reportWebVital(metric))
      getTTFB((metric: any) => this.reportWebVital(metric))
      getINP((metric: any) => this.reportWebVital(metric))
    }).catch((error) => {
      logger.error('Failed to load web-vitals', { error: error.message })
    })
  }

  // Отправка Web Vital метрики
  private reportWebVital(metric: WebVitals) {
    // Логируем метрику
    logger.info('Web Vital reported', {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    })

    // Отправляем в Sentry
    Sentry.addBreadcrumb()

    // Отправляем как метрику в Sentry
    Sentry.addBreadcrumb()

    // Проверяем пороговые значения
    this.checkWebVitalThresholds(metric)
  }

  // Проверка пороговых значений Web Vitals
  private checkWebVitalThresholds(metric: WebVitals) {
    const thresholds = {
      CLS: 0.1,
      FID: 100,
      FCP: 1800,
      LCP: 2500,
      TTFB: 800,
      INP: 200,
    }

    const threshold = thresholds[metric.name]
    if (threshold && metric.value > threshold) {
      logger.warn('Web Vital threshold exceeded', {
        metric: metric.name,
        value: metric.value,
        threshold,
        severity: metric.value > threshold * 2 ? 'critical' : 'warning',
      })

      // Отправляем как предупреждение в Sentry
      Sentry.captureMessage()
    }
  }

  // Мониторинг загрузки ресурсов
  private observeResourceTiming() {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Логируем медленные ресурсы (> 1 секунды)
          if (resourceEntry.duration > 1000) {
            logger.warn('Slow resource loading', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType,
            })

            // Отправляем в Sentry
            Sentry.addBreadcrumb()
          }
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
  }

  // Мониторинг навигации
  private observeNavigationTiming() {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          
          logger.info('Navigation timing', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
          })

          // Отправляем в Sentry
          Sentry.addBreadcrumb()
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
  }

  // Мониторинг ошибок загрузки ресурсов
  private observeResourceErrors() {
    if (typeof window === 'undefined') return

    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement
        const tagName = target.tagName?.toLowerCase()
        
        if (tagName === 'img' || tagName === 'script' || tagName === 'link') {
          logger.error('Resource loading error', {
            tagName,
            src: (target as HTMLImageElement).src || (target as HTMLScriptElement).src,
            href: (target as HTMLLinkElement).href,
            error: event.message,
          })

          // Отправляем в Sentry
          Sentry.captureException()
        }
      }
    })
  }

  // Добавление пользовательской метрики
  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    logger.info('Custom metric added', metric)
    
    // Отправляем в Sentry
    Sentry.addBreadcrumb()
  }

  // Получение всех метрик
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // Очистка метрик
  clearMetrics() {
    this.metrics = []
  }
}

// Экспорт singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
