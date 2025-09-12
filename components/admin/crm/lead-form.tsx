"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Lead, LeadFormData } from "./types"

interface LeadFormProps {
  lead?: Lead | null
  isOpen: boolean
  onClose: () => void
  onSave: (leadData: LeadFormData) => void
  isLoading?: boolean
}

const STAGE_OPTIONS = [
  { value: "new", label: "Новый" },
  { value: "contacted", label: "Связались" },
  { value: "qualified", label: "Квалифицирован" },
  { value: "proposal", label: "Предложение" },
  { value: "negotiation", label: "Переговоры" },
  { value: "customer", label: "Клиент" }
]

const SOURCE_OPTIONS = [
  { value: "website", label: "Сайт" },
  { value: "instagram", label: "Instagram" },
  { value: "vk", label: "VK" },
  { value: "telegram", label: "Telegram" },
  { value: "referral", label: "Реферал" }
]

const PREDEFINED_TAGS = [
  "VIP",
  "Горячий",
  "Холодный",
  "Повторный",
  "Корпоративный",
  "Частный"
]

export function LeadFormComponent({ 
  lead, 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false 
}: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    source: "website",
    stage: "new",
    value: 0,
    tags: [],
    notes: ""
  })
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        source: lead.source,
        stage: lead.stage,
        value: lead.value,
        tags: lead.tags,
        notes: lead.notes
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        source: "website",
        stage: "new",
        value: 0,
        tags: [],
        notes: ""
      })
    }
    setErrors({})
  }, [lead, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email"
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Некорректный номер телефона"
    }

    if (formData.value < 0) {
      newErrors.value = "Стоимость не может быть отрицательной"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleInputChange = (field: keyof LeadFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handlePredefinedTagAdd = (tag: string) => {
    handleTagAdd(tag)
  }

  const handleCustomTagAdd = () => {
    if (newTag.trim()) {
      handleTagAdd(newTag.trim())
      setNewTag("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lead ? "Редактировать лида" : "Добавить нового лида"}
          </DialogTitle>
          <DialogDescription>
            {lead 
              ? "Внесите изменения в информацию о лиде"
              : "Заполните информацию о новом лиде"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите имя"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Введите email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Введите телефон"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Источник</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleInputChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <Label htmlFor="stage">Этап</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleInputChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">Стоимость (₽)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => handleInputChange('value', Number(e.target.value))}
                placeholder="0"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Теги</Label>
            <div className="space-y-2">
              {/* Predefined Tags */}
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handlePredefinedTagAdd(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Добавить свой тег"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCustomTagAdd()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCustomTagAdd}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleTagRemove(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительная информация о лиде"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : lead ? "Сохранить изменения" : "Добавить лида"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
