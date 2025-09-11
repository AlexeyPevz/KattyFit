// Абстракция для работы с базой данных
// Инверсия зависимостей для тестируемости

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { AppError, ErrorCode, DatabaseError } from '@/types/errors'

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
  protected client: SupabaseClient
  protected adminClient: SupabaseClient

  constructor(config: DatabaseConfig) {
    this.client = createClient(config.url, config.anonKey)
    this.adminClient = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
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
      const { data, error } = await this.adminClient.rpc('execute_sql', {
        query,
        params: params || [],
      })

      if (error) {
        throw new DatabaseError(`Query execution failed: ${error.message}`, {
          query,
          params,
        })
      }

      return data || []
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new DatabaseError(`Query execution failed: ${error}`, {
        query,
        params,
      })
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
      throw new DatabaseError(`Transaction failed: ${error}`, {
        operationsCount: operations.length,
        completedOperations: results.length,
      })
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await this.adminClient
        .from('users')
        .select('count')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }

  // Защищенные методы для работы с Supabase
  protected async handleSupabaseError(error: any, operation: string): Promise<never> {
    if (error?.code === '23505') {
      throw new DatabaseError(
        `Duplicate entry in ${operation}`,
        { code: ErrorCode.DUPLICATE_ENTRY, operation }
      )
    }

    if (error?.code === '23503') {
      throw new DatabaseError(
        `Foreign key constraint violation in ${operation}`,
        { code: ErrorCode.CONSTRAINT_VIOLATION, operation }
      )
    }

    throw new DatabaseError(
      `Database operation failed: ${operation}`,
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

// ===== SUPABASE РЕАЛИЗАЦИЯ =====

export class SupabaseDatabaseService extends BaseDatabaseService {
  // Пользователи
  async getUserById(id: string): Promise<any> {
    const { data, error } = await this.adminClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'getUserById')
    }

    return data
  }

  async createUser(user: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('users')
      .insert(user)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'createUser')
    }

    return data
  }

  async updateUser(id: string, updates: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'updateUser')
    }

    return data
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      await this.handleSupabaseError(error, 'deleteUser')
    }
  }

  // Курсы
  async getCourses(options?: QueryOptions): Promise<any[]> {
    let query = this.adminClient
      .from('courses')
      .select('*')

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

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

    if (error) {
      await this.handleSupabaseError(error, 'getCourses')
    }

    return data || []
  }

  async getCourseById(id: string): Promise<any> {
    const { data, error } = await this.adminClient
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'getCourseById')
    }

    return data
  }

  async createCourse(course: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('courses')
      .insert(course)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'createCourse')
    }

    return data
  }

  async updateCourse(id: string, updates: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'updateCourse')
    }

    return data
  }

  async deleteCourse(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      await this.handleSupabaseError(error, 'deleteCourse')
    }
  }

  // Лиды
  async getLeads(options?: QueryOptions): Promise<any[]> {
    let query = this.adminClient
      .from('leads')
      .select('*')

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

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

    if (error) {
      await this.handleSupabaseError(error, 'getLeads')
    }

    return data || []
  }

  async getLeadById(id: string): Promise<any> {
    const { data, error } = await this.adminClient
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'getLeadById')
    }

    return data
  }

  async createLead(lead: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('leads')
      .insert(lead)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'createLead')
    }

    return data
  }

  async updateLead(id: string, updates: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'updateLead')
    }

    return data
  }

  async deleteLead(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      await this.handleSupabaseError(error, 'deleteLead')
    }
  }

  // Бронирования
  async getBookings(options?: QueryOptions): Promise<any[]> {
    let query = this.adminClient
      .from('bookings')
      .select('*')

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

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

    if (error) {
      await this.handleSupabaseError(error, 'getBookings')
    }

    return data || []
  }

  async getBookingById(id: string): Promise<any> {
    const { data, error } = await this.adminClient
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'getBookingById')
    }

    return data
  }

  async createBooking(booking: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'createBooking')
    }

    return data
  }

  async updateBooking(id: string, updates: any): Promise<any> {
    const { data, error } = await this.adminClient
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      await this.handleSupabaseError(error, 'updateBooking')
    }

    return data
  }

  async deleteBooking(id: string): Promise<void> {
    const { error } = await this.adminClient
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      await this.handleSupabaseError(error, 'deleteBooking')
    }
  }
}

// ===== ФАБРИКА =====

export class DatabaseServiceFactory {
  static create(config: DatabaseConfig): DatabaseService {
    return new SupabaseDatabaseService(config)
  }

  static createFromEnv(): DatabaseService {
    const config: DatabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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

    return new SupabaseDatabaseService(config)
  }
}

// ===== ЭКСПОРТ =====

export { BaseDatabaseService }
export default DatabaseServiceFactory