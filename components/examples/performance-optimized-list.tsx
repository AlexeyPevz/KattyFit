'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  useOptimizedSearch, 
  useVirtualScroll, 
  usePerformanceMonitor,
  useDebounce,
  useThrottle
} from '@/lib/performance-optimizations'

interface ListItem {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
}

// Генерация тестовых данных
const generateTestData = (count: number): ListItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    status: ['active', 'inactive', 'pending'][index % 3] as ListItem['status'],
    createdAt: new Date(Date.now() - Math.random() * 10000000000)
  }))
}

interface OptimizedListProps {
  itemCount?: number
  showPerformanceInfo?: boolean
}

export function OptimizedListComponent({ 
  itemCount = 1000, 
  showPerformanceInfo = true 
}: OptimizedListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [sortBy, setSortBy] = useState<keyof ListItem>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Мониторинг производительности
  const { renderCount } = usePerformanceMonitor('OptimizedList')
  
  // Генерация данных (мемоизировано)
  const allItems = useMemo(() => generateTestData(itemCount), [itemCount])
  
  // Оптимизированный поиск
  const filteredItems = useOptimizedSearch(
    allItems,
    searchTerm,
    ['name', 'email'],
    300 // debounce delay
  )
  
  // Фильтрация по статусу
  const statusFilteredItems = useMemo(() => {
    if (!selectedStatus) return filteredItems
    return filteredItems.filter(item => item.status === selectedStatus)
  }, [filteredItems, selectedStatus])
  
  // Сортировка
  const sortedItems = useMemo(() => {
    return [...statusFilteredItems].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [statusFilteredItems, sortBy, sortOrder])
  
  // Виртуальная прокрутка
  const {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  } = useVirtualScroll(sortedItems, 60, 400, 5)
  
  // Обработчики событий (мемоизированы)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])
  
  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status === selectedStatus ? '' : status)
  }, [selectedStatus])
  
  const handleSort = useCallback((field: keyof ListItem) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }, [sortBy])
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [setScrollTop])
  
  // Throttled scroll handler для лучшей производительности
  const throttledScrollHandler = useThrottle(handleScroll as (...args: unknown[]) => unknown, 16) // ~60fps
  
  const getStatusColor = (status: ListItem['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Заголовок с информацией о производительности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Оптимизированный список
            {showPerformanceInfo && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Рендеров: {renderCount}</span>
                <span>Всего элементов: {allItems.length}</span>
                <span>Отфильтровано: {sortedItems.length}</span>
                <span>Видимых: {visibleItems.length}</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Поиск */}
          <div>
            <Input
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
          </div>
          
          {/* Фильтры */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('active')}
            >
              Активные ({allItems.filter(item => item.status === 'active').length})
            </Button>
            <Button
              variant={selectedStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('inactive')}
            >
              Неактивные ({allItems.filter(item => item.status === 'inactive').length})
            </Button>
            <Button
              variant={selectedStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange('pending')}
            >
              Ожидающие ({allItems.filter(item => item.status === 'pending').length})
            </Button>
          </div>
          
          {/* Сортировка */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Сортировка:</span>
            {(['name', 'email', 'status', 'createdAt'] as const).map(field => (
              <Button
                key={field}
                variant={sortBy === field ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort(field)}
              >
                {field} {sortBy === field && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Виртуальный список */}
      <Card>
        <CardContent className="p-0">
          <div
            className="overflow-auto"
            style={{ height: '400px' }}
            onScroll={throttledScrollHandler}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50"
                    style={{ height: '60px' }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.email}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {item.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
