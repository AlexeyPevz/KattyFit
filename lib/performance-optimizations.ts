// Оптимизации производительности для INP (Interaction to Next Paint)
// Улучшение отзывчивости интерфейса

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import logger from './logger'

// Дебаунс для оптимизации частых вызовов
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

// Троттлинг для ограничения частоты вызовов
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback(...args)
    }
  }, [callback, delay]) as T
}

// Мемоизация для тяжелых вычислений
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps)
}

// Оптимизация для больших списков
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = useRef(0)
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop.current / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }))
  }, [items, itemHeight, containerHeight, scrollTop.current])
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    updateScrollTop: (newScrollTop: number) => {
      scrollTop.current = newScrollTop
    }
  }
}

// Оптимизация для анимаций
export function useAnimationFrame(callback: () => void) {
  const requestRef = useRef<number | null>(null)
  const previousTimeRef = useRef<number | null>(null)
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== null && previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      callback()
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [callback])
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])
}

// Оптимизация для тяжелых компонентов
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let cancelled = false
    
    importFunc().then((module) => {
      if (!cancelled) {
        setComponent(() => module.default)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setLoading(false)
      }
    })
    
    return () => {
      cancelled = true
    }
  }, [importFunc])
  
  if (loading) {
    return fallback ? fallback : null
  }
  
  return Component
}

// Оптимизация для форм
export function useOptimizedForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Дебаунс для валидации
  const debouncedValidate = useDebounce((field: keyof T, value: any) => {
    // Простая валидация
    if (typeof value === 'string' && value.trim() === '') {
      setErrors(prev => ({ ...prev, [field]: 'Поле обязательно для заполнения' }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, 300)
  
  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    debouncedValidate(field, value)
  }, [debouncedValidate])
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, onSubmit, isSubmitting])
  
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  }
}

// Оптимизация для поиска
export function useOptimizedSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>(items)
  
  const debouncedSearch = useDebounce((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(items)
      return
    }
    
    const filtered = items.filter(item => searchFn(item, searchQuery))
    setResults(filtered)
  }, debounceMs)
  
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])
  
  return {
    query,
    setQuery,
    results,
  }
}

// Оптимизация для модальных окон
export function useOptimizedModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const open = useCallback(() => {
    setIsOpen(true)
    setIsAnimating(true)
    
    // Предотвращаем скролл body
    document.body.style.overflow = 'hidden'
  }, [])
  
  const close = useCallback(() => {
    setIsAnimating(false)
    
    // Восстанавливаем скролл body
    document.body.style.overflow = ''
    
    // Закрываем после анимации
    setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }, [])
  
  useEffect(() => {
    return () => {
      // Восстанавливаем скролл при размонтировании
      document.body.style.overflow = ''
    }
  }, [])
  
  return {
    isOpen,
    isAnimating,
    open,
    close,
  }
}

// Оптимизация для бесконечной прокрутки
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean,
  threshold: number = 100
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMoreItems, setHasMoreItems] = useState(hasMore)
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMoreItems) return
    
    setLoading(true)
    try {
      const newItems = await fetchMore()
      setItems(prev => [...prev, ...newItems])
      setHasMoreItems(newItems.length > 0)
    } finally {
      setLoading(false)
    }
  }, [fetchMore, loading, hasMoreItems])
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loadMore()
    }
  }, [loadMore, threshold])
  
  return {
    items,
    loading,
    hasMoreItems,
    loadMore,
    handleScroll,
  }
}

// Утилиты для измерения производительности
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now()
  fn()
  const end = performance.now()
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
  }
  
  return end - start
}

export function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  return fn().then(result => {
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  })
}