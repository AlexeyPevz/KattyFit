"use client"

import { useEffect, useState } from "react"
import { SecureVideoPlayer } from "./secure-video-player"
import { selectVideoSource, getUserGeolocation, isRussianUser } from "@/lib/geolocation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Globe, MapPin } from "lucide-react"

interface GeoVideoPlayerProps {
  vkUrl?: string
  youtubeUrl?: string
  hlsUrl?: string // Для self-hosted HLS
  title?: string
  onProgress?: (progress: { currentTime: number; duration: number; percentage: number }) => void
  onComplete?: () => void
  initialTime?: number
  poster?: string
}

export function GeoVideoPlayer({
  vkUrl,
  youtubeUrl,
  hlsUrl,
  title,
  onProgress,
  onComplete,
  initialTime = 0,
  poster
}: GeoVideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [videoSource, setVideoSource] = useState<'vk' | 'youtube' | 'hls' | 'default'>('default')
  const [isLoading, setIsLoading] = useState(true)
  const [userCountry, setUserCountry] = useState<string>("")
  const [showGeoInfo, setShowGeoInfo] = useState(false)

  useEffect(() => {
    let cancelled = false
    
    const selectSource = async () => {
      await selectBestVideoSource(cancelled)
    }
    
    selectSource()
    
    return () => {
      cancelled = true
    }
  }, [vkUrl, youtubeUrl, hlsUrl])

  const selectBestVideoSource = async (cancelled: boolean) => {
    try {
      setIsLoading(true)

      // Если есть HLS URL (self-hosted), используем его приоритетно
      if (hlsUrl) {
        if (!cancelled) {
          setVideoUrl(hlsUrl)
          setVideoSource('hls')
          setIsLoading(false)
        }
        return
      }

      // Определяем геолокацию и выбираем источник
      const location = await getUserGeolocation()
      
      if (cancelled) return // Проверяем отмену после async операции
      
      if (location) {
        setUserCountry(location.country)
        setShowGeoInfo(true)
        
        // Скрываем информацию о стране через 3 секунды
        if (!cancelled) {
          const timer = setTimeout(() => {
            if (!cancelled) setShowGeoInfo(false)
          }, 3000)
          
          // Сохраняем таймер для очистки при размонтировании
          return () => clearTimeout(timer)
        }
      }

      const { url, source } = await selectVideoSource(vkUrl, youtubeUrl)
      
      if (cancelled) return // Проверяем отмену после async операции
      
      if (url) {
        // Для VK видео нужно преобразовать URL в embed
        if (source === 'vk' && url.includes('vk.com/video')) {
          // Извлекаем ID видео из URL
          const match = url.match(/video(-?\d+)_(\d+)/)
          if (match) {
            const ownerId = match[1]
            const videoId = match[2]
            const embedUrl = `https://vk.com/video_ext.php?oid=${ownerId}&id=${videoId}`
            setVideoUrl(embedUrl)
          } else {
            setVideoUrl(url)
          }
        } else if (source === 'youtube' && url.includes('youtube.com/watch')) {
          // Преобразуем YouTube URL в embed
          try {
            const urlObj = new URL(url)
            const videoId = urlObj.searchParams.get('v')
            if (videoId) {
              setVideoUrl(`https://www.youtube.com/embed/${videoId}`)
            } else {
              setVideoUrl(url)
            }
          } catch (error) {
            console.error('Invalid YouTube URL:', url)
            setVideoUrl(url)
          }
        } else {
          setVideoUrl(url)
        }
        
        if (!cancelled) {
          setVideoSource(source)
        }
      } else {
        console.error("Нет доступных источников видео")
      }
    } catch (error) {
      console.error("Ошибка выбора источника видео:", error)
      // Fallback на первый доступный источник
      if (!cancelled) {
        if (hlsUrl) {
          setVideoUrl(hlsUrl)
          setVideoSource('hls')
        } else if (vkUrl) {
          setVideoUrl(vkUrl)
          setVideoSource('vk')
        } else if (youtubeUrl) {
          setVideoUrl(youtubeUrl)
          setVideoSource('youtube')
        }
      }
    } finally {
      if (!cancelled) {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Определяем оптимальный источник видео...</p>
        </div>
      </Card>
    )
  }

  if (!videoUrl) {
    return (
      <Card className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Видео недоступно</p>
          <p className="text-sm text-muted-foreground mt-2">
            Попробуйте обновить страницу или свяжитесь с поддержкой
          </p>
        </div>
      </Card>
    )
  }

  // Для HLS используем наш защищенный плеер
  if (videoSource === 'hls') {
    return (
      <div className="relative">
        {showGeoInfo && userCountry && (
          <div className="absolute top-4 right-4 z-10 animate-in fade-in slide-in-from-top-2">
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" />
              {userCountry}
            </Badge>
          </div>
        )}
        <SecureVideoPlayer
          src={videoUrl}
          title={title}
          onProgress={onProgress}
          onComplete={onComplete}
          initialTime={initialTime}
          poster={poster}
        />
      </div>
    )
  }

  // Для VK и YouTube используем iframe
  return (
    <div className="relative aspect-video">
      {showGeoInfo && (
        <div className="absolute top-4 right-4 z-10 animate-in fade-in slide-in-from-top-2">
          <Badge variant="secondary" className="gap-1">
            <Globe className="h-3 w-3" />
            {videoSource === 'vk' ? 'VK Video' : 'YouTube'}
            {userCountry && ` • ${userCountry}`}
          </Badge>
        </div>
      )}
      
      <iframe
        src={videoUrl}
        className="w-full h-full rounded-lg"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={title || "Video player"}
        sandbox={
          videoSource === 'hls' 
            ? undefined // Наш контент - без sandbox
            : "allow-scripts allow-same-origin allow-presentation" // Внешний контент - с ограничениями
        }
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      
      {/* Эмулируем события для внешних плееров */}
      {(onProgress || onComplete) && (
        <VideoProgressTracker
          onProgress={onProgress}
          onComplete={onComplete}
          duration={0} // Для iframe мы не знаем длительность
        />
      )}
    </div>
  )
}

// Компонент для отслеживания прогресса в iframe (приблизительно)
function VideoProgressTracker({
  onProgress,
  onComplete,
  duration
}: {
  onProgress?: (progress: any) => void
  onComplete?: () => void
  duration: number
}) {
  useEffect(() => {
    if (!onProgress) return

    // Для iframe мы можем только приблизительно отслеживать время
    let currentTime = 0
    const interval = setInterval(() => {
      currentTime += 1
      onProgress({
        currentTime,
        duration: duration || 0,
        percentage: duration ? (currentTime / duration) * 100 : 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onProgress, duration])

  return null
}