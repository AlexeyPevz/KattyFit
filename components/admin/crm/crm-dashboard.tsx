"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, UserPlus, BarChart3, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { CRMStatsComponent, CRMConversionStats } from "./crm-stats"
import { LeadFiltersComponent } from "./lead-filters"
import { LeadListComponent } from "./lead-list"
import { LeadFormComponent } from "./lead-form"
import { Lead, LeadFilters, LeadFormData, LeadActivity, CRMStats } from "./types"
import logger from "@/lib/logger"

interface CRMDashboardProps {
  initialLeads?: Lead[]
  initialStats?: CRMStats
}

export function CRMDashboardComponent({ 
  initialLeads = [], 
  initialStats = {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    customers: 0,
    conversionRate: 0,
    averageValue: 0,
    monthlyGrowth: 0
  }
}: CRMDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [stats, setStats] = useState<CRMStats>(initialStats)
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    stage: "",
    source: "",
    dateFrom: "",
    dateTo: "",
    tags: []
  })
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Filter leads based on current filters - memoized for performance
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !filters.search || 
        lead.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        lead.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        (lead.phone && lead.phone.includes(filters.search))

      const matchesStage = !filters.stage || lead.stage === filters.stage
      const matchesSource = !filters.source || lead.source === filters.source

      const matchesDateFrom = !filters.dateFrom || 
        new Date(lead.createdAt) >= new Date(filters.dateFrom)
      
      const matchesDateTo = !filters.dateTo || 
        new Date(lead.createdAt) <= new Date(filters.dateTo)

      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => lead.tags.includes(tag))

      return matchesSearch && matchesStage && matchesSource && 
             matchesDateFrom && matchesDateTo && matchesTags
    })
  }, [leads, filters])

  // Load leads and stats
  useEffect(() => {
    loadLeads()
    loadStats()
  }, [loadLeads, loadStats])

  const loadLeads = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/crm/leads')
      const data = await response.json()
      
      if (data.success) {
        setLeads(data.data)
      } else {
        logger.error('Failed to load leads', { error: data.error })
      }
    } catch (error) {
      logger.error('Error loading leads', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/crm/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      } else {
        logger.error('Failed to load CRM stats', { error: data.error })
      }
    } catch (error) {
      logger.error('Error loading CRM stats', { error: error instanceof Error ? error.message : String(error) })
    }
  }, [])

  const handleLeadSave = useCallback(async (leadData: LeadFormData) => {
    try {
      setIsLoading(true)
      
      const url = editingLead ? `/api/crm/leads/${editingLead.id}` : '/api/crm/leads'
      const method = editingLead ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (editingLead) {
          setLeads(prev => prev.map(lead => 
            lead.id === editingLead.id ? { ...lead, ...leadData } : lead
          ))
        } else {
          setLeads(prev => [...prev, data.data])
        }
        
        setIsLeadFormOpen(false)
        setEditingLead(null)
        await loadStats() // Refresh stats
        logger.info('Lead saved successfully', { leadId: data.data.id })
      } else {
        logger.error('Failed to save lead', { error: data.error })
      }
    } catch (error) {
      logger.error('Error saving lead', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsLoading(false)
    }
  }, [editingLead, loadStats])

  const handleLeadUpdate = useCallback(async (leadId: string, updates: Partial<Lead>) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLeads(prev => prev.map(lead => 
          lead.id === leadId ? { ...lead, ...updates } : lead
        ))
        await loadStats() // Refresh stats
        logger.info('Lead updated successfully', { leadId })
      } else {
        logger.error('Failed to update lead', { error: data.error })
      }
    } catch (error) {
      logger.error('Error updating lead', { error: error instanceof Error ? error.message : String(error) })
    }
  }, [loadStats])

  const handleLeadDelete = useCallback(async (leadId: string) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLeads(prev => prev.filter(lead => lead.id !== leadId))
        await loadStats() // Refresh stats
        logger.info('Lead deleted successfully', { leadId })
      } else {
        logger.error('Failed to delete lead', { error: data.error })
      }
    } catch (error) {
      logger.error('Error deleting lead', { error: error instanceof Error ? error.message : String(error) })
    }
  }, [loadStats])

  const handleAddActivity = useCallback(async (leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'createdAt'>) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activity)
      })
      
      const data = await response.json()
      
      if (data.success) {
        logger.info('Activity added successfully', { leadId, activityId: data.data.id })
      } else {
        logger.error('Failed to add activity', { error: data.error })
      }
    } catch (error) {
      logger.error('Error adding activity', { error: error instanceof Error ? error.message : String(error) })
    }
  }, [])

  const handleFiltersChange = useCallback((newFilters: LeadFilters) => {
    setFilters(newFilters)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      stage: "",
      source: "",
      dateFrom: "",
      dateTo: "",
      tags: []
    })
  }, [])

  const handleEditLead = useCallback((lead: Lead) => {
    setEditingLead(lead)
    setIsLeadFormOpen(true)
  }, [])

  const handleAddLead = useCallback(() => {
    setEditingLead(null)
    setIsLeadFormOpen(true)
  }, [])

  return (
    <AdminGuard>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">CRM</h1>
              <p className="text-muted-foreground">
                Управление лидами и клиентами
              </p>
            </div>
          </div>
          <Button onClick={handleAddLead}>
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить лида
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Лиды</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Активности</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <CRMStatsComponent stats={stats} isLoading={isLoading} />
            <CRMConversionStats stats={stats} />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Фильтры</CardTitle>
                <CardDescription>
                  Найдите нужных лидов с помощью фильтров
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadFiltersComponent
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Лиды ({filteredLeads.length})</CardTitle>
                <CardDescription>
                  Список всех лидов с возможностью управления
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadListComponent
                  leads={filteredLeads}
                  onLeadUpdate={handleLeadUpdate}
                  onLeadDelete={handleLeadDelete}
                  onAddActivity={handleAddActivity}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Активности</CardTitle>
                <CardDescription>
                  История взаимодействий с лидами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Функция активностей в разработке
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lead Form Modal */}
        <LeadFormComponent
          lead={editingLead}
          isOpen={isLeadFormOpen}
          onClose={() => {
            setIsLeadFormOpen(false)
            setEditingLead(null)
          }}
          onSave={handleLeadSave}
          isLoading={isLoading}
        />
      </div>
    </AdminGuard>
  )
}