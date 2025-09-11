// Централизованная система логирования
// Единообразное логирование для всего приложения

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
  requestId?: string
  userId?: string
  sessionId?: string
}

export interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  enableLocalStorage: boolean
  maxLocalStorageEntries: number
}

class Logger {
  private config: LoggerConfig
  private localLogs: LogEntry[] = []

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      enableLocalStorage: false,
      maxLocalStorageEntries: 1000,
      ...config
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.minLevel
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level]
    const timestamp = entry.timestamp
    const message = entry.message
    const context = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : ''
    const error = entry.error ? ` | Error: ${entry.error.message}` : ''
    const requestId = entry.requestId ? ` | RequestId: ${entry.requestId}` : ''
    const userId = entry.userId ? ` | UserId: ${entry.userId}` : ''
    const sessionId = entry.sessionId ? ` | SessionId: ${entry.sessionId}` : ''

    return `[${timestamp}] ${levelName}: ${message}${context}${error}${requestId}${userId}${sessionId}`
  }

  private async logToConsole(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return

    const formattedMessage = this.formatMessage(entry)
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
      case LogLevel.CRITICAL:
        console.error(`🚨 CRITICAL: ${formattedMessage}`)
        break
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to log to remote endpoint:', error)
    }
  }

  private logToLocalStorage(entry: LogEntry): void {
    if (!this.config.enableLocalStorage || typeof window === 'undefined') return

    try {
      this.localLogs.push(entry)
      
      // Keep only the last N entries
      if (this.localLogs.length > this.config.maxLocalStorageEntries) {
        this.localLogs = this.localLogs.slice(-this.config.maxLocalStorageEntries)
      }
      
      localStorage.setItem('app-logs', JSON.stringify(this.localLogs))
    } catch (error) {
      console.error('Failed to log to localStorage:', error)
    }
  }

  private async log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      requestId: this.getRequestId(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    }

    // Log to all configured destinations
    await Promise.all([
      this.logToConsole(entry),
      this.logToRemote(entry),
    ])

    this.logToLocalStorage(entry)
  }

  private getRequestId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    return (window as any).__REQUEST_ID__
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.user?.id
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.sessionId
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined
  }

  // Public logging methods
  async debug(message: string, context?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context)
  }

  async info(message: string, context?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.INFO, message, context)
  }

  async warn(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    await this.log(LogLevel.WARN, message, context, error)
  }

  async error(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    await this.log(LogLevel.ERROR, message, context, error)
  }

  async critical(message: string, context?: Record<string, any>, error?: Error): Promise<void> {
    await this.log(LogLevel.CRITICAL, message, context, error)
  }

  // Utility methods
  getLocalLogs(): LogEntry[] {
    return [...this.localLogs]
  }

  clearLocalLogs(): void {
    this.localLogs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app-logs')
    }
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Create default logger instance
const logger = new Logger({
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
  enableLocalStorage: true,
  maxLocalStorageEntries: 1000,
})

// Export logger instance and utility functions
export default logger

// Utility functions for common logging patterns
export const logApiRequest = (method: string, url: string, context?: Record<string, any>) => {
  logger.info(`API Request: ${method} ${url}`, context)
}

export const logApiResponse = (method: string, url: string, status: number, context?: Record<string, any>) => {
  const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
  if (level === LogLevel.ERROR) {
    logger.error(`API Response: ${method} ${url} - ${status}`, context)
  } else {
    logger.info(`API Response: ${method} ${url} - ${status}`, context)
  }
}

export const logUserAction = (action: string, context?: Record<string, any>) => {
  logger.info(`User Action: ${action}`, context)
}

export const logError = (message: string, error: Error, context?: Record<string, any>) => {
  logger.error(message, context, error)
}

export const logCritical = (message: string, error: Error, context?: Record<string, any>) => {
  logger.critical(message, context, error)
}

export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, context)
}

export const logSecurity = (event: string, context?: Record<string, any>) => {
  logger.warn(`Security Event: ${event}`, context)
}

export const logBusiness = (event: string, context?: Record<string, any>) => {
  logger.info(`Business Event: ${event}`, context)
}