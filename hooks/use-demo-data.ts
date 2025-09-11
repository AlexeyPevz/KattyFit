"use client"

import { useState, useEffect } from "react"

interface DemoDataStatus {
  hasRealLessons: boolean
  hasRealUsers: boolean
  hasRealCourses: boolean
  hasRealBookings: boolean
  isLoading: boolean
}

export function useDemoData() {
  const [status, setStatus] = useState<DemoDataStatus>({
    hasRealLessons: false,
    hasRealUsers: false,
    hasRealCourses: false,
    hasRealBookings: false,
    isLoading: true,
  })

  useEffect(() => {
    checkRealData()
  }, [])

  const checkRealData = async () => {
    try {
      const response = await fetch('/api/demo-data/status')
      if (response.ok) {
        const data = await response.json()
        setStatus({
          hasRealLessons: data.hasRealLessons || false,
          hasRealUsers: data.hasRealUsers || false,
          hasRealCourses: data.hasRealCourses || false,
          hasRealBookings: data.hasRealBookings || false,
          isLoading: false,
        })
      } else {
        // Fallback - считаем что есть только демо данные
        setStatus({
          hasRealLessons: false,
          hasRealUsers: false,
          hasRealCourses: false,
          hasRealBookings: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Ошибка проверки демо данных:', error)
      setStatus({
        hasRealLessons: false,
        hasRealUsers: false,
        hasRealCourses: false,
        hasRealBookings: false,
        isLoading: false,
      })
    }
  }

  const shouldShowDemo = (type: keyof Omit<DemoDataStatus, 'isLoading'> | 'users' | 'courses' | 'bookings' | 'lessons') => {
    switch (type) {
      case 'users': return !status.hasRealUsers
      case 'courses': return !status.hasRealCourses  
      case 'bookings': return !status.hasRealBookings
      case 'lessons': return !status.hasRealLessons
      default: return !status[type as keyof Omit<DemoDataStatus, 'isLoading'>]
    }
  }

  return {
    ...status,
    shouldShowDemo,
    refresh: checkRealData,
  }
}
