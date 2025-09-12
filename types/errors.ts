// Строгие типы для обработки ошибок
// Основа для единообразной обработки ошибок во всем приложении

// ===== БАЗОВЫЕ ТИПЫ ОШИБОК =====

export enum ErrorCode {
  // Общие ошибки
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // API ошибки
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // База данных
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Внешние сервисы
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  YANDEX_GPT_ERROR = 'YANDEX_GPT_ERROR',
  OPENAI_ERROR = 'OPENAI_ERROR',
  VK_API_ERROR = 'VK_API_ERROR',
  TELEGRAM_ERROR = 'TELEGRAM_ERROR',
  CLOUDPAYMENTS_ERROR = 'CLOUDPAYMENTS_ERROR',
  
  // Файлы и загрузка
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // Конфигурация
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  MISSING_ENV_VAR = 'MISSING_ENV_VAR',
  INVALID_CONFIG = 'INVALID_CONFIG',
  
  // Бизнес-логика
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ===== ОСНОВНОЙ КЛАСС ОШИБКИ =====

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly severity: ErrorSeverity
  public readonly context?: Record<string, any>
  public readonly timestamp: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message)
    
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.severity = severity
    this.context = context
    this.timestamp = new Date().toISOString()
    this.isOperational = isOperational

    // Обеспечиваем правильный stack trace
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AppError)
    }
  }

  // Сериализация для API ответов
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
    }
  }
}

// ===== СПЕЦИАЛИЗИРОВАННЫЕ ОШИБКИ =====

export class ValidationError extends AppError {
  public readonly fieldErrors: FieldError[]

  constructor(
    message: string,
    fieldErrors: FieldError[] = [],
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      400,
      ErrorSeverity.MEDIUM,
      context
    )
    this.fieldErrors = fieldErrors
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.AUTHENTICATION_ERROR,
      401,
      ErrorSeverity.HIGH,
      context
    )
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.AUTHORIZATION_ERROR,
      403,
      ErrorSeverity.HIGH,
      context
    )
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(
      `${resource} not found`,
      ErrorCode.NOT_FOUND,
      404,
      ErrorSeverity.MEDIUM,
      context
    )
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      ErrorCode.CONFLICT,
      409,
      ErrorSeverity.MEDIUM,
      context
    )
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      429,
      ErrorSeverity.MEDIUM,
      { ...context, retryAfter }
    )
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string
  public readonly originalError?: Error

  constructor(
    service: string,
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(
      `External service error (${service}): ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      ErrorSeverity.HIGH,
      context
    )
    this.service = service
    this.originalError = originalError
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      ErrorCode.CONFIGURATION_ERROR,
      500,
      ErrorSeverity.CRITICAL,
      context
    )
  }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ТИПЫ =====

export interface FieldError {
  field: string
  message: string
  code: string
  value?: unknown
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ipAddress?: string
  url?: string
  method?: string
  [key: string]: unknown
}

export interface ErrorReport {
  error: AppError
  context: ErrorContext
  stack?: string
  timestamp: string
}

// ===== ТИПЫ ДЛЯ ОБРАБОТКИ ОШИБОК =====

export interface ErrorHandler {
  canHandle(error: Error): boolean
  handle(error: Error, context?: ErrorContext): Promise<void>
}

export interface ErrorLogger {
  log(error: ErrorReport): Promise<void>
  logError(error: AppError, context?: ErrorContext): Promise<void>
}

export interface ErrorNotifier {
  notify(error: AppError, context?: ErrorContext): Promise<void>
}

// ===== УТИЛИТЫ ДЛЯ ОШИБОК =====

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isOperationalError(error: Error): boolean {
  if (isAppError(error)) {
    return error.isOperational
  }
  return false
}

export function getErrorSeverity(error: Error): ErrorSeverity {
  if (isAppError(error)) {
    return error.severity
  }
  return ErrorSeverity.MEDIUM
}

export function shouldNotifyError(error: Error): boolean {
  const severity = getErrorSeverity(error)
  return severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL
}

// ===== МАППИНГ HTTP СТАТУСОВ =====

export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
}

// ===== ТИПЫ ДЛЯ API ОТВЕТОВ =====

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, any>
    timestamp: string
  }
  requestId?: string
}

export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  requestId?: string
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse
