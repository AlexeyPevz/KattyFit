// Настройка DI контейнера
// Регистрирует все сервисы и их зависимости

import { container } from './container'
import { ServiceMap } from './services'
import {
  LoggerService,
  AuthService,
  EmailService,
  FileService,
  CacheService,
  AnalyticsService,
  NotificationService,
  ValidationService,
  EncryptionService,
  ConfigService,
  ErrorService,
  APIService
} from './implementations'

/**
 * Настраивает DI контейнер со всеми сервисами
 */
export function setupDIContainer(): void {
  // Очищаем контейнер перед настройкой
  container.clear()

  // Регистрируем сервисы в правильном порядке (зависимости сначала)
  
  // 1. Базовые сервисы без зависимостей
  container.registerClass('logger', LoggerService, { singleton: true })
  container.registerClass('configService', ConfigService, { singleton: true })
  container.registerClass('validationService', ValidationService, { singleton: true })
  container.registerClass('encryptionService', EncryptionService, { singleton: true })
  container.registerClass('cacheService', CacheService, { singleton: true })
  container.registerClass('apiService', APIService, { singleton: true })

  // 2. Сервисы с базовыми зависимостями
  container.registerClass('authService', AuthService, { singleton: true })
  container.registerClass('emailService', EmailService, { singleton: true })
  container.registerClass('fileService', FileService, { singleton: true })
  container.registerClass('analyticsService', AnalyticsService, { singleton: true })
  container.registerClass('notificationService', NotificationService, { singleton: true })
  container.registerClass('errorService', ErrorService, { singleton: true })

  // Инициализируем конфигурацию
  const configService = container.get<ConfigService>('configService')
  configService.loadFromEnv()
}

/**
 * Получает сервис из контейнера с типизацией
 */
export function getService<T extends keyof ServiceMap>(name: T): ServiceMap[T] {
  return container.get<ServiceMap[T]>(name)
}

/**
 * Проверяет, инициализирован ли контейнер
 */
export function isContainerInitialized(): boolean {
  return container.has('logger')
}

/**
 * Получает список всех зарегистрированных сервисов
 */
export function getRegisteredServices(): string[] {
  return container.getRegisteredServices()
}

/**
 * Создает новый экземпляр контейнера для тестирования
 */
export function createTestContainer() {
  const testContainer = new (container.constructor as any)()
  
  // Регистрируем моки для тестов
  testContainer.registerValue('logger', {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    critical: () => {}
  })
  
  testContainer.registerValue('configService', {
    get: () => undefined,
    set: () => {},
    has: () => false,
    getAll: () => ({}),
    loadFromEnv: () => {}
  })
  
  return testContainer
}

// Автоматически настраиваем контейнер при импорте
if (typeof window === 'undefined') {
  // Только на сервере
  setupDIContainer()
}