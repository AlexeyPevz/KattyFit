"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Copy,
  Trash,
  Tag,
  Percent,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import logger from "@/lib/logger"

interface Promocode {
  id: string
  code: string
  discount_percent: number
  max_uses: number | null
  usage_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
}

export default function PromocodesPage() {
  const [promocodes, setPromocodes] = useState<Promocode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPromocode, setNewPromocode] = useState({
    code: '',
    discount_percent: 10,
    max_uses: null as number | null,
    valid_until: '',
  })

  useEffect(() => {
    loadPromocodes()
  }, [])

  const loadPromocodes = async () => {
    try {
      const response = await fetch('/api/admin/promocodes')
      if (response.ok) {
        const data = await response.json()
        setPromocodes(data.promocodes || [])
      }
    } catch (error) {
      logger.error('Error loading promocodes', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const createPromocode = async () => {
    try {
      const response = await fetch('/api/admin/promocodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPromocode,
          max_uses: newPromocode.max_uses || undefined,
          valid_until: newPromocode.valid_until || undefined,
        })
      })

      if (response.ok) {
        toast({
          title: "Промокод создан",
          description: `Промокод ${newPromocode.code} успешно создан`,
        })
        setShowCreateDialog(false)
        setNewPromocode({ code: '', discount_percent: 10, max_uses: null, valid_until: '' })
        loadPromocodes()
      } else {
        const error = await response.json()
        toast({
          title: "Ошибка",
          description: error.error || "Не удалось создать промокод",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании промокода",
        variant: "destructive"
      })
    }
  }

  const togglePromocode = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/promocodes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      })

      if (response.ok) {
        loadPromocodes()
        toast({
          title: isActive ? "Промокод активирован" : "Промокод деактивирован",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус промокода",
        variant: "destructive"
      })
    }
  }

  const deletePromocode = async (id: string) => {
    if (!confirm('Удалить этот промокод?')) return

    try {
      const response = await fetch(`/api/admin/promocodes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadPromocodes()
        toast({
          title: "Промокод удален",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить промокод",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Скопировано",
      description: `Промокод ${code} скопирован в буфер обмена`,
    })
  }

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPromocode({ ...newPromocode, code })
  }

  const stats = {
    total: promocodes.length,
    active: promocodes.filter(p => p.is_active).length,
    used: promocodes.reduce((sum, p) => sum + p.usage_count, 0),
    revenue: promocodes.reduce((sum, p) => sum + (p.usage_count * p.discount_percent), 0)
  }

  return (
    <AdminGuard>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Промокоды</h1>
            <p className="text-muted-foreground">Управление скидками и специальными предложениями</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать промокод
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый промокод</DialogTitle>
                <DialogDescription>
                  Создайте промокод для предоставления скидок клиентам
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Код промокода</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={newPromocode.code}
                      onChange={(e) => setNewPromocode({ ...newPromocode, code: e.target.value.toUpperCase() })}
                      placeholder="SUMMER2024"
                      maxLength={20}
                    />
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      Сгенерировать
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Скидка (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={newPromocode.discount_percent}
                    onChange={(e) => setNewPromocode({ ...newPromocode, discount_percent: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Максимум использований</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={newPromocode.max_uses || ''}
                    onChange={(e) => setNewPromocode({ ...newPromocode, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Без ограничений"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Действителен до</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={newPromocode.valid_until}
                    onChange={(e) => setNewPromocode({ ...newPromocode, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={createPromocode} disabled={!newPromocode.code}>
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Статистика */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего промокодов</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} активных
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Использований</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.used}</div>
              <p className="text-xs text-muted-foreground">
                За все время
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средняя скидка</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promocodes.length > 0 
                  ? Math.round(promocodes.reduce((sum, p) => sum + p.discount_percent, 0) / promocodes.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                По всем промокодам
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Экономия клиентов</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₽{stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Примерная сумма
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Таблица промокодов */}
        <Card>
          <CardHeader>
            <CardTitle>Список промокодов</CardTitle>
            <CardDescription>
              Все созданные промокоды и их статистика
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Загрузка...</div>
            ) : promocodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Промокодов пока нет</p>
                <p className="text-sm mt-2">Создайте первый промокод для привлечения клиентов</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Код</TableHead>
                    <TableHead>Скидка</TableHead>
                    <TableHead>Использований</TableHead>
                    <TableHead>Действителен до</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promocodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono font-medium">
                        {promo.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          -{promo.discount_percent}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {promo.usage_count}
                        {promo.max_uses && ` / ${promo.max_uses}`}
                      </TableCell>
                      <TableCell>
                        {promo.valid_until ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(promo.valid_until), 'd MMM yyyy', { locale: ru })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Бессрочно</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={promo.is_active}
                          onCheckedChange={(checked) => togglePromocode(promo.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(promo.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePromocode(promo.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Подсказка */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Советы по промокодам</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Используйте легко запоминающиеся коды (например, YOGA20)</li>
                  <li>Ограничивайте срок действия для создания срочности</li>
                  <li>Создавайте персональные промокоды для VIP-клиентов</li>
                  <li>Отслеживайте эффективность каждого промокода</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}
