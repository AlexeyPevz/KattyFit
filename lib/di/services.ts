// Интерфейсы сервисов для DI контейнера
// Определяет контракты для всех сервисов приложения

export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
  critical(message: string, context?: Record<string, unknown>): void
}

export interface IAuthService {
  login(credentials: { username: string; password: string }): Promise<{ success: boolean; token?: string; user?: Record<string, unknown> }>
  logout(): Promise<void>
  getCurrentUser(): Record<string, unknown> | null
  isAuthenticated(): boolean
  hasRole(role: string): boolean
}

export interface IEmailService {
  sendEmail(to: string, subject: string, body: string, isHtml?: boolean): Promise<boolean>
  sendTemplateEmail(to: string, template: string, data: Record<string, unknown>): Promise<boolean>
  sendBulkEmail(recipients: string[], subject: string, body: string): Promise<{ success: number; failed: number }>
}

export interface IFileService {
  uploadFile(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }>
  deleteFile(url: string): Promise<boolean>
  getFileInfo(url: string): Promise<{ size: number; type: string; lastModified: Date } | null>
  generateSignedUrl(path: string, expiresIn?: number): Promise<string>
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  keys(pattern?: string): Promise<string[]>
}

export interface IAnalyticsService {
  trackEvent(event: string, properties?: Record<string, unknown>): Promise<void>
  trackPageView(page: string, properties?: Record<string, unknown>): Promise<void>
  trackUser(userId: string, properties?: Record<string, unknown>): Promise<void>
  getMetrics(timeRange: { from: Date; to: Date }): Promise<Record<string, unknown>>
}

export interface INotificationService {
  sendNotification(userId: string, message: string, type: 'info' | 'warning' | 'error'): Promise<void>
  sendBulkNotification(userIds: string[], message: string, type: 'info' | 'warning' | 'error'): Promise<void>
  subscribeToTopic(userId: string, topic: string): Promise<void>
  unsubscribeFromTopic(userId: string, topic: string): Promise<void>
}

export interface IValidationService {
  validateEmail(email: string): boolean
  validatePhone(phone: string): boolean
  validatePassword(password: string): { isValid: boolean; errors: string[] }
  validateUrl(url: string): boolean
  sanitizeInput(input: string): string
}

export interface IEncryptionService {
  encrypt(text: string): string
  decrypt(encryptedText: string): string
  hash(text: string): string
  verifyHash(text: string, hash: string): boolean
  generateToken(payload: Record<string, unknown>): string
  verifyToken(token: string): Record<string, unknown> | null
}

export interface IConfigService {
  get<T>(key: string, defaultValue?: T): T
  set(key: string, value: unknown): void
  has(key: string): boolean
  getAll(): Record<string, unknown>
  loadFromEnv(): void
}

export interface IErrorService {
  reportError(error: Error, context?: Record<string, unknown>): Promise<void>
  reportWarning(message: string, context?: Record<string, unknown>): Promise<void>
  reportInfo(message: string, context?: Record<string, unknown>): Promise<void>
  getErrorStats(timeRange: { from: Date; to: Date }): Promise<Record<string, unknown>>
}

export interface IAPIService {
  get<T>(url: string, options?: RequestInit): Promise<T>
  post<T>(url: string, data?: unknown, options?: RequestInit): Promise<T>
  put<T>(url: string, data?: unknown, options?: RequestInit): Promise<T>
  delete<T>(url: string, options?: RequestInit): Promise<T>
  patch<T>(url: string, data?: unknown, options?: RequestInit): Promise<T>
}

// Типы для регистрации сервисов
export type ServiceName = 
  | 'logger'
  | 'authService'
  | 'emailService'
  | 'fileService'
  | 'cacheService'
  | 'analyticsService'
  | 'notificationService'
  | 'validationService'
  | 'encryptionService'
  | 'configService'
  | 'errorService'
  | 'apiService'

export type ServiceMap = {
  logger: ILogger
  authService: IAuthService
  emailService: IEmailService
  fileService: IFileService
  cacheService: ICacheService
  analyticsService: IAnalyticsService
  notificationService: INotificationService
  validationService: IValidationService
  encryptionService: IEncryptionService
  configService: IConfigService
  errorService: IErrorService
  apiService: IAPIService
}
