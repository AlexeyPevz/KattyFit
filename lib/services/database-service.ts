// Абстракция для работы с базой данных
// Инверсия зависимостей для тестируемости

import { AppError, ErrorCode } from '@/types/errors'
import logger from '../logger'

// ===== ИНТЕРФЕЙСЫ =====

export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
  filters?: Record<string, any>
}

export interface DatabaseService {
  // Пользователи
  getUserById(id: string): Promise<any>
  createUser(user: any): Promise<any>
  updateUser(id: string, updates: any): Promise<any>
  deleteUser(id: string): Promise<void>

  // Курсы
  getCourses(options?: QueryOptions): Promise<any[]>
  getCourseById(id: string): Promise<any>
  createCourse(course: any): Promise<any>
  updateCourse(id: string, updates: any): Promise<any>
  deleteCourse(id: string): Promise<void>

  // Лиды
  getLeads(options?: QueryOptions): Promise<any[]>
  getLeadById(id: string): Promise<any>
  createLead(lead: any): Promise<any>
  updateLead(id: string, updates: any): Promise<any>
  deleteLead(id: string): Promise<void>

  // Бронирования
  getBookings(options?: QueryOptions): Promise<any[]>
  getBookingById(id: string): Promise<any>
  createBooking(booking: any): Promise<any>
  updateBooking(id: string, updates: any): Promise<any>
  deleteBooking(id: string): Promise<void>

  // Общие методы
  executeQuery<T>(query: string, params?: any[]): Promise<T[]>
  executeTransaction(operations: (() => Promise<any>)[]): Promise<any[]>
  healthCheck(): Promise<boolean>
}

// ===== БАЗОВЫЙ КЛАСС =====

abstract class BaseDatabaseService implements DatabaseService {
  protected config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  // Абстрактные методы для конкретных реализаций
  abstract getUserById(id: string): Promise<any>
  abstract createUser(user: any): Promise<any>
  abstract updateUser(id: string, updates: any): Promise<any>
  abstract deleteUser(id: string): Promise<void>

  abstract getCourses(options?: QueryOptions): Promise<any[]>
  abstract getCourseById(id: string): Promise<any>
  abstract createCourse(course: any): Promise<any>
  abstract updateCourse(id: string, updates: any): Promise<any>
  abstract deleteCourse(id: string): Promise<void>

  abstract getLeads(options?: QueryOptions): Promise<any[]>
  abstract getLeadById(id: string): Promise<any>
  abstract createLead(lead: any): Promise<any>
  abstract updateLead(id: string, updates: any): Promise<any>
  abstract deleteLead(id: string): Promise<void>

  abstract getBookings(options?: QueryOptions): Promise<any[]>
  abstract getBookingById(id: string): Promise<any>
  abstract createBooking(booking: any): Promise<any>
  abstract updateBooking(id: string, updates: any): Promise<any>
  abstract deleteBooking(id: string): Promise<void>

  // Общие методы
  async executeQuery<T>(query: string, params?: any[]): Promise<T[]> {
    try {
      // Простая реализация без Supabase
      // В реальном приложении здесь будет вызов Supabase
      await logger.debug('Executing database query', {
        query: query.substring(0, 100),
        paramCount: params?.length || 0
      })
      return []
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        `Query execution failed: ${error}`,
        ErrorCode.DATABASE_ERROR,
        500,
        'high',
        { query, params }
      )
    }
  }

  async executeTransaction(operations: (() => Promise<any>)[]): Promise<any[]> {
    const results: any[] = []
    
    try {
      for (const operation of operations) {
        const result = await operation()
        results.push(result)
      }
      return results
    } catch (error) {
      // В реальном приложении здесь должна быть откат транзакции
      throw new AppError(
        `Transaction failed: ${error}`,
        ErrorCode.DATABASE_ERROR,
        500,
        'high',
        { operationsCount: operations.length, completedOperations: results.length }
      )
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Простая проверка здоровья
      return this.config.url.length > 0
    } catch {
      return false
    }
  }

  // Защищенные методы для работы с базой данных
  protected async handleDatabaseError(error: any, operation: string): Promise<never> {
    if (error?.code === '23505') {
      throw new AppError(
        `Duplicate entry in ${operation}`,
        ErrorCode.DUPLICATE_ENTRY,
        409,
        'medium',
        { operation }
      )
    }

    if (error?.code === '23503') {
      throw new AppError(
        `Foreign key constraint violation in ${operation}`,
        ErrorCode.CONSTRAINT_VIOLATION,
        400,
        'medium',
        { operation }
      )
    }

    throw new AppError(
      `Database operation failed: ${operation}`,
      ErrorCode.DATABASE_ERROR,
      500,
      'high',
      { originalError: error, operation }
    )
  }

  protected buildQueryOptions(options?: QueryOptions): any {
    if (!options) return {}

    const queryOptions: any = {}

    if (options.limit) {
      queryOptions.limit = options.limit
    }

    if (options.offset) {
      queryOptions.offset = options.offset
    }

    if (options.orderBy) {
      queryOptions.order = {
        column: options.orderBy,
        ascending: options.ascending ?? true,
      }
    }

    return queryOptions
  }
}

