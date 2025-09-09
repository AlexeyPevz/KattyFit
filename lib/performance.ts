// Утилиты для оптимизации производительности

// Debounce функция для оптимизации частых вызовов
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle функция для ограничения частоты вызовов
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Мемоизация для кеширования результатов функций
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    
    // Ограничиваем размер кеша
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }) as T
}

// Lazy load изображений с Intersection Observer
export function lazyLoadImages() {
  if (typeof window === 'undefined') return
  
  const images = document.querySelectorAll('img[data-src]')
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src!
        img.removeAttribute('data-src')
        imageObserver.unobserve(img)
      }
    })
  })
  
  images.forEach(img => imageObserver.observe(img))
}

// Предзагрузка критических ресурсов
export function preloadCriticalAssets() {
  if (typeof window === 'undefined') return
  
  // Предзагружаем шрифты
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.as = 'font'
  fontLink.type = 'font/woff2'
  fontLink.href = '/fonts/inter-var.woff2'
  fontLink.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink)
  
  // Предзагружаем критические изображения
  const heroImage = document.createElement('link')
  heroImage.rel = 'preload'
  heroImage.as = 'image'
  heroImage.href = '/images/hero-bg.webp'
  document.head.appendChild(heroImage)
}

// Оптимизация анимаций при низкой производительности
export function optimizeAnimations() {
  if (typeof window === 'undefined') return
  
  // Проверяем предпочтения пользователя
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduce-motion')
  }
  
  // Отключаем анимации при низком заряде батареи
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      if (battery.level < 0.2) {
        document.documentElement.classList.add('low-battery')
      }
    })
  }
}

// Кеширование API запросов
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export async function cachedFetch(url: string, options?: RequestInit) {
  const cacheKey = `${url}:${JSON.stringify(options)}`
  const cached = apiCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const response = await fetch(url, options)
  const data = await response.json()
  
  apiCache.set(cacheKey, { data, timestamp: Date.now() })
  
  // Очищаем старый кеш
  if (apiCache.size > 50) {
    const oldestKey = Array.from(apiCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
    apiCache.delete(oldestKey)
  }
  
  return data
}
