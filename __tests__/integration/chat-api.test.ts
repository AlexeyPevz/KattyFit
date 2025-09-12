// Интеграционные тесты для AI Chat API
// Тестирование полного flow AI чата с YandexGPT

import { NextRequest } from 'next/server'
import { POST as chatHandler } from '@/app/api/chat/yandexgpt/route'
import { AppError, ErrorCode } from '@/types/errors'

// Мокаем зависимости
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

// Мокаем AI сервис
jest.mock('@/lib/services/ai-service', () => ({
  AIService: {
    getInstance: jest.fn(() => ({
      generateResponse: jest.fn()
    }))
  }
}))

describe('Chat API Integration Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/chat/yandexgpt', () => {
    it('should generate AI response for valid chat message', async () => {
      // Arrange
      const validChatRequest = {
        message: 'Привет, как дела?',
        platform: 'web',
        userName: 'Test User',
        conversationId: 'test-conversation-123'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify(validChatRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock AI service response
      const { AIService } = require('@/lib/services/ai-service')
      AIService.getInstance().generateResponse.mockResolvedValue({
        success: true,
        response: 'Привет! У меня все хорошо, спасибо за вопрос!',
        usage: {
          promptTokens: 10,
          completionTokens: 15,
          totalTokens: 25
        }
      })

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().select().eq().single.mockResolvedValue({
        data: { id: '1', name: 'Test User' },
        error: null
      })
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'msg-123' }],
        error: null
      })

      // Act
      const response = await chatHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('response')
      expect(responseData.data.response).toContain('Привет!')
      expect(responseData.data).toHaveProperty('conversationId')
    })

    it('should handle AI service errors gracefully', async () => {
      // Arrange
      const validChatRequest = {
        message: 'Test message',
        platform: 'web',
        userName: 'Test User'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify(validChatRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock AI service error
      const { AIService } = require('@/lib/services/ai-service')
      AIService.getInstance().generateResponse.mockRejectedValue(
        new Error('AI service unavailable')
      )

      // Act
      const response = await chatHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Ошибка AI сервиса')
    })

    it('should validate required message field', async () => {
      // Arrange
      const invalidRequest = {
        platform: 'web',
        userName: 'Test User'
        // missing message
      }

      mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify(invalidRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Act
      const response = await chatHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('message')
    })

    it('should handle empty message', async () => {
      // Arrange
      const emptyMessageRequest = {
        message: '',
        platform: 'web',
        userName: 'Test User'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify(emptyMessageRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Act
      const response = await chatHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Сообщение не может быть пустым')
    })

    it('should handle very long messages', async () => {
      // Arrange
      const longMessage = 'A'.repeat(10000) // Very long message
      const longMessageRequest = {
        message: longMessage,
        platform: 'web',
        userName: 'Test User'
      }

      mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: JSON.stringify(longMessageRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Mock AI service response
      const { AIService } = require('@/lib/services/ai-service')
      AIService.getInstance().generateResponse.mockResolvedValue({
        success: true,
        response: 'Сообщение слишком длинное, попробуйте сократить.',
        usage: {
          promptTokens: 1000,
          completionTokens: 10,
          totalTokens: 1010
        }
      })

      // Act
      const response = await chatHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
    })

    it('should handle different platforms correctly', async () => {
      // Arrange
      const platforms = ['web', 'telegram', 'vk', 'whatsapp']
      
      for (const platform of platforms) {
        const platformRequest = {
          message: 'Test message',
          platform: platform,
          userName: 'Test User'
        }

        mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
          method: 'POST',
          body: JSON.stringify(platformRequest),
          headers: {
            'Content-Type': 'application/json'
          }
        })

        // Mock AI service response
        const { AIService } = require('@/lib/services/ai-service')
        AIService.getInstance().generateResponse.mockResolvedValue({
          success: true,
          response: `Response for ${platform}`,
          usage: {
            promptTokens: 10,
            completionTokens: 5,
            totalTokens: 15
          }
        })

        // Act
        const response = await chatHandler(mockRequest)
        const responseData = await response.json()

        // Assert
        expect(response.status).toBe(200)
        expect(responseData.success).toBe(true)
        expect(responseData.data.platform).toBe(platform)
      }
    })

    it('should handle malformed JSON gracefully', async () => {
      // Arrange
      mockRequest = new NextRequest('http://localhost:3000/api/chat/yandexgpt', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Act
      const response = await chatHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Неверный формат JSON')
    })
  })
})