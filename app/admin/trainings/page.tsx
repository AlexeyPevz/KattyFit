"use client"

import { useState } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  Users,
  Clock,
  Settings,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TrainingType {
  id: string
  name: string
  description: string
  duration: number
  price: number
  active: boolean
  isOnline: boolean
  maxStudents: number
}

interface TrainingPackage {
  id: string
  name: string
  description: string
  sessions: number
  price: number
  validDays: number
  discount: number
  active: boolean
}

const mockTrainingTypes: TrainingType[] = [
  {
    id: "1",
    name: "Персональная онлайн",
    description: "Индивидуальное занятие через Zoom",
    duration: 60,
    price: 2500,
    active: true,
    isOnline: true,
    maxStudents: 1,
  },
  {
    id: "2",
    name: "Персональная офлайн",
    description: "Индивидуальное занятие в студии",
    duration: 60,
    price: 3500,
    active: false,
    isOnline: false,
    maxStudents: 1,
  },
  {
    id: "3",
    name: "Групповая онлайн",
    description: "Групповое занятие через Zoom",
    duration: 60,
    price: 800,
    active: true,
    isOnline: true,
    maxStudents: 10,
  },
]

const mockPackages: TrainingPackage[] = [
  {
    id: "1",
    name: "Пакет 5 занятий",
    description: "Скидка 10% при покупке пакета",
    sessions: 5,
    price: 11250,
    validDays: 60,
    discount: 10,
    active: true,
  },
  {
    id: "2",
    name: "Пакет 10 занятий",
    description: "Скидка 15% при покупке пакета",
    sessions: 10,
    price: 21250,
    validDays: 90,
    discount: 15,
    active: true,
  },
  {
    id: "3",
    name: "Безлимит на месяц",
    description: "Безлимитные занятия в течение месяца",
    sessions: -1,
    price: 15000,
    validDays: 30,
    discount: 0,
    active: false,
  },
]

