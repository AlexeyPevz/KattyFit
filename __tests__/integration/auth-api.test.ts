// Интеграционные тесты для API аутентификации
// Тестирование полного flow аутентификации

import { NextRequest } from 'next/server'
import { POST as authHandler } from '@/app/api/admin/auth/route'
import { AppError, ErrorCode } from '@/types/errors'

// Мокаем зависимости
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}))

jest.mock('@/lib/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}))

describe('Auth API Integration Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/admin/auth', () => {
    it('should authenticate valid admin credentials', async () => {
      // Arrange
      const validCredentials = {
        username: 'admin',
        password: 'admin123'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify(validCredentials),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock successful database response
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: {
          id: '1',
          username: 'admin',
          password_hash: '$2b$10$hashedpassword',
          is_active: true
        },
        error: null
      })

      // Act
      const response = await authHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('sessionToken')
      expect(responseData.data).toHaveProperty('user')
    })

    it('should reject invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        username: 'admin',
        password: 'wrongpassword'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify(invalidCredentials),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock database response for invalid credentials
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' }
      })

      // Act
      const response = await authHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Неверные учетные данные')
    })

    it('should handle database connection errors', async () => {
      // Arrange
      const validCredentials = {
        username: 'admin',
        password: 'admin123'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify(validCredentials),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock database error
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const response = await authHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Внутренняя ошибка сервера')
    })

    it('should validate required fields', async () => {
      // Arrange
      const incompleteCredentials = {
        username: 'admin'
        // missing password
      }

      mockRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify(incompleteCredentials),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Act
      const response = await authHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('password')
    })

    it('should handle malformed JSON', async () => {
      // Arrange
      mockRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Act
      const response = await authHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Неверный формат JSON')
    })

    it('should handle inactive admin accounts', async () => {
      // Arrange
      const validCredentials = {
        username: 'admin',
        password: 'admin123'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify(validCredentials),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock inactive admin account
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: {
          id: '1',
          username: 'admin',
          password_hash: '$2b$10$hashedpassword',
          is_active: false
        },
        error: null
      })

      // Act
      const response = await authHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Аккаунт деактивирован')
    })
  })
})
