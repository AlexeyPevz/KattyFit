// Главный файл для запуска всех интеграционных тестов
// Тестирование полного flow приложения

import { NextRequest } from 'next/server'
import { POST as authHandler } from '@/app/api/admin/auth/route'
import { POST as chatHandler } from '@/app/api/chat/yandexgpt/route'
import { POST as uploadHandler } from '@/app/api/video/upload/route'
import { POST as paymentHandler } from '@/app/api/payments/success/route'

// Мокаем все зависимости
jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn()
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

jest.mock('@/lib/services/ai-service', () => ({
  AIService: {
    getInstance: jest.fn(() => ({
      generateResponse: jest.fn()
    }))
  }
}))

jest.mock('@/lib/video-upload-service', () => ({
  VideoUploadService: jest.fn().mockImplementation(() => ({
    uploadVideo: jest.fn()
  }))
}))

jest.mock('crypto', () => ({
  createHmac: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mocked-signature')
  }))
}))

describe('Full Application Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CLOUDPAYMENTS_SECRET = 'test-secret'
  })

  describe('Complete User Journey', () => {
    it('should handle complete admin workflow', async () => {
      // 1. Admin authentication
      const authRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

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

      const authResponse = await authHandler(authRequest)
      const authData = await authResponse.json()
      expect(authResponse.status).toBe(200)
      expect(authData.success).toBe(true)

      // 2. AI Chat interaction
      const chatRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify({
          message: 'How can I help you today?',
          platform: 'web',
          userName: 'Admin User'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const { AIService } = require('@/lib/services/ai-service')
      AIService.getInstance().generateResponse.mockResolvedValue({
        success: true,
        response: 'I can help you with various tasks.',
        usage: {
          promptTokens: 10,
          completionTokens: 15,
          totalTokens: 25
        }
      })

      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: { id: '1', name: 'Admin User' },
        error: null
      })
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'msg-123' }],
        error: null
      })

      const chatResponse = await chatHandler(chatRequest)
      const chatData = await chatResponse.json()
      expect(chatResponse.status).toBe(200)
      expect(chatData.success).toBe(true)

      // 3. Video upload
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      const uploadRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      const { VideoUploadService } = require('@/lib/video-upload-service')
      const mockUploadService = new VideoUploadService()
      mockUploadService.uploadVideo.mockResolvedValue([
        {
          platform: 'vk',
          success: true,
          videoId: 'vk-video-123',
          url: 'https://vk.com/video123'
        }
      ])

      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'content-123' }],
        error: null
      })

      const uploadResponse = await uploadHandler(uploadRequest)
      const uploadData = await uploadResponse.json()
      expect(uploadResponse.status).toBe(200)
      expect(uploadData.success).toBe(true)

      // 4. Payment processing
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

      const paymentRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': 'mocked-signature'
        }
      })

      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'payment-123' }],
        error: null
      })

      const paymentResponse = await paymentHandler(paymentRequest)
      const paymentResponseData = await paymentResponse.json()
      expect(paymentResponse.status).toBe(200)
      expect(paymentResponseData.code).toBe(0)
    })

    it('should handle error scenarios gracefully', async () => {
      // Test authentication failure
      const authRequest = new NextRequest('http://localhost:3000/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({
          username: 'admin',
          password: 'wrongpassword'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' }
      })

      const authResponse = await authHandler(authRequest)
      const authData = await authResponse.json()
      expect(authResponse.status).toBe(401)
      expect(authData.success).toBe(false)

      // Test chat with AI service error
      const chatRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          platform: 'web',
          userName: 'Test User'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const { AIService } = require('@/lib/services/ai-service')
      AIService.getInstance().generateResponse.mockRejectedValue(
        new Error('AI service unavailable')
      )

      const chatResponse = await chatHandler(chatRequest)
      const chatData = await chatResponse.json()
      expect(chatResponse.status).toBe(500)
      expect(chatData.success).toBe(false)

      // Test video upload with invalid file
      const invalidFile = new File(['text content'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', invalidFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      const uploadRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      const uploadResponse = await uploadHandler(uploadRequest)
      const uploadData = await uploadResponse.json()
      expect(uploadResponse.status).toBe(400)
      expect(uploadData.success).toBe(false)

      // Test payment with invalid signature
      const paymentData = {
        TransactionId: '12345',
        Amount: 1000,
        Currency: 'RUB',
        Email: 'test@example.com'
      }

      const paymentRequest = new NextRequest('http://localhost:3000/api/payments/success', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Content-Type': 'application/json',
          'X-CloudPayments-Signature': 'invalid-signature'
        }
      })

      const paymentResponse = await paymentHandler(paymentRequest)
      const paymentResponseData = await paymentResponse.json()
      expect(paymentResponse.status).toBe(400)
      expect(paymentResponseData.code).toBe(1)
    })
  })

  describe('Performance and Load Tests', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => {
        const chatRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
          method: 'POST',
          body: JSON.stringify({
            message: `Test message ${i}`,
            platform: 'web',
            userName: `User ${i}`
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        return chatHandler(chatRequest)
      })

      const { AIService } = require('@/lib/services/ai-service')
      AIService.getInstance().generateResponse.mockResolvedValue({
        success: true,
        response: 'Test response',
        usage: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15
        }
      })

      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: { id: '1', name: 'Test User' },
        error: null
      })
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'msg-123' }],
        error: null
      })

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })
    })
  })
})
