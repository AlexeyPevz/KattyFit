// React хук для работы с DI контейнером
// Позволяет использовать сервисы в React компонентах

import { useMemo } from 'react'
import { getService } from '@/lib/di/setup'
import { ServiceMap } from '@/lib/di/services'

/**
 * Хук для получения сервиса из DI контейнера
 * @param serviceName - Имя сервиса
 * @returns Экземпляр сервиса
 */
export function useService<T extends keyof ServiceMap>(serviceName: T): ServiceMap[T] {
  return useMemo(() => {
    return getService(serviceName) as ServiceMap[T]
  }, [serviceName])
}

/**
 * Хук для получения нескольких сервисов одновременно
 * @param serviceNames - Массив имен сервисов
 * @returns Объект с сервисами
 */
export function useServices<T extends (keyof ServiceMap)[]>(
  serviceNames: T
): { [K in T[number]]: ServiceMap[K] } {
  return useMemo(() => {
    const services = {} as any
    
    serviceNames.forEach(name => {
      services[name] = getService(name)
    })
    
    return services as { [K in T[number]]: ServiceMap[K] }
  }, serviceNames)
}

/**
 * Хук для получения логгера
 */
export function useLogger() {
  return useService('logger')
}

/**
 * Хук для получения сервиса аутентификации
 */
export function useAuth() {
  return useService('authService')
}

/**
 * Хук для получения сервиса валидации
 */
export function useValidation() {
  return useService('validationService')
}

/**
 * Хук для получения сервиса кеширования
 */
export function useCache() {
  return useService('cacheService')
}

/**
 * Хук для получения сервиса аналитики
 */
export function useAnalytics() {
  return useService('analyticsService')
}

/**
 * Хук для получения сервиса уведомлений
 */
export function useNotifications() {
  return useService('notificationService')
}

/**
 * Хук для получения сервиса файлов
 */
export function useFileService() {
  return useService('fileService')
}

/**
 * Хук для получения сервиса email
 */
export function useEmail() {
  return useService('emailService')
}

/**
 * Хук для получения сервиса шифрования
 */
export function useEncryption() {
  return useService('encryptionService')
}

/**
 * Хук для получения сервиса конфигурации
 */
export function useConfig() {
  return useService('configService')
}

/**
 * Хук для получения сервиса ошибок
 */
export function useErrorService() {
  return useService('errorService')
}

/**
 * Хук для получения API сервиса
 */
export function useAPI() {
  return useService('apiService')
}