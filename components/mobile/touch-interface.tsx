"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"

interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  disabled?: boolean
}

export function TouchButton({
  children,
  onClick,
  variant = "default",
  size = "lg",
  className,
  disabled = false,
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const sizeClasses = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg min-w-[120px]",
    xl: "h-16 px-10 text-xl min-w-[140px]",
  }

  const variantClasses = {
    default: "bg-background border-2 border-border text-foreground hover:bg-muted",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 yoga-gradient",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-muted text-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }

  return (
    <Button
      className={cn(
        "rounded-xl font-semibold transition-all duration-150 active:scale-95 touch-manipulation",
        sizeClasses[size],
        variantClasses[variant],
        isPressed && "scale-95 brightness-90",
        className,
      )}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className }: SwipeableCardProps) {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const threshold = 100
    if (currentX > threshold && onSwipeRight) {
      onSwipeRight()
    } else if (currentX < -threshold && onSwipeLeft) {
      onSwipeLeft()
    }

    setCurrentX(0)
    setIsDragging(false)
  }

  return (
    <Card
      className={cn("transition-transform duration-200 touch-manipulation", className)}
      style={{
        transform: isDragging ? `translateX(${currentX}px)` : "translateX(0px)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Card>
  )
}

interface MobileVideoPlayerProps {
  src: string
  poster?: string
  title?: string
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export function MobileVideoPlayer({
  src,
  poster,
  title,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: MobileVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        className="w-full h-full object-cover"
        poster={poster}
        muted={isMuted}
        onClick={() => setShowControls(!showControls)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-black/30 text-white hover:bg-black/50"
            >
              <Maximize className="w-5 h-5" />
            </TouchButton>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <TouchButton
              variant="ghost"
              size="xl"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-black/30 text-white hover:bg-black/50 rounded-full w-20 h-20"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </TouchButton>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {hasPrevious && (
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  className="bg-black/30 text-white hover:bg-black/50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </TouchButton>
              )}

              <TouchButton
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="bg-black/30 text-white hover:bg-black/50"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </TouchButton>
            </div>

            {hasNext && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="bg-black/30 text-white hover:bg-black/50"
              >
                <ChevronRight className="w-5 h-5" />
              </TouchButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
