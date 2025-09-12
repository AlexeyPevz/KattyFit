// Оптимизированный компонент изображения для CLS и LCP
// Предотвращает layout shift и ускоряет загрузку

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import logger from '@/lib/logger'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  fill?: boolean
  style?: React.CSSProperties
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  quality = 75,
  fill = false,
  style,
  ...props
}: OptimizedImageProps) {
  // Валидация alt-текста для доступности
  if (!alt || alt.trim().length === 0) {
    logger.warn('OptimizedImage: alt-текст не может быть пустым для доступности')
  }
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Генерируем blur placeholder если не предоставлен
  const defaultBlurDataURL = blurDataURL || `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">
        Loading...
      </text>
    </svg>`
  ).toString('base64')}`

  // Обработка загрузки
  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  // Lazy loading для не-приоритетных изображений
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Изображение в viewport, можно загружать
              observer.disconnect()
            }
          })
        },
        { rootMargin: '50px' }
      )
      
      observer.observe(imgRef.current)
      
      return () => observer.disconnect()
    }
  }, [priority])

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style,
        }}
        role="img"
        aria-label={`Ошибка загрузки изображения: ${alt}`}
      >
        <span className="text-sm">Ошибка загрузки</span>
      </div>
    )
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          objectFit: 'cover',
        }}
        {...props}
      />
      
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Компонент для hero изображений с приоритетом
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      quality={90}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

// Компонент для карточек курсов
export function CourseImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={false}
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

// Компонент для аватаров
export function AvatarImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={false}
      quality={60}
      sizes="(max-width: 768px) 50px, 100px"
    />
  )
}
