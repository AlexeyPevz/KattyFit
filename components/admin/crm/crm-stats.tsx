"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  BarChart3
} from "lucide-react"
import { CRMStats } from "./types"

interface CRMStatsProps {
  stats: CRMStats
  isLoading?: boolean
}

export function CRMStatsComponent({ stats, isLoading = false }: CRMStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Всего лидов",
      value: stats.totalLeads,
      description: "Общее количество",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Новые лиды",
      value: stats.newLeads,
      description: "За последний месяц",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Квалифицированные",
      value: stats.qualifiedLeads,
      description: "Готовы к продаже",
      icon: Activity,
      color: "text-yellow-600"
    },
    {
      title: "Клиенты",
      value: stats.customers,
      description: "Успешные продажи",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function CRMConversionStats({ stats }: { stats: CRMStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Конверсия
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Лиды → Клиенты
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Средний чек
          </CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageValue.toLocaleString()} ₽
          </div>
          <p className="text-xs text-muted-foreground">
            За последний месяц
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Рост
          </CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
          </div>
          <p className="text-xs text-muted-foreground">
            За последний месяц
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
