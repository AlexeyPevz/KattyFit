// Интеграционные тесты для Video Upload API
// Тестирование полного flow загрузки видео

import { NextRequest } from 'next/server'
import { POST as uploadHandler } from '@/app/api/video/upload/route'
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

// Мокаем video upload service
jest.mock('@/lib/video-upload-service', () => ({
  VideoUploadService: jest.fn().mockImplementation(() => ({
    uploadVideo: jest.fn()
  }))
}))

describe('Video Upload API Integration Tests', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/video/upload', () => {
    it('should upload video to VK successfully', async () => {
      // Arrange
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Mock video upload service
      const { VideoUploadService } = require('@/lib/video-upload-service')
      const mockUploadService = new VideoUploadService()
      mockUploadService.uploadVideo.mockResolvedValue([
        {
          platform: 'vk',
          success: true,
          videoId: 'vk-video-123',
          url: 'https://vk.com/video123',
          embedUrl: 'https://vk.com/video_ext.php?oid=123&id=456'
        }
      ])

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'content-123' }],
        error: null
      })

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveProperty('uploads')
      expect(responseData.data.uploads).toHaveLength(1)
      expect(responseData.data.uploads[0].platform).toBe('vk')
      expect(responseData.data.uploads[0].success).toBe(true)
    })

    it('should upload video to multiple platforms', async () => {
      // Arrange
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk,youtube')

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Mock video upload service
      const { VideoUploadService } = require('@/lib/video-upload-service')
      const mockUploadService = new VideoUploadService()
      mockUploadService.uploadVideo.mockResolvedValue([
        {
          platform: 'vk',
          success: true,
          videoId: 'vk-video-123',
          url: 'https://vk.com/video123'
        },
        {
          platform: 'youtube',
          success: true,
          videoId: 'yt-video-456',
          url: 'https://youtube.com/watch?v=456'
        }
      ])

      // Mock database operations
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().insert().select.mockResolvedValue({
        data: [{ id: 'content-123' }],
        error: null
      })

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.uploads).toHaveLength(2)
      expect(responseData.data.uploads[0].platform).toBe('vk')
      expect(responseData.data.uploads[1].platform).toBe('youtube')
    })

    it('should handle upload failures gracefully', async () => {
      // Arrange
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Mock video upload service failure
      const { VideoUploadService } = require('@/lib/video-upload-service')
      const mockUploadService = new VideoUploadService()
      mockUploadService.uploadVideo.mockResolvedValue([
        {
          platform: 'vk',
          success: false,
          error: 'VK API error: Invalid token'
        }
      ])

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.uploads[0].success).toBe(false)
      expect(responseData.data.uploads[0].error).toContain('VK API error')
    })

    it('should validate required fields', async () => {
      // Arrange
      const formData = new FormData()
      // Missing file and title

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('file')
    })

    it('should handle unsupported file types', async () => {
      // Arrange
      const invalidFile = new File(['text content'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', invalidFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Неподдерживаемый тип файла')
    })

    it('should handle file size limits', async () => {
      // Arrange
      // Create a large file (simulate)
      const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', largeFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Файл слишком большой')
    })

    it('should handle database errors', async () => {
      // Arrange
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'vk')

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Mock video upload service success
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

      // Mock database error
      const { supabaseAdmin } = require('@/lib/supabase-admin')
      supabaseAdmin.from().insert().select.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Ошибка сохранения в БД')
    })

    it('should handle missing platform configuration', async () => {
      // Arrange
      const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' })
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('title', 'Test Video')
      formData.append('description', 'Test Description')
      formData.append('platforms', 'youtube') // YouTube requires OAuth

      mockRequest = new NextRequest('http://localhost:3000/api/video/upload', {
        method: 'POST',
        body: formData
      })

      // Mock video upload service
      const { VideoUploadService } = require('@/lib/video-upload-service')
      const mockUploadService = new VideoUploadService()
      mockUploadService.uploadVideo.mockResolvedValue([
        {
          platform: 'youtube',
          success: false,
          error: 'YouTube OAuth token not available'
        }
      ])

      // Act
      const response = await uploadHandler(mockRequest)
      const responseData = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.uploads[0].success).toBe(false)
      expect(responseData.data.uploads[0].error).toContain('OAuth token not available')
    })
  })
})
