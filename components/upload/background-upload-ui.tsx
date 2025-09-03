"use client"

import { useState, useEffect } from "react"
import { uploadManager } from "@/lib/background-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Pause, 
  Play, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  FileVideo
} from "lucide-react"
import { formatBytes, formatTime } from "@/lib/utils"

interface UploadItemProps {
  uploadId: string
}

function UploadItem({ uploadId }: UploadItemProps) {
  const [task, setTask] = useState(() => uploadManager.getUploadStatus(uploadId))
  const [speed, setSpeed] = useState(0)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  useEffect(() => {
    // Обновляем состояние только для активных загрузок
    if (task?.status === 'completed' || task?.status === 'failed') {
      return // Не нужно обновлять завершенные
    }
    
    const interval = setInterval(() => {
      const currentTask = uploadManager.getUploadStatus(uploadId)
      if (currentTask) {
        setTask(currentTask)
        
        // Останавливаем обновления если загрузка завершена
        if (currentTask.status === 'completed' || currentTask.status === 'failed') {
          clearInterval(interval)
        }
        
        // Рассчитываем скорость и оставшееся время
        // TODO: реализовать расчет скорости
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [uploadId, task?.status])

  if (!task) return null

  const handlePause = () => {
    uploadManager.pauseUpload(uploadId)
  }

  const handleResume = () => {
    uploadManager.resumeUpload(uploadId)
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Upload className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case 'uploading':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-muted rounded-lg">
            <FileVideo className="h-8 w-8" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{task.metadata.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(task.file.size)}
                </p>
              </div>
              
              <Badge className={`${getStatusColor()} text-white`}>
                {getStatusIcon()}
                <span className="ml-1">
                  {task.status === 'uploading' ? `${task.progress}%` : task.status}
                </span>
              </Badge>
            </div>

            {task.status === 'uploading' && (
              <>
                <Progress value={task.progress} className="h-2" />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {task.chunks.filter(c => c.uploaded).length} / {task.chunks.length} частей
                  </span>
                  
                  <div className="flex items-center gap-4">
                    {speed > 0 && (
                      <span>{formatBytes(speed)}/с</span>
                    )}
                    {remainingTime && (
                      <span>Осталось: {formatTime(remainingTime)}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePause}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Пауза
                  </Button>
                </div>
              </>
            )}

            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResume}
              >
                <Play className="h-4 w-4 mr-1" />
                Продолжить
              </Button>
            )}

            {task.status === 'failed' && (
              <div className="text-sm text-red-600">
                Ошибка загрузки. Попробуйте позже.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BackgroundUploadUI() {
  const [uploads, setUploads] = useState(() => uploadManager.getAllUploads())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isMobile, setIsMobile] = useState(false)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  useEffect(() => {
    // Проверяем тип устройства
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))

    // Слушаем события загрузки
    const handleProgress = (event: any) => {
      setUploads(uploadManager.getAllUploads())
    }

    const handleComplete = (event: any) => {
      setUploads(uploadManager.getAllUploads())
    }

    const handleError = (event: any) => {
      setUploads(uploadManager.getAllUploads())
    }

    window.addEventListener('upload-progress', handleProgress)
    window.addEventListener('upload-complete', handleComplete)
    window.addEventListener('upload-error', handleError)

    // Мониторим состояние сети
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Проверяем уровень батареи (для мобильных)
    let batteryManager: any = null
    const handleBatteryChange = () => {
      if (batteryManager) {
        setBatteryLevel(batteryManager.level * 100)
      }
    }
    
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryManager = battery
        setBatteryLevel(battery.level * 100)
        battery.addEventListener('levelchange', handleBatteryChange)
      })
    }

    return () => {
      window.removeEventListener('upload-progress', handleProgress)
      window.removeEventListener('upload-complete', handleComplete)
      window.removeEventListener('upload-error', handleError)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      // Очищаем battery listener
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', handleBatteryChange)
      }
    }
  }, [])

  const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'pending')
  const completedUploads = uploads.filter(u => u.status === 'completed')

  if (uploads.length === 0) return null

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[500px] overflow-hidden shadow-lg z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Загрузки ({uploads.length})</span>
          
          <div className="flex items-center gap-2">
            {isMobile && (
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            )}
            
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            
            {batteryLevel !== null && batteryLevel < 20 && (
              <div className="flex items-center gap-1 text-orange-500">
                <Battery className="h-4 w-4" />
                <span className="text-xs">{Math.round(batteryLevel)}%</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        {!isOnline && (
          <div className="p-4 bg-orange-50 text-orange-800 text-sm">
            <WifiOff className="h-4 w-4 inline mr-2" />
            Нет соединения. Загрузка продолжится при восстановлении связи.
          </div>
        )}

        {batteryLevel !== null && batteryLevel < 20 && (
          <div className="p-4 bg-yellow-50 text-yellow-800 text-sm">
            <Battery className="h-4 w-4 inline mr-2" />
            Низкий заряд батареи. Загрузка может быть приостановлена.
          </div>
        )}

        <div className="p-4">
          {activeUploads.map(upload => (
            <UploadItem key={upload.id} uploadId={upload.id} />
          ))}
          
          {completedUploads.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-muted-foreground mb-2">
                Завершенные
              </h5>
              {completedUploads.slice(0, 3).map(upload => (
                <UploadItem key={upload.id} uploadId={upload.id} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}