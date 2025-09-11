// Тесты для RAG Engine
// Негативные и граничные тесты для критических компонентов

import { generateRAGResponse, generateFallbackResponse } from '@/lib/rag-engine'
import { RAGContext, KnowledgeItem } from '@/types/api'

// Мокаем зависимости
jest.mock('@/lib/services/ai-service')
jest.mock('@/lib/services/database-service')

describe('RAG Engine', () => {
  describe('generateFallbackResponse', () => {
    const mockContext: RAGContext = {
      userMessage: 'test message',
      chatHistory: [],
      conversationId: 'test-conv',
      userContext: {}
    }

    const mockKnowledge: KnowledgeItem[] = [
      {
        id: '1',
        type: 'faq',
        question: 'test question',
        answer: 'test answer',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    it('should handle empty knowledge base', () => {
      const result = generateFallbackResponse(mockContext, [])
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle null knowledge base', () => {
      const result = generateFallbackResponse(mockContext, null as any)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle undefined knowledge base', () => {
      const result = generateFallbackResponse(mockContext, undefined as any)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle very long user message', () => {
      const longMessage = 'a'.repeat(10000)
      const context = { ...mockContext, userMessage: longMessage }
      const result = generateFallbackResponse(context, mockKnowledge)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle special characters in message', () => {
      const specialMessage = '!@#$%^&*()_+{}|:"<>?[]\\;\',./'
      const context = { ...mockContext, userMessage: specialMessage }
      const result = generateFallbackResponse(context, mockKnowledge)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle unicode characters', () => {
      const unicodeMessage = 'Привет! 🌟 Тест с эмодзи 🚀'
      const context = { ...mockContext, userMessage: unicodeMessage }
      const result = generateFallbackResponse(context, mockKnowledge)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle empty user message', () => {
      const context = { ...mockContext, userMessage: '' }
      const result = generateFallbackResponse(context, mockKnowledge)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle whitespace-only message', () => {
      const context = { ...mockContext, userMessage: '   \n\t   ' }
      const result = generateFallbackResponse(context, mockKnowledge)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle knowledge items with missing fields', () => {
      const incompleteKnowledge: Array<{ question: string; answer: string; type: string }> = [
        { id: '1', question: 'test' }, // missing answer
        { id: '2', answer: 'test' }, // missing question
        { id: '3' }, // missing both
        null, // null item
        undefined // undefined item
      ]
      const result = generateFallbackResponse(mockContext, incompleteKnowledge)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle greeting messages', () => {
      const greetings = ['привет', 'здравствуй', 'hello', 'hi']
      greetings.forEach(greeting => {
        const context = { ...mockContext, userMessage: greeting }
        const result = generateFallbackResponse(context, mockKnowledge)
        expect(result).toContain('Здравствуйте')
      })
    })

    it('should handle price-related messages', () => {
      const priceMessages = ['цена', 'стоимость', 'сколько стоит']
      priceMessages.forEach(message => {
        const context = { ...mockContext, userMessage: message }
        const result = generateFallbackResponse(context, mockKnowledge)
        expect(result).toContain('Стоимость')
      })
    })

    it('should handle schedule-related messages', () => {
      const scheduleMessages = ['расписание', 'время', 'когда']
      scheduleMessages.forEach(message => {
        const context = { ...mockContext, userMessage: message }
        const result = generateFallbackResponse(context, mockKnowledge)
        expect(result).toContain('Расписание')
      })
    })

    it('should handle address-related messages', () => {
      const addressMessages = ['адрес', 'где', 'находится']
      addressMessages.forEach(message => {
        const context = { ...mockContext, userMessage: message }
        const result = generateFallbackResponse(context, mockKnowledge)
        expect(result).toContain('адрес')
      })
    })

    it('should handle booking-related messages', () => {
      const bookingMessages = ['записаться', 'хочу', 'можно']
      bookingMessages.forEach(message => {
        const context = { ...mockContext, userMessage: message }
        const result = generateFallbackResponse(context, mockKnowledge)
        expect(result).toContain('запись')
      })
    })
  })

  describe('generateRAGResponse', () => {
    const mockContext: RAGContext = {
      userMessage: 'test message',
      chatHistory: [],
      conversationId: 'test-conv',
      userContext: {}
    }

    it('should handle empty context', () => {
      const emptyContext = {} as RAGContext
      return expect(generateRAGResponse(emptyContext)).resolves.toBeDefined()
    })

    it('should handle context with missing required fields', () => {
      const incompleteContext = {
        userMessage: 'test'
      } as RAGContext
      return expect(generateRAGResponse(incompleteContext)).resolves.toBeDefined()
    })

    it('should handle very long conversation history', () => {
      const longHistory = Array(1000).fill(0).map((_, i) => ({
        type: 'user' as const,
        text: `message ${i}`,
        timestamp: new Date().toISOString()
      }))
      const context = { ...mockContext, chatHistory: longHistory }
      return expect(generateRAGResponse(context)).resolves.toBeDefined()
    })

    it('should handle context with special characters', () => {
      const context = {
        ...mockContext,
        userMessage: '!@#$%^&*()_+{}|:"<>?[]\\;\',./',
        userName: 'Test User <script>alert("xss")</script>',
        platform: 'test-platform'
      }
      return expect(generateRAGResponse(context)).resolves.toBeDefined()
    })

    it('should handle context with very long user message', () => {
      const context = {
        ...mockContext,
        userMessage: 'a'.repeat(50000) // Very long message
      }
      return expect(generateRAGResponse(context)).resolves.toBeDefined()
    })

    it('should handle context with null/undefined values', () => {
      const context = {
        userMessage: 'test',
        chatHistory: null as any,
        conversationId: undefined as any,
        userContext: null as any
      }
      return expect(generateRAGResponse(context)).resolves.toBeDefined()
    })
  })
})