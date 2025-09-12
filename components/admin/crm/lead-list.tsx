"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  MoreVertical,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { Lead, LeadActivity } from "./types"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

interface LeadListProps {
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
  onLeadDelete: (leadId: string) => void
  onAddActivity: (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'createdAt'>) => void
  isLoading?: boolean
}

const STAGE_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  customer: "bg-emerald-100 text-emerald-800"
}

const STAGE_LABELS = {
  new: "Новый",
  contacted: "Связались",
  qualified: "Квалифицирован",
  proposal: "Предложение",
  negotiation: "Переговоры",
  customer: "Клиент"
}

const SOURCE_LABELS = {
  website: "Сайт",
  instagram: "Instagram",
  vk: "VK",
  telegram: "Telegram",
  referral: "Реферал"
}

export function LeadListComponent({ 
  leads, 
  onLeadUpdate, 
  onLeadDelete, 
  onAddActivity,
  isLoading = false 
}: LeadListProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false)
  const [activityDescription, setActivityDescription] = useState("")

  const handleStageChange = (leadId: string, newStage: Lead['stage']) => {
    onLeadUpdate(leadId, { stage: newStage })
  }

  const handleAddActivity = () => {
    if (selectedLead && activityDescription.trim()) {
      onAddActivity(selectedLead.id, {
        type: 'note',
        description: activityDescription.trim(),
        source: 'admin'
      })
      setActivityDescription("")
      setIsActivityDialogOpen(false)
      setSelectedLead(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Лиды не найдены
            </h3>
            <p className="text-gray-500 mb-4">
              Попробуйте изменить фильтры или добавить новых лидов
            </p>
            <Button>Добавить лида</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getInitials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {lead.name}
                      </h3>
                      <div className={`flex items-center space-x-1 ${getScoreColor(lead.score)}`}>
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-medium">{lead.score}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{lead.email}</span>
                      </span>
                      {lead.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{lead.value.toLocaleString()} ₽</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={STAGE_COLORS[lead.stage]}
                      >
                        {STAGE_LABELS[lead.stage]}
                      </Badge>
                      <Badge variant="outline">
                        {SOURCE_LABELS[lead.source]}
                      </Badge>
                      {lead.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(lead.createdAt), 'dd.MM.yyyy', { locale: ru })}
                      </span>
                    </div>
                    {lead.lastContact && (
                      <div className="text-xs">
                        Последний контакт: {format(new Date(lead.lastContact), 'dd.MM', { locale: ru })}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Просмотр
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setIsActivityDialogOpen(true)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Добавить заметку
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onLeadDelete(lead.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить заметку</DialogTitle>
            <DialogDescription>
              Добавьте заметку для лида {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="activity-description">Описание</Label>
              <Textarea
                id="activity-description"
                placeholder="Введите описание активности..."
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsActivityDialogOpen(false)
                setActivityDescription("")
                setSelectedLead(null)
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleAddActivity}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