export default function TrainingsPage() {
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>(mockTrainingTypes)
  const [packages, setPackages] = useState<TrainingPackage[]>(mockPackages)
  const [showTypeDialog, setShowTypeDialog] = useState(false)
  const [showPackageDialog, setShowPackageDialog] = useState(false)
  const [editingType, setEditingType] = useState<TrainingType | null>(null)
  const [editingPackage, setEditingPackage] = useState<TrainingPackage | null>(null)

  // Форма для типов тренировок
  const [typeForm, setTypeForm] = useState({
    name: "",
    description: "",
    duration: 60,
    price: 2500,
    isOnline: true,
    maxStudents: 1,
  })

  // Форма для пакетов
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    sessions: 5,
    price: 0,
    validDays: 60,
    discount: 10,
  })

  const handleToggleType = (id: string) => {
    setTrainingTypes(types =>
      types.map(type =>
        type.id === id ? { ...type, active: !type.active } : type
      )
    )
  }

  const handleTogglePackage = (id: string) => {
    setPackages(packs =>
      packs.map(pack =>
        pack.id === id ? { ...pack, active: !pack.active } : pack
      )
    )
  }

  const handleSaveType = () => {
    if (editingType) {
      // Редактирование
      setTrainingTypes(types =>
        types.map(type =>
          type.id === editingType.id
            ? { ...type, ...typeForm }
            : type
        )
      )
    } else {
      // Создание нового
      const newType: TrainingType = {
        id: Date.now().toString(),
        ...typeForm,
        active: true,
      }
      setTrainingTypes([...trainingTypes, newType])
    }
    
    setShowTypeDialog(false)
    setEditingType(null)
    setTypeForm({
      name: "",
      description: "",
      duration: 60,
      price: 2500,
      isOnline: true,
      maxStudents: 1,
    })
  }

  const handleSavePackage = () => {
    if (editingPackage) {
      // Редактирование
      setPackages(packs =>
        packs.map(pack =>
          pack.id === editingPackage.id
            ? { ...pack, ...packageForm }
            : pack
        )
      )
    } else {
      // Создание нового
      const newPackage: TrainingPackage = {
        id: Date.now().toString(),
        ...packageForm,
        active: true,
      }
      setPackages([...packages, newPackage])
    }
    
    setShowPackageDialog(false)
    setEditingPackage(null)
    setPackageForm({
      name: "",
      description: "",
      sessions: 5,
      price: 0,
      validDays: 60,
      discount: 10,
    })
  }

  const calculatePackagePrice = (sessions: number, discount: number) => {
    const basePrice = 2500 // Базовая цена за занятие
    const totalPrice = sessions * basePrice
    return totalPrice - (totalPrice * discount / 100)
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Управление тренировками</h1>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8">
          <Tabs defaultValue="types" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="types" className="gap-2">
                <Users className="h-4 w-4" />
                Типы тренировок
              </TabsTrigger>
              <TabsTrigger value="packages" className="gap-2">
                <Package className="h-4 w-4" />
                Пакеты
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Календарь
              </TabsTrigger>
            </TabsList>

            {/* Типы тренировок */}
            <TabsContent value="types">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Типы тренировок</CardTitle>
                      <CardDescription>
                        Настройте доступные форматы занятий
                      </CardDescription>
                    </div>
                    <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Добавить тип
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingType ? "Редактировать" : "Добавить"} тип тренировки
                          </DialogTitle>
                          <DialogDescription>
                            Заполните информацию о типе тренировки
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Название</Label>
                            <Input
                              value={typeForm.name}
                              onChange={(e) =>
                                setTypeForm({ ...typeForm, name: e.target.value })
                              }
                              placeholder="Например: Персональная онлайн"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Описание</Label>
                            <Input
                              value={typeForm.description}
                              onChange={(e) =>
                                setTypeForm({ ...typeForm, description: e.target.value })
                              }
                              placeholder="Краткое описание"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Длительность (мин)</Label>
                              <Input
                                type="number"
                                value={typeForm.duration}
                                onChange={(e) =>
                                  setTypeForm({ ...typeForm, duration: parseInt(e.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Цена (₽)</Label>
                              <Input
                                type="number"
                                value={typeForm.price}
                                onChange={(e) =>
                                  setTypeForm({ ...typeForm, price: parseInt(e.target.value) })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={typeForm.isOnline}
                              onCheckedChange={(checked) =>
                                setTypeForm({ ...typeForm, isOnline: checked })
                              }
                            />
                            <Label>Онлайн формат</Label>
                          </div>
                          <div className="space-y-2">
                            <Label>Макс. количество участников</Label>
                            <Input
                              type="number"
                              value={typeForm.maxStudents}
                              onChange={(e) =>
                                setTypeForm({ ...typeForm, maxStudents: parseInt(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowTypeDialog(false)}>
                            Отмена
                          </Button>
                          <Button onClick={handleSaveType}>Сохранить</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Формат</TableHead>
                        <TableHead>Длительность</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Макс. участников</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{type.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={type.isOnline ? "default" : "secondary"}>
                              {type.isOnline ? "Онлайн" : "Офлайн"}
                            </Badge>
                          </TableCell>
                          <TableCell>{type.duration} мин</TableCell>
                          <TableCell>{type.price} ₽</TableCell>
                          <TableCell>{type.maxStudents}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={type.active}
                                onCheckedChange={() => handleToggleType(type.id)}
                              />
                              {type.active ? (
                                <Eye className="h-4 w-4 text-green-500" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingType(type)
                                setTypeForm({
                                  name: type.name,
                                  description: type.description,
                                  duration: type.duration,
                                  price: type.price,
                                  isOnline: type.isOnline,
                                  maxStudents: type.maxStudents,
                                })
                                setShowTypeDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("Удалить этот тип тренировки?")) {
                                  setTrainingTypes(types =>
                                    types.filter(t => t.id !== type.id)
                                  )
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Пакеты */}
            <TabsContent value="packages">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Пакеты тренировок</CardTitle>
                      <CardDescription>
                        Создайте выгодные предложения для клиентов
                      </CardDescription>
                    </div>
                    <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Добавить пакет
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingPackage ? "Редактировать" : "Добавить"} пакет
                          </DialogTitle>
                          <DialogDescription>
                            Создайте выгодное предложение
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Название</Label>
                            <Input
                              value={packageForm.name}
                              onChange={(e) =>
                                setPackageForm({ ...packageForm, name: e.target.value })
                              }
                              placeholder="Например: Пакет 5 занятий"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Описание</Label>
                            <Input
                              value={packageForm.description}
                              onChange={(e) =>
                                setPackageForm({ ...packageForm, description: e.target.value })
                              }
                              placeholder="Преимущества пакета"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Количество занятий</Label>
                              <Input
                                type="number"
                                value={packageForm.sessions}
                                onChange={(e) =>
                                  setPackageForm({ ...packageForm, sessions: parseInt(e.target.value) })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Срок действия (дней)</Label>
                              <Input
                                type="number"
                                value={packageForm.validDays}
                                onChange={(e) =>
                                  setPackageForm({ ...packageForm, validDays: parseInt(e.target.value) })
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Скидка (%)</Label>
                              <Input
                                type="number"
                                value={packageForm.discount}
                                onChange={(e) => {
                                  const discount = parseInt(e.target.value)
                                  setPackageForm({
                                    ...packageForm,
                                    discount,
                                    price: calculatePackagePrice(packageForm.sessions, discount)
                                  })
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Цена (₽)</Label>
                              <Input
                                type="number"
                                value={packageForm.price}
                                onChange={(e) =>
                                  setPackageForm({ ...packageForm, price: parseInt(e.target.value) })
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
                            Отмена
                          </Button>
                          <Button onClick={handleSavePackage}>Сохранить</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {packages.map((pack) => (
                      <Card key={pack.id} className={!pack.active ? "opacity-60" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{pack.name}</CardTitle>
                              <CardDescription>{pack.description}</CardDescription>
                            </div>
                            <Switch
                              checked={pack.active}
                              onCheckedChange={() => handleTogglePackage(pack.id)}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Занятий:</span>
                              <span className="font-medium">
                                {pack.sessions === -1 ? "Безлимит" : pack.sessions}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Действует:</span>
                              <span className="font-medium">{pack.validDays} дней</span>
                            </div>
                            {pack.discount > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Скидка:</span>
                                <Badge variant="secondary">{pack.discount}%</Badge>
                              </div>
                            )}
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-2xl font-bold">{pack.price} ₽</p>
                            {pack.sessions > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {Math.round(pack.price / pack.sessions)} ₽ за занятие
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setEditingPackage(pack)
                                setPackageForm({
                                  name: pack.name,
                                  description: pack.description,
                                  sessions: pack.sessions,
                                  price: pack.price,
                                  validDays: pack.validDays,
                                  discount: pack.discount,
                                })
                                setShowPackageDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("Удалить этот пакет?")) {
                                  setPackages(packs =>
                                    packs.filter(p => p.id !== pack.id)
                                  )
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Календарь */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Управление расписанием</CardTitle>
                  <CardDescription>
                    Настройте доступные слоты для записи
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Интеграция с Яндекс.Календарем
                    </p>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Настроить календарь
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}