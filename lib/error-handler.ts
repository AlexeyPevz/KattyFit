// Единообразная обработка ошибок
// Централизованная система для обработки всех типов ошибок

import { NextRequest, NextResponse } from 'next/server'
import { AppError, ErrorCode, ErrorSeverity, isAppError, isOperationalError } from '@/types/errors'

// ===== КОНФИГУРАЦИЯ =====

const ERROR_CONFIG = {
  // Коды ошибок, которые не нужно логировать
  IGNORE_LOGS: [
    ErrorCode.AUTHENTICATION_ERROR,
    ErrorCode.AUTHORIZATION_ERROR,
    ErrorCode.NOT_FOUND,
  ],
  
  // Коды ошибок, которые требуют уведомления
  NOTIFY_ERRORS: [
    ErrorCode.CRITICAL,
    ErrorCode.EXTERNAL_SERVICE_ERROR,
    ErrorCode.CONFIGURATION_ERROR,
  ],
  
  // Максимальная длина сообщения об ошибке для клиента
  MAX_CLIENT_MESSAGE_LENGTH: 200,
}

// ===== ОБРАБОТЧИК ОШИБОК =====

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLogger: ErrorLogger
  private errorNotifier: ErrorNotifier

  private constructor() {
    this.errorLogger = new ErrorLogger()
    this.errorNotifier = new ErrorNotifier()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Обработка ошибок в API routes
  async handleApiError(error: unknown, request: NextRequest): Promise<NextResponse> {
    const appError = this.normalizeError(error)
    const context = this.extractContext(request)
    
    // Логируем ошибку
    await this.errorLogger.logError(appError, context)
    
    // Уведомляем о критических ошибках
    if (this.shouldNotify(appError)) {
      await this.errorNotifier.notify(appError, context)
    }
    
    // Возвращаем ответ клиенту
    return this.createErrorResponse(appError, context)
  }

  // Обработка ошибок в клиентских компонентах
  async handleClientError(error: unknown, context?: Record<string, any>): Promise<void> {
    const appError = this.normalizeError(error)
    
    // Логируем ошибку
    await this.errorLogger.logError(appError, context)
    
    // Уведомляем о критических ошибках
    if (this.shouldNotify(appError)) {
      await this.errorNotifier.notify(appError, context)
    }
  }

  // Нормализация ошибки в AppError
  private normalizeError(error: unknown): AppError {
    if (isAppError(error)) {
      return error
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        ErrorCode.UNKNOWN_ERROR,
        500,
        ErrorSeverity.MEDIUM,
        { originalError: error.name, stack: error.stack }
      )
    }

    if (typeof error === 'string') {
      return new AppError(
        error,
        ErrorCode.UNKNOWN_ERROR,
        500,
        ErrorSeverity.MEDIUM
      )
    }

    return new AppError(
      'An unknown error occurred',
      ErrorCode.UNKNOWN_ERROR,
      500,
      ErrorSeverity.MEDIUM,
      { originalError: error }
    )
  }

  // Извлечение контекста из запроса
  private extractContext(request: NextRequest): Record<string, any> {
    return {
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: this.getClientIP(request),
      timestamp: new Date().toISOString(),
    }
  }

  // Получение IP адреса клиента
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return 'unknown'
  }

  // Проверка необходимости уведомления
  private shouldNotify(error: AppError): boolean {
    return ERROR_CONFIG.NOTIFY_ERRORS.includes(error.code as any) ||
           error.severity === ErrorSeverity.CRITICAL
  }

  // Создание ответа об ошибке
  private createErrorResponse(error: AppError, context: Record<string, any>): NextResponse {
    const statusCode = error.statusCode
    const message = this.sanitizeMessage(error.message)
    
    const response = {
      success: false,
      error: {
        code: error.code,
        message,
        timestamp: error.timestamp,
        requestId: context.requestId,
      },
    }

    // Добавляем детали только для операционных ошибок
    if (isOperationalError(error) && error.context) {
      response.error.details = this.sanitizeContext(error.context)
    }

    return NextResponse.json(response, { status: statusCode })
  }

  // Санитизация сообщения об ошибке
  private sanitizeMessage(message: string): string {
    if (message.length <= ERROR_CONFIG.MAX_CLIENT_MESSAGE_LENGTH) {
      return message
    }
    
    return message.substring(0, ERROR_CONFIG.MAX_CLIENT_MESSAGE_LENGTH) + '...'
  }

  // Санитизация контекста ошибки
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(context)) {
      // Исключаем чувствительные данные
      if (['password', 'token', 'secret', 'key'].some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '[REDACTED]'
        continue
      }
      
      // Ограничиваем длину строк
      if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...'
        continue
      }
      
      sanitized[key] = value
    }
    
    return sanitized
  }
}

// ===== ЛОГГЕР ОШИБОК =====

class ErrorLogger {
  async logError(error: AppError, context?: Record<string, any>): Promise<void> {
    // Пропускаем логирование для определенных типов ошибок
    if (ERROR_CONFIG.IGNORE_LOGS.includes(error.code as any)) {
      return
    }

    const logEntry = {
      level: this.getLogLevel(error.severity),
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      severity: error.severity,
      context: context || {},
      timestamp: error.timestamp,
      stack: error.stack,
    }

    // В production отправляем в внешний сервис логирования
    if (process.env.NODE_ENV === 'production') {
      await this.sendToExternalLogger(logEntry)
    } else {
      // В development выводим в консоль
      console.error('Error logged:', logEntry)
    }
  }

  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info'
      case ErrorSeverity.MEDIUM:
        return 'warn'
      case ErrorSeverity.HIGH:
        return 'error'
      case ErrorSeverity.CRITICAL:
        return 'fatal'
      default:
        return 'error'
    }
  }

  private async sendToExternalLogger(logEntry: any): Promise<void> {
    try {
      // Здесь можно интегрировать с внешним сервисом логирования
      // Например, Sentry, LogRocket, или собственный сервис
      console.log('Would send to external logger:', logEntry)
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }
}

// ===== УВЕДОМЛЕНИЯ ОБ ОШИБКАХ =====

class ErrorNotifier {
  async notify(error: AppError, context?: Record<string, any>): Promise<void> {
    try {
      // Отправляем уведомление администраторам
      await this.sendAdminNotification(error, context)
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError)
    }
  }

  private async sendAdminNotification(error: AppError, context?: Record<string, any>): Promise<void> {
    const notification = {
      title: `Critical Error: ${error.code}`,
      message: error.message,
      severity: error.severity,
      timestamp: error.timestamp,
      context: context || {},
      url: context?.url || 'unknown',
    }

    // Здесь можно интегрировать с сервисом уведомлений
    // Например, Slack, Discord, Email, или Telegram
    console.log('Would send admin notification:', notification)
  }
}

// ===== УТИЛИТЫ =====

export const errorHandler = ErrorHandler.getInstance()

// Wrapper для API routes
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const request = args[0] as NextRequest
      return await errorHandler.handleApiError(error, request)
    }
  }
}

// Wrapper для клиентских функций
export function withClientErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      await errorHandler.handleClientError(error)
      throw error
    }
  }
}

// ===== ЭКСПОРТ =====

export { ErrorHandler }
export default errorHandler