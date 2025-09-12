import { useCallback, useMemo, useRef, useEffect } from 'react'

// ===== DEBOUNCE HOOK =====

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// ===== THROTTLE HOOK =====

export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// ===== OPTIMIZED SEARCH =====

export function useOptimizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceDelay: number = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay)

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items

    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        }
        return false
      })
    )
  }, [items, debouncedSearchTerm, searchFields])

  return filteredItems
}

// ===== VIRTUAL SCROLLING =====

export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// ===== MEMOIZED CALLBACKS =====

export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  )
}

// ===== OPTIMIZED LIST RENDERING =====

export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string | number,
  itemHeight?: number
) {
  const memoizedItems = useMemo(() => items, [items])
  
  const getItemKey = useCallback(keyExtractor, [keyExtractor])

  return {
    items: memoizedItems,
    getItemKey,
    itemHeight
  }
}

// ===== PERFORMANCE MONITORING =====

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())

  useEffect(() => {
    renderCount.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered ${renderCount.current} times, ${timeSinceLastRender}ms since last render`)
    }
  })

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  }
}

// ===== OPTIMIZED FORM HANDLING =====

export function useOptimizedForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema?: (values: T) => Record<string, string>
) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    if (validationSchema) {
      const newErrors = validationSchema({ ...values, [field]: value })
      setErrors(prev => ({ ...prev, [field]: newErrors[field] || '' }))
    }
  }, [values, validationSchema])

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error)
  }, [errors])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    reset,
    isValid
  }
}

// ===== LAZY LOADING =====

export function useLazyLoad(
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true)
          setHasLoaded(true)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasLoaded])

  return { ref, isIntersecting, hasLoaded }
}

// ===== ANIMATION FRAME OPTIMIZATION =====

export function useAnimationFrame(callback: () => void, deps: unknown[] = []) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
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
  }, [animate, ...deps])
}

// ===== MEMORY OPTIMIZATION =====

export function useMemoryOptimizedList<T>(
  items: T[],
  maxItems: number = 1000
) {
  const [visibleItems, setVisibleItems] = useState<T[]>([])
  const [startIndex, setStartIndex] = useState(0)

  const processItems = useCallback(() => {
    if (items.length <= maxItems) {
      setVisibleItems(items)
      return
    }

    const endIndex = Math.min(startIndex + maxItems, items.length)
    setVisibleItems(items.slice(startIndex, endIndex))
  }, [items, maxItems, startIndex])

  useEffect(() => {
    processItems()
  }, [processItems])

  const loadMore = useCallback(() => {
    if (startIndex + maxItems < items.length) {
      setStartIndex(prev => prev + maxItems)
    }
  }, [startIndex, maxItems, items.length])

  const hasMore = startIndex + maxItems < items.length

  return {
    visibleItems,
    loadMore,
    hasMore,
    totalItems: items.length
  }
}

// ===== BATCH UPDATES =====

export function useBatchedUpdates<T>(
  updateFn: (updates: T[]) => void,
  batchSize: number = 10,
  delay: number = 100
) {
  const [pendingUpdates, setPendingUpdates] = useState<T[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const addUpdate = useCallback((update: T) => {
    setPendingUpdates(prev => [...prev, update])

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setPendingUpdates(current => {
        if (current.length >= batchSize) {
          updateFn(current)
          return []
        }
        return current
      })
    }, delay)
  }, [updateFn, batchSize, delay])

  const flushUpdates = useCallback(() => {
    if (pendingUpdates.length > 0) {
      updateFn(pendingUpdates)
      setPendingUpdates([])
    }
  }, [pendingUpdates, updateFn])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { addUpdate, flushUpdates, pendingCount: pendingUpdates.length }
}