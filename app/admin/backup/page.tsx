"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import logger from "@/lib/logger"

interface BackupItem {
  id: string
  name: string
  type: "full" | "incremental" | "database"
  size: string
  date: string
  status: "completed" | "failed" | "in_progress"
  location: "local" | "cloud"
}

const mockBackups: BackupItem[] = [
  {
    id: "1",
    name: "Полный бэкап системы",
    type: "full",
    size: "2.4 GB",
    date: "2024-01-20 03:00",
    status: "completed",
    location: "cloud",
  },
  {
    id: "2",
    name: "База данных клиентов",
    type: "database",
    size: "156 MB",
    date: "2024-01-20 02:00",
    status: "completed",
    location: "local",
  },
  {
    id: "3",
    name: "Инкрементальный бэкап",
    type: "incremental",
    size: "89 MB",
    date: "2024-01-19 23:00",
    status: "completed",
    location: "cloud",
  },
  {
    id: "4",
    name: "Медиа файлы",
    type: "full",
    size: "1.8 GB",
    date: "2024-01-19 01:00",
    status: "failed",
    location: "local",
  },
]

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>(mockBackups)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [backupLocation, setBackupLocation] = useState("cloud")
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)

  const createBackup = async (type: "full" | "incremental" | "database") => {
    setIsCreatingBackup(true)
    setBackupProgress(0)

    // Simulate backup creation
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsCreatingBackup(false)

          // Add new backup to list
          const newBackup: BackupItem = {
            id: Date.now().toString(),
            name: `${type === "full" ? "Полный" : type === "incremental" ? "Инкрементальный" : "База данных"} бэкап`,
            type,
            size: `${Math.floor(Math.random() * 1000) + 100} MB`,
            date: new Date().toLocaleString("ru-RU"),
            status: "completed",
            location: backupLocation as "local" | "cloud",
          }

          setBackups((prev) => [newBackup, ...prev])
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const restoreBackup = (backupId: string) => {
    // Simulate restore process
    logger.info("Restoring backup", { backupId })
  }

  const deleteBackup = (backupId: string) => {
    setBackups((prev) => prev.filter((backup) => backup.id !== backupId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "failed":
        return <AlertTriangle className="w-4 h-4" />
      case "in_progress":
        return <RefreshCw className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Бэкапы</CardTitle>
          <CardDescription>Управление бэкапами системы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-backup">Автоматический бэкап</Label>
              <Switch id="auto-backup" checked={autoBackupEnabled} onCheckedChange={setAutoBackupEnabled} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="backup-frequency">Частота бэкапов</Label>
              <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Выберите частоту" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="weekly">Еженедельно</SelectItem>
                  <SelectItem value="monthly">Ежемесячно</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="backup-location">Место хранения бэкапов</Label>
              <Select value={backupLocation} onValueChange={setBackupLocation}>
                <SelectTrigger id="backup-location">
                  <SelectValue placeholder="Выберите место хранения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Локально</SelectItem>
                  <SelectItem value="cloud">В облаке</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-4">
            <Button onClick={() => createBackup("full")}>Создать полный бэкап</Button>
            <Button onClick={() => createBackup("incremental")}>Создать инкрементальный бэкап</Button>
            <Button onClick={() => createBackup("database")}>Создать бэкап базы данных</Button>
          </div>
          {isCreatingBackup && (
            <div className="mb-4">
              <Progress value={backupProgress} />
            </div>
          )}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="completed">Завершенные</TabsTrigger>
              <TabsTrigger value="failed">Неудачные</TabsTrigger>
              <TabsTrigger value="in_progress">В процессе</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge>{backup.type}</Badge>
                    <span>{backup.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{backup.size}</span>
                    <span>{backup.date}</span>
                    {getStatusIcon(backup.status)}
                    <Button onClick={() => restoreBackup(backup.id)}>Восстановить</Button>
                    <Button onClick={() => deleteBackup(backup.id)}>Удалить</Button>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="completed">
              {backups
                .filter((backup) => backup.status === "completed")
                .map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge>{backup.type}</Badge>
                      <span>{backup.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{backup.size}</span>
                      <span>{backup.date}</span>
                      {getStatusIcon(backup.status)}
                      <Button onClick={() => restoreBackup(backup.id)}>Восстановить</Button>
                      <Button onClick={() => deleteBackup(backup.id)}>Удалить</Button>
                    </div>
                  </div>
                ))}
            </TabsContent>
            <TabsContent value="failed">
              {backups
                .filter((backup) => backup.status === "failed")
                .map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge>{backup.type}</Badge>
                      <span>{backup.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{backup.size}</span>
                      <span>{backup.date}</span>
                      {getStatusIcon(backup.status)}
                      <Button onClick={() => restoreBackup(backup.id)}>Восстановить</Button>
                      <Button onClick={() => deleteBackup(backup.id)}>Удалить</Button>
                    </div>
                  </div>
                ))}
            </TabsContent>
            <TabsContent value="in_progress">
              {backups
                .filter((backup) => backup.status === "in_progress")
                .map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge>{backup.type}</Badge>
                      <span>{backup.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{backup.size}</span>
                      <span>{backup.date}</span>
                      {getStatusIcon(backup.status)}
                      <Button onClick={() => restoreBackup(backup.id)}>Восстановить</Button>
                      <Button onClick={() => deleteBackup(backup.id)}>Удалить</Button>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