// ===== ПРОСТАЯ РЕАЛИЗАЦИЯ =====

export class SimpleDatabaseService extends BaseDatabaseService {
  // Пользователи
  async getUserById(id: string): Promise<any> {
    await logger.debug('Getting user by id', { id })
    return { id, name: 'Test User', email: 'test@example.com' }
  }

  async createUser(user: any): Promise<any> {
    await logger.debug('Creating user', { 
      userFields: Object.keys(user)
    })
    return { id: 'new-user-id', ...user }
  }

  async updateUser(id: string, updates: any): Promise<any> {
    await logger.debug('Updating user', { 
      id, 
      updateFields: Object.keys(updates)
    })
    return { id, ...updates }
  }

  async deleteUser(id: string): Promise<void> {
    await logger.debug('Deleting user', { id })
  }

  // Курсы
  async getCourses(options?: QueryOptions): Promise<any[]> {
    await logger.debug('Getting courses', { 
      options: options ? Object.keys(options) : 'none'
    })
    return []
  }

  async getCourseById(id: string): Promise<any> {
    await logger.debug('Getting course by id', { id })
    return { id, title: 'Test Course' }
  }

  async createCourse(course: any): Promise<any> {
    await logger.debug('Creating course', { 
      courseFields: Object.keys(course)
    })
    return { id: 'new-course-id', ...course }
  }

  async updateCourse(id: string, updates: any): Promise<any> {
    await logger.debug('Updating course', { 
      id, 
      updateFields: Object.keys(updates)
    })
    return { id, ...updates }
  }

  async deleteCourse(id: string): Promise<void> {
    await logger.debug('Deleting course', { id })
  }

  // Лиды
  async getLeads(options?: QueryOptions): Promise<any[]> {
    await logger.debug('Getting leads', { 
      options: options ? Object.keys(options) : 'none'
    })
    return []
  }

  async getLeadById(id: string): Promise<any> {
    await logger.debug('Getting lead by id', { id })
    return { id, name: 'Test Lead' }
  }

  async createLead(lead: any): Promise<any> {
    await logger.debug('Creating lead', { 
      leadFields: Object.keys(lead)
    })
    return { id: 'new-lead-id', ...lead }
  }

  async updateLead(id: string, updates: any): Promise<any> {
    await logger.debug('Updating lead', { 
      id, 
      updateFields: Object.keys(updates)
    })
    return { id, ...updates }
  }

  async deleteLead(id: string): Promise<void> {
    await logger.debug('Deleting lead', { id })
  }

  // Бронирования
  async getBookings(options?: QueryOptions): Promise<any[]> {
    await logger.debug('Getting bookings', { 
      options: options ? Object.keys(options) : 'none'
    })
    return []
  }

  async getBookingById(id: string): Promise<any> {
    await logger.debug('Getting booking by id', { id })
    return { id, date: '2024-01-01' }
  }

  async createBooking(booking: any): Promise<any> {
    await logger.debug('Creating booking', { 
      bookingFields: Object.keys(booking)
    })
    return { id: 'new-booking-id', ...booking }
  }

  async updateBooking(id: string, updates: any): Promise<any> {
    await logger.debug('Updating booking', { 
      id, 
      updateFields: Object.keys(updates)
    })
    return { id, ...updates }
  }

  async deleteBooking(id: string): Promise<void> {
    await logger.debug('Deleting booking', { id })
  }
}

// ===== ФАБРИКА =====

export class DatabaseServiceFactory {
  static create(config: DatabaseConfig): DatabaseService {
    return new SimpleDatabaseService(config)
  }

  static createFromEnv(): DatabaseService {
    const config: DatabaseConfig = {
      url: typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_URL || '') : '',
      anonKey: typeof process !== 'undefined' ? (process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') : '',
      serviceRoleKey: typeof process !== 'undefined' ? (process.env?.SUPABASE_SERVICE_ROLE_KEY || '') : '',
    }

    if (!config.url || !config.anonKey || !config.serviceRoleKey) {
      throw new AppError(
        'Database configuration is incomplete',
        ErrorCode.CONFIGURATION_ERROR,
        500,
        'critical',
        { config: { url: !!config.url, anonKey: !!config.anonKey, serviceRoleKey: !!config.serviceRoleKey } }
      )
    }

    return new SimpleDatabaseService(config)
  }
}

// ===== ЭКСПОРТ =====

export { BaseDatabaseService }
export default DatabaseServiceFactory