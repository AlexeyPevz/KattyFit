// Тесты для Environment Configuration
// Негативные и граничные тесты для переменных окружения

import { env, isConfigured, getMissingVariables, getOptionalVariables, validateConfiguration } from '@/lib/env'

// Мокаем process.env
const originalEnv = process.env

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Очищаем process.env
    process.env = {}
  })

  afterEach(() => {
    // Восстанавливаем оригинальный process.env
    process.env = originalEnv
  })

  describe('isConfigured', () => {
    it('should return false when no environment variables are set', () => {
      expect(isConfigured()).toBe(false)
    })

    it('should return false when only some required variables are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      expect(isConfigured()).toBe(false)
    })

    it('should return false when required variables are empty', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
      process.env.SUPABASE_SERVICE_ROLE_KEY = ''
      process.env.ADMIN_USERNAME = ''
      process.env.ADMIN_PASSWORD = ''
      expect(isConfigured()).toBe(false)
    })

    it('should return false when required variables are null', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'null'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'null'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'null'
      process.env.ADMIN_USERNAME = 'null'
      process.env.ADMIN_PASSWORD = 'null'
      expect(isConfigured()).toBe(false)
    })

    it('should return false when required variables are undefined', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'undefined'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'undefined'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'undefined'
      process.env.ADMIN_USERNAME = 'undefined'
      process.env.ADMIN_PASSWORD = 'undefined'
      expect(isConfigured()).toBe(false)
    })

    it('should return true when all required variables are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      expect(isConfigured()).toBe(true)
    })
  })

  describe('getMissingVariables', () => {
    it('should return all required variables when none are set', () => {
      const missing = getMissingVariables()
      expect(missing).toContain('NEXT_PUBLIC_SUPABASE_URL')
      expect(missing).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
      expect(missing).toContain('SUPABASE_SERVICE_ROLE_KEY')
      expect(missing).toContain('ADMIN_USERNAME')
      expect(missing).toContain('ADMIN_PASSWORD')
    })

    it('should return empty array when all required variables are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      
      const missing = getMissingVariables()
      expect(missing).toHaveLength(0)
    })

    it('should return only missing variables when some are set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      // Missing SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
      
      const missing = getMissingVariables()
      expect(missing).toContain('SUPABASE_SERVICE_ROLE_KEY')
      expect(missing).toContain('ADMIN_USERNAME')
      expect(missing).toContain('ADMIN_PASSWORD')
      expect(missing).not.toContain('NEXT_PUBLIC_SUPABASE_URL')
      expect(missing).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    })
  })

  describe('getOptionalVariables', () => {
    it('should return all optional variables when none are set', () => {
      const optional = getOptionalVariables()
      expect(optional).toContain('YANDEXGPT_API_KEY')
      expect(optional).toContain('OPENAI_API_KEY')
      expect(optional).toContain('VK_API_TOKEN')
      expect(optional).toContain('TELEGRAM_BOT_TOKEN')
      expect(optional).toContain('CLOUDPAYMENTS_SECRET')
      expect(optional).toContain('ELEVENLABS_API_KEY')
      expect(optional).toContain('CONTENTSTUDIO_API_KEY')
    })

    it('should return empty array when all optional variables are set', () => {
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      process.env.OPENAI_API_KEY = 'test-openai-key'
      process.env.VK_API_TOKEN = 'test-vk-token'
      process.env.TELEGRAM_BOT_TOKEN = 'test-telegram-token'
      process.env.CLOUDPAYMENTS_SECRET = 'test-cloudpayments-secret'
      process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key'
      process.env.CONTENTSTUDIO_API_KEY = 'test-contentstudio-key'
      
      const optional = getOptionalVariables()
      expect(optional).toHaveLength(0)
    })

    it('should return only missing optional variables when some are set', () => {
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      process.env.OPENAI_API_KEY = 'test-openai-key'
      // Missing VK_API_TOKEN, TELEGRAM_BOT_TOKEN, CLOUDPAYMENTS_SECRET, ELEVENLABS_API_KEY, CONTENTSTUDIO_API_KEY
      
      const optional = getOptionalVariables()
      expect(optional).toContain('VK_API_TOKEN')
      expect(optional).toContain('TELEGRAM_BOT_TOKEN')
      expect(optional).toContain('CLOUDPAYMENTS_SECRET')
      expect(optional).toContain('ELEVENLABS_API_KEY')
      expect(optional).toContain('CONTENTSTUDIO_API_KEY')
      expect(optional).not.toContain('YANDEXGPT_API_KEY')
      expect(optional).not.toContain('OPENAI_API_KEY')
    })
  })

  describe('validateConfiguration', () => {
    it('should return invalid when no environment variables are set', () => {
      const result = validateConfiguration()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD')
    })

    it('should return invalid when SUPABASE_URL does not use HTTPS', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('SUPABASE_URL must use HTTPS in production')
    })

    it('should return invalid when no AI service is configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      // No AI services configured
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one AI service (YandexGPT or OpenAI) should be configured')
    })

    it('should return invalid when no integration service is configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      // No integration services configured
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one integration service (VK or Telegram) should be configured')
    })

    it('should return valid when all required variables and at least one AI and integration service are configured', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      process.env.VK_API_TOKEN = 'test-vk-token'
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle very long environment variable values', () => {
      const longValue = 'a'.repeat(100000)
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = longValue
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      process.env.VK_API_TOKEN = 'test-vk-token'
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(true)
    })

    it('should handle environment variables with special characters', () => {
      const specialValue = '!@#$%^&*()_+{}|:"<>?[]\\;\',./'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = specialValue
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      process.env.VK_API_TOKEN = 'test-vk-token'
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(true)
    })

    it('should handle environment variables with unicode characters', () => {
      const unicodeValue = 'тест🌟'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = unicodeValue
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      process.env.YANDEXGPT_API_KEY = 'test-yandex-key'
      process.env.VK_API_TOKEN = 'test-vk-token'
      
      const result = validateConfiguration()
      expect(result.isValid).toBe(true)
    })
  })

  describe('env object', () => {
    it('should handle missing required variables gracefully', () => {
      // This should throw an error during initialization
      expect(() => {
        const env = require('@/lib/env').env
      }).toThrow()
    })

    it('should handle partial configuration gracefully', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      
      // This should not throw an error
      expect(() => {
        const env = require('@/lib/env').env
      }).not.toThrow()
    })

    it('should handle very long environment variable values', () => {
      const longValue = 'a'.repeat(100000)
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = longValue
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      
      // This should not throw an error
      expect(() => {
        const env = require('@/lib/env').env
      }).not.toThrow()
    })

    it('should handle environment variables with special characters', () => {
      const specialValue = '!@#$%^&*()_+{}|:"<>?[]\\;\',./'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = specialValue
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      
      // This should not throw an error
      expect(() => {
        const env = require('@/lib/env').env
      }).not.toThrow()
    })

    it('should handle environment variables with unicode characters', () => {
      const unicodeValue = 'тест🌟'
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = unicodeValue
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
      process.env.ADMIN_USERNAME = 'admin'
      process.env.ADMIN_PASSWORD = 'password'
      
      // This should not throw an error
      expect(() => {
        const env = require('@/lib/env').env
      }).not.toThrow()
    })
  })
})
