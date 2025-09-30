// Абстракция для работы с базой данных
// Инверсия зависимостей для тестируемости

import { AppError, ErrorCode, ErrorSeverity } from '@/types/errors'
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
  filters?: Record<string, unknown>
}

export interface User {
  id: string
  name: string
  email: string
  createdAt?: string
  updatedAt?: string
}

export interface DatabaseService {
  // Пользователи
  getUserById(id: string): Promise<Record<string, unknown> | null>
  createUser(user: Record<string, unknown>): Promise<Record<string, unknown>>
  updateUser(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  deleteUser(id: string): Promise<void>

  // Курсы
  getCourses(options?: QueryOptions): Promise<Record<string, unknown>[]>
  getCourseById(id: string): Promise<Record<string, unknown> | null>
  createCourse(course: Record<string, unknown>): Promise<Record<string, unknown>>
  updateCourse(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  deleteCourse(id: string): Promise<void>

  // Лиды
  getLeads(options?: QueryOptions): Promise<Record<string, unknown>[]>
  getLeadById(id: string): Promise<Record<string, unknown> | null>
  createLead(lead: Record<string, unknown>): Promise<Record<string, unknown>>
  updateLead(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  deleteLead(id: string): Promise<void>

  // Бронирования
  getBookings(options?: QueryOptions): Promise<Record<string, unknown>[]>
  getBookingById(id: string): Promise<Record<string, unknown> | null>
  createBooking(booking: Record<string, unknown>): Promise<Record<string, unknown>>
  updateBooking(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  deleteBooking(id: string): Promise<void>

  // Общие методы
  executeQuery<T>(query: string, params?: unknown[]): Promise<T[]>
  executeTransaction(operations: (() => Promise<unknown>)[]): Promise<unknown[]>
  healthCheck(): Promise<boolean>
}

// ===== БАЗОВЫЙ КЛАСС =====

abstract class BaseDatabaseService implements DatabaseService {
  protected config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  // Абстрактные методы для конкретных реализаций
  abstract getUserById(id: string): Promise<Record<string, unknown> | null>
  abstract createUser(user: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract updateUser(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract deleteUser(id: string): Promise<void>

  abstract getCourses(options?: QueryOptions): Promise<Record<string, unknown>[]>
  abstract getCourseById(id: string): Promise<Record<string, unknown> | null>
  abstract createCourse(course: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract updateCourse(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract deleteCourse(id: string): Promise<void>

  abstract getLeads(options?: QueryOptions): Promise<Record<string, unknown>[]>
  abstract getLeadById(id: string): Promise<Record<string, unknown> | null>
  abstract createLead(lead: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract updateLead(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract deleteLead(id: string): Promise<void>

  abstract getBookings(options?: QueryOptions): Promise<Record<string, unknown>[]>
  abstract getBookingById(id: string): Promise<Record<string, unknown> | null>
  abstract createBooking(booking: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract updateBooking(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>
  abstract deleteBooking(id: string): Promise<void>

  // Общие методы
  async executeQuery<T>(query: string, params?: unknown[]): Promise<T[]> {
    try {
      await logger.debug('Executing database query', {
        query: query.substring(0, 100),
        paramCount: params?.length || 0
      })

      // Используем Supabase RPC для выполнения SQL запросов
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(this.config.url, this.config.serviceRoleKey)
      
      // Для безопасности используем параметризованные запросы
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: query,
        sql_params: params || []
      })

      if (error) {
        throw error
      }

      return (data || []) as T[]
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        `Query execution failed: ${error}`,
        ErrorCode.DATABASE_ERROR,
        500,
        ErrorSeverity.HIGH,
        { query, params }
      )
    }
  }

  async executeTransaction(operations: (() => Promise<unknown>)[]): Promise<unknown[]> {
    const results: unknown[] = []
    
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
        ErrorSeverity.HIGH,
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
  protected async handleDatabaseError(error: Error | unknown, operation: string): Promise<never> {
    const dbError = error as { code?: string }
    if (dbError?.code === '23505') {
      throw new AppError(
        `Duplicate entry in ${operation}`,
        ErrorCode.DUPLICATE_ENTRY,
        409,
        ErrorSeverity.MEDIUM,
        { operation }
      )
    }

    if (dbError?.code === '23503') {
      throw new AppError(
        `Foreign key constraint violation in ${operation}`,
        ErrorCode.CONSTRAINT_VIOLATION,
        400,
        ErrorSeverity.MEDIUM,
        { operation }
      )
    }

    throw new AppError(
      `Database operation failed: ${operation}`,
      ErrorCode.DATABASE_ERROR,
      500,
      ErrorSeverity.HIGH,
      { originalError: error, operation }
    )
  }

  protected buildQueryOptions(options?: QueryOptions): Record<string, unknown> {
    if (!options) return {}

    const queryOptions: Record<string, unknown> = {}

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
  private async getSupabaseClient() {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(this.config.url, this.config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  // Пользователи
  async getUserById(id: string): Promise<Record<string, unknown> | null> {
    await logger.debug('Getting user by id', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        throw error
      }

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getUserById')
    }
  }

  async createUser(user: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Creating user', { 
      userFields: Object.keys(user)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'createUser')
    }
  }

  async updateUser(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Updating user', { 
      id, 
      updateFields: Object.keys(updates)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'updateUser')
    }
  }

  async deleteUser(id: string): Promise<void> {
    await logger.debug('Deleting user', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      await this.handleDatabaseError(error as Error, 'deleteUser')
    }
  }

  // Курсы
  async getCourses(options?: QueryOptions): Promise<Record<string, unknown>[]> {
    await logger.debug('Getting courses', { 
      options: options ? Object.keys(options) : 'none'
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      let query = supabase.from('courses').select('*')

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true })
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getCourses')
    }
  }

  async getCourseById(id: string): Promise<Record<string, unknown> | null> {
    await logger.debug('Getting course by id', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getCourseById')
    }
  }

  async createCourse(course: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Creating course', { 
      courseFields: Object.keys(course)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'createCourse')
    }
  }

  async updateCourse(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Updating course', { 
      id, 
      updateFields: Object.keys(updates)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'updateCourse')
    }
  }

  async deleteCourse(id: string): Promise<void> {
    await logger.debug('Deleting course', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      await this.handleDatabaseError(error as Error, 'deleteCourse')
    }
  }

  // Лиды
  async getLeads(options?: QueryOptions): Promise<Record<string, unknown>[]> {
    await logger.debug('Getting leads', { 
      options: options ? Object.keys(options) : 'none'
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      let query = supabase.from('leads').select('*')

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true })
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getLeads')
    }
  }

  async getLeadById(id: string): Promise<Record<string, unknown> | null> {
    await logger.debug('Getting lead by id', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getLeadById')
    }
  }

  async createLead(lead: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Creating lead', { 
      leadFields: Object.keys(lead)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'createLead')
    }
  }

