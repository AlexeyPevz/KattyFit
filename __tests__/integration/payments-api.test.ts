// Интеграционные тесты для Payments API
// Тестирование полного flow платежей через CloudPayments

import { NextRequest } from 'next/server'
import { POST as paymentHandler } from '@/app/api/payments/success/route'
import { AppError, ErrorCode } from '@/types/errors'

// Мокаем зависимости
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn()
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

jest.mock('@/lib/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}))

// Мокаем crypto для проверки подписи
jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mocked-signature')
  }))
}))

describe('Payments API Integration Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CLOUDPAYMENTS_SECRET = 'test-secret'
  })

  describe('POST /api/payments/success', () => {
    it('should handle successful payment webhook', async () => {
      // Arrange
      const paymentData = {
        TransactionId: '12345',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com',
        Data: {
          courseId: 'course-123',
          userId: 'user-123'
        }
      }

      const signature = 'mocked-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': signature
        }
      })

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'payment-123' }],
        error: null
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.code).toBe(0) // Success code
    })

    it('should handle failed payment webhook', async () => {
      // Arrange
      const failedPaymentData = {
        TransactionId: '12346',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com',
        Reason: 'Insufficient funds',
        ReasonCode: 5
      }

      const signature = 'mocked-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(failedPaymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': signature
        }
      })

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'payment-123' }],
        error: null
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.code).toBe(0) // Success code
    })

    it('should handle refund webhook', async () => {
      // Arrange
      const refundData = {
        TransactionId: '12347',
        Amount: 1000,
        Currency: 'RUB',
        OriginalTransactionId: '12345'
      }

      const signature = 'mocked-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(refundData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': signature
        }
      })

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().update().eq.mockResolvedValue({
        data: [{ id: 'payment-123' }],
        error: null
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.code).toBe(0) // Success code
    })

    it('should reject invalid signature', async () => {
      // Arrange
      const paymentData = {
        TransactionId: '12345',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com'
      }

      const invalidSignature = 'invalid-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': invalidSignature
        }
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.code).toBe(1) // Error code
    })

    it('should handle missing secret configuration', async () => {
      // Arrange
      delete process.env.CLOUDPAYMENTS_SECRET

      const paymentData = {
        TransactionId: '12345',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': 'signature'
        }
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.code).toBe(13) // Error code
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const paymentData = {
        TransactionId: '12345',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com',
        Data: {
          courseId: 'course-123',
          userId: 'user-123'
        }
      }

      const signature = 'mocked-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': signature
        }
      })

      // Mock database error
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().insert().select.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.code).toBe(13) // Error code
    })

    it('should handle malformed JSON', async () => {
      // Arrange
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': 'signature'
        }
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.code).toBe(1) // Error code
    })

    it('should handle check webhook type', async () => {
      // Arrange
      const checkData = {
        TransactionId: '12345',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com',
        Data: {
          courseId: 'course-123'
        }
      }

      const signature = 'mocked-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(checkData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': signature
        }
      })

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: { id: 'course-123', price: 1000 },
        error: null
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.code).toBe(0) // Success code
    })

    it('should handle unknown webhook types', async () => {
      // Arrange
      const unknownData = {
        Type: 'UnknownType',
        TransactionId: '12345',
        Amount: 1000
      }

      const signature = 'mocked-signature'
      mockRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(unknownData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': signature
        }
      })

      // Act
      const response = await paymentHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.code).toBe(0) // Success code (ignored)
    })
  })
})
