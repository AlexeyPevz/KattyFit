// Компонент для предотвращения Layout Shift (CLS)
// Обеспечивает стабильные размеры элементов

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface LayoutShiftGuardProps {
  children: React.ReactNode
  className?: string
  minHeight?: string | number
  minWidth?: string | number
  aspectRatio?: string
  fallback?: React.ReactNode
  loading?: boolean
}

export function LayoutShiftGuard({
  children,
  className,
  minHeight = 'auto',
  minWidth = 'auto',
  aspectRatio,
  fallback,
  loading = false,
}: LayoutShiftGuardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isStable, setIsStable] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Измеряем размеры контента
    const measureDimensions = () => {
      const rect = container.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }

    // Первоначальное измерение
    measureDimensions()

    // Создаем ResizeObserver для отслеживания изменений
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
        
        // Считаем размеры стабильными после небольшой задержки
        setTimeout(() => {
          setIsStable(true)
        }, 100)
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const style: React.CSSProperties = {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    aspectRatio,
    // Предотвращаем CLS, устанавливая минимальные размеры
    ...(dimensions.width > 0 && { minWidth: `${dimensions.width}px` }),
    ...(dimensions.height > 0 && { minHeight: `${dimensions.height}px` }),
  }

  return (
    <div
      ref={containerRef}
      className={cn('layout-shift-guard', className)}
      style={style}
      role={loading ? "status" : undefined}
      aria-live={loading ? "polite" : undefined}
    >
      {loading && !isStable ? (
        fallback || (
          <div 
            className="loading-placeholder w-full h-full" 
            aria-label="Загрузка контента"
          />
        )
      ) : (
        children
      )}
    </div>
  )
}

// Специализированные компоненты для разных случаев

export function CardLayoutGuard({ children, className, ...props }: LayoutShiftGuardProps) {
  return (
    <LayoutShiftGuard
      className={cn('course-card', className)}
      minHeight={400}
      aspectRatio="4/3"
      {...props}
    >
      {children}
    </LayoutShiftGuard>
  )
}

export function ImageLayoutGuard({ 
  children, 
  className, 
  width, 
  height, 
  ...props 
}: LayoutShiftGuardProps & { width: number; height: number }) {
  return (
    <LayoutShiftGuard
      className={cn('optimized-image', className)}
      minWidth={width}
      minHeight={height}
      aspectRatio={`${width}/${height}`}
      {...props}
    >
      {children}
    </LayoutShiftGuard>
  )
}

export function TextLayoutGuard({ 
  children, 
  className, 
  lines = 1,
  ...props 
}: LayoutShiftGuardProps & { lines?: number }) {
  const lineHeight = 1.5
  const fontSize = 16
  const minHeight = lines * fontSize * lineHeight

  return (
    <LayoutShiftGuard
      className={cn('text-content', className)}
      minHeight={minHeight}
      {...props}
    >
      {children}
    </LayoutShiftGuard>
  )
}

export function ButtonLayoutGuard({ 
  children, 
  className, 
  size = 'md',
  ...props 
}: LayoutShiftGuardProps & { size?: 'sm' | 'md' | 'lg' }) {
  const heightMap = {
    sm: 40,
    md: 48,
    lg: 56,
  }

  return (
    <LayoutShiftGuard
      className={cn('btn', `btn-${size}`, className)}
      minHeight={heightMap[size]}
      {...props}
    >
      {children}
    </LayoutShiftGuard>
  )
}

// Хук для отслеживания CLS
export function useLayoutShift() {
  const [cls, setCls] = useState(0)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Проверяем поддержку LayoutShift API
    if (!('PerformanceObserver' in window)) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)

    let clsValue = 0
    let lastSessionValue = 0
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Только для LayoutShift entries
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          // Если это первый entry или произошло больше 1 секунды
          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += (entry as any).value
            sessionEntries.push(entry)
          } else {
            sessionValue = (entry as any).value
            sessionEntries = [entry]
          }

          if (sessionValue > lastSessionValue) {
            lastSessionValue = sessionValue
            setCls(sessionValue)
          }
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      setIsSupported(false)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return { cls, isSupported }
}

// Утилита для измерения CLS
export function measureCLS(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(0)
      return
    }

    let clsValue = 0
    let lastSessionValue = 0
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          if (sessionValue &&
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += (entry as any).value
            sessionEntries.push(entry)
          } else {
            sessionValue = (entry as any).value
            sessionEntries = [entry]
          }

          if (sessionValue > lastSessionValue) {
            lastSessionValue = sessionValue
            clsValue = sessionValue
          }
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['layout-shift'] })
      
      // Измеряем в течение 5 секунд
      setTimeout(() => {
        observer.disconnect()
        resolve(clsValue)
      }, 5000)
    } catch (e) {
      resolve(0)
    }
  })
}
