"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { LeadFilters } from "./types"

interface LeadFiltersProps {
  filters: LeadFilters
  onFiltersChange: (filters: LeadFilters) => void
  onClearFilters: () => void
}

const STAGE_OPTIONS = [
  { value: "", label: "Все этапы" },
  { value: "new", label: "Новые" },
  { value: "contacted", label: "Связались" },
  { value: "qualified", label: "Квалифицированы" },
  { value: "proposal", label: "Предложение" },
  { value: "negotiation", label: "Переговоры" },
  { value: "customer", label: "Клиенты" }
]

const SOURCE_OPTIONS = [
  { value: "", label: "Все источники" },
  { value: "website", label: "Сайт" },
  { value: "instagram", label: "Instagram" },
  { value: "vk", label: "VK" },
  { value: "telegram", label: "Telegram" },
  { value: "referral", label: "Рефералы" }
]

const TAG_OPTIONS = [
  "VIP",
  "Горячий",
  "Холодный",
  "Повторный",
  "Корпоративный",
  "Частный"
]

export function LeadFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: LeadFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false)

  const handleFilterChange = (key: keyof LeadFilters, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    
    handleFilterChange('tags', newTags)
  }

  const hasActiveFilters = 
    filters.search ||
    filters.stage ||
    filters.source ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.tags.length > 0

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по имени, email, телефону..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.stage}
            onValueChange={(value) => handleFilterChange('stage', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Этап" />
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.source}
            onValueChange={(value) => handleFilterChange('source', value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Источник" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Очистить
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Date Range */}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom && filters.dateTo
                ? `${format(new Date(filters.dateFrom), 'dd.MM.yyyy', { locale: ru })} - ${format(new Date(filters.dateTo), 'dd.MM.yyyy', { locale: ru })}`
                : "Выберите даты"
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                to: filters.dateTo ? new Date(filters.dateTo) : undefined
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleFilterChange('dateFrom', range.from.toISOString().split('T')[0])
                  handleFilterChange('dateTo', range.to.toISOString().split('T')[0])
                }
                setIsDatePickerOpen(false)
              }}
              locale={ru}
            />
          </PopoverContent>
        </Popover>

        {/* Tags */}
        <Popover open={isTagPickerOpen} onOpenChange={setIsTagPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <Filter className="mr-2 h-4 w-4" />
              Теги ({filters.tags.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Выберите теги</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Поиск: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('search', '')}
              />
            </Badge>
          )}
          
          {filters.stage && (
            <Badge variant="secondary" className="gap-1">
              Этап: {STAGE_OPTIONS.find(o => o.value === filters.stage)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('stage', '')}
              />
            </Badge>
          )}
          
          {filters.source && (
            <Badge variant="secondary" className="gap-1">
              Источник: {SOURCE_OPTIONS.find(o => o.value === filters.source)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('source', '')}
              />
            </Badge>
          )}
          
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}