  async updateLead(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Updating lead', { 
      id, 
      updateFields: Object.keys(updates)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'updateLead')
    }
  }

  async deleteLead(id: string): Promise<void> {
    await logger.debug('Deleting lead', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      await this.handleDatabaseError(error as Error, 'deleteLead')
    }
  }

  // Бронирования
  async getBookings(options?: QueryOptions): Promise<Record<string, unknown>[]> {
    await logger.debug('Getting bookings', { 
      options: options ? Object.keys(options) : 'none'
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      let query = supabase.from('bookings').select('*')

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true })
      }
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getBookings')
    }
  }

  async getBookingById(id: string): Promise<Record<string, unknown> | null> {
    await logger.debug('Getting booking by id', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'getBookingById')
    }
  }

  async createBooking(booking: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Creating booking', { 
      bookingFields: Object.keys(booking)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'createBooking')
    }
  }

  async updateBooking(id: string, updates: Record<string, unknown>): Promise<Record<string, unknown>> {
    await logger.debug('Updating booking', { 
      id, 
      updateFields: Object.keys(updates)
    })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      return await this.handleDatabaseError(error as Error, 'updateBooking')
    }
  }

  async deleteBooking(id: string): Promise<void> {
    await logger.debug('Deleting booking', { id })
    
    try {
      const supabase = await this.getSupabaseClient()
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      await this.handleDatabaseError(error as Error, 'deleteBooking')
    }
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
        ErrorSeverity.CRITICAL,
        { config: { url: !!config.url, anonKey: !!config.anonKey, serviceRoleKey: !!config.serviceRoleKey } }
      )
    }

    return new SimpleDatabaseService(config)
  }
}

// ===== ЭКСПОРТ =====

export { BaseDatabaseService }
export default DatabaseServiceFactory
