'use client'

import * as Sentry from '@sentry/nextjs'
import logger from '../logger'

// Интерфейс для пользовательского фидбека
export interface UserFeedback {
  message: string
  email?: string
  name?: string
  rating?: number
  category?: 'bug' | 'feature' | 'general' | 'performance'
  url?: string
  userAgent?: string
  timestamp?: Date
}

// Интерфейс для контекста ошибки
export interface ErrorContext {
  errorId?: string
  errorMessage?: string
  stackTrace?: string
  component?: string
  action?: string
}

// Класс для управления пользовательским фидбеком
export class UserFeedbackManager {
  private static instance: UserFeedbackManager
  private isInitialized = false

  private constructor() {}

  static getInstance(): UserFeedbackManager {
    if (!UserFeedbackManager.instance) {
      UserFeedbackManager.instance = new UserFeedbackManager()
    }
    return UserFeedbackManager.instance
  }

  // Инициализация
  initialize() {
    if (this.isInitialized) return

    // Настраиваем глобальный обработчик для сбора фидбека
    this.setupGlobalFeedbackHandler()

    this.isInitialized = true
    logger.info('User feedback manager initialized')
  }

  // Настройка глобального обработчика
  private setupGlobalFeedbackHandler() {
    if (typeof window === 'undefined') return

    // Добавляем кнопку фидбека на страницу
    this.addFeedbackButton()
  }

  // Добавление кнопки фидбека
  private addFeedbackButton() {
    if (typeof window === 'undefined') return

    // Проверяем, не добавлена ли уже кнопка
    if (document.getElementById('feedback-button')) return

    const button = document.createElement('button')
    button.id = 'feedback-button'
    button.innerHTML = '💬'
    button.title = 'Оставить отзыв'
    button.className = 'fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors duration-200'
    
    button.addEventListener('click', () => {
      this.showFeedbackModal()
    })

    document.body.appendChild(button)
  }

  // Показ модального окна фидбека
  private showFeedbackModal() {
    if (typeof window === 'undefined') return

    // Проверяем, не открыто ли уже модальное окно
    if (document.getElementById('feedback-modal')) return

    const modal = document.createElement('div')
    modal.id = 'feedback-modal'
    modal.className = 'fixed inset-0 z-50 overflow-y-auto'
    modal.innerHTML = `
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick="this.parentElement.parentElement.remove()"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form id="feedback-form" class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Оставить отзыв
                </h3>
                <div class="space-y-4">
                  <div>
                    <label for="feedback-rating" class="block text-sm font-medium text-gray-700">Оценка</label>
                    <select id="feedback-rating" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="">Выберите оценку</option>
                      <option value="1">1 - Очень плохо</option>
                      <option value="2">2 - Плохо</option>
                      <option value="3">3 - Удовлетворительно</option>
                      <option value="4">4 - Хорошо</option>
                      <option value="5">5 - Отлично</option>
                    </select>
                  </div>
                  <div>
                    <label for="feedback-category" class="block text-sm font-medium text-gray-700">Категория</label>
                    <select id="feedback-category" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="general">Общий отзыв</option>
                      <option value="bug">Сообщить об ошибке</option>
                      <option value="feature">Предложение функции</option>
                      <option value="performance">Проблемы с производительностью</option>
                    </select>
                  </div>
                  <div>
                    <label for="feedback-message" class="block text-sm font-medium text-gray-700">Сообщение *</label>
                    <textarea id="feedback-message" rows="4" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Опишите ваш отзыв..."></textarea>
                  </div>
                  <div>
                    <label for="feedback-name" class="block text-sm font-medium text-gray-700">Имя (необязательно)</label>
                    <input type="text" id="feedback-name" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ваше имя">
                  </div>
                  <div>
                    <label for="feedback-email" class="block text-sm font-medium text-gray-700">Email (необязательно)</label>
                    <input type="email" id="feedback-email" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="your@email.com">
                  </div>
                </div>
              </div>
            </div>
          </form>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" id="feedback-submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
              Отправить
            </button>
            <button type="button" id="feedback-cancel" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Отмена
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Обработчики событий
    const form = modal.querySelector('#feedback-form') as HTMLFormElement
    const submitButton = modal.querySelector('#feedback-submit') as HTMLButtonElement
    const cancelButton = modal.querySelector('#feedback-cancel') as HTMLButtonElement

    submitButton.addEventListener('click', () => {
      this.handleFeedbackSubmit(form)
    })

    cancelButton.addEventListener('click', () => {
      modal.remove()
    })

    // Закрытие по Escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        modal.remove()
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
  }

  // Обработка отправки фидбека
  private async handleFeedbackSubmit(form: HTMLFormElement) {
    const formData = new FormData(form)
    const feedback: UserFeedback = {
      message: formData.get('feedback-message') as string,
      rating: formData.get('feedback-rating') ? parseInt(formData.get('feedback-rating') as string) : undefined,
      category: (formData.get('feedback-category') as UserFeedback['category']) || 'general',
      name: formData.get('feedback-name') as string || undefined,
      email: formData.get('feedback-email') as string || undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
    }

    // Валидация
    if (!feedback.message.trim()) {
      alert('Пожалуйста, введите сообщение')
      return
    }

    try {
      // Отправляем фидбек
      await this.submitFeedback(feedback)
      
      // Показываем уведомление об успехе
      this.showSuccessNotification()
      
      // Закрываем модальное окно
      const modal = document.getElementById('feedback-modal')
      if (modal) modal.remove()
      
    } catch (error) {
      logger.error('Failed to submit feedback', { error: (error as Error).message })
      alert('Произошла ошибка при отправке отзыва. Попробуйте еще раз.')
    }
  }

  // Отправка фидбека
  private async submitFeedback(feedback: UserFeedback) {
    // Логируем фидбек
    logger.info('User feedback submitted', {
      category: feedback.category,
      rating: feedback.rating,
      hasMessage: !!feedback.message,
      hasName: !!feedback.name,
      hasEmail: !!feedback.email,
    })

    // Отправляем в Sentry
    Sentry.captureMessage('User feedback received', 'info', {
      tags: {
        feedbackCategory: feedback.category,
        feedbackRating: feedback.rating?.toString() || 'none',
      },
      extra: {
        message: feedback.message,
        name: feedback.name,
        email: feedback.email,
        url: feedback.url,
        userAgent: feedback.userAgent,
        timestamp: feedback.timestamp,
      },
    })

    // Отправляем на сервер (если есть API endpoint)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      // Если нет API endpoint, просто логируем
      logger.warn('No feedback API endpoint available', { error: (error as Error).message })
    }
  }

  // Показ уведомления об успехе
  private showSuccessNotification() {
    if (typeof window === 'undefined') return

    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg'
    notification.innerHTML = 'Спасибо за ваш отзыв!'
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // Отправка фидбека об ошибке
  async submitErrorFeedback(error: Error, context: ErrorContext) {
    const feedback: UserFeedback = {
      message: `Ошибка: ${error.message}`,
      category: 'bug',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date(),
    }

    // Добавляем контекст ошибки
    if (context.errorId) {
      feedback.message += `\n\nID ошибки: ${context.errorId}`
    }
    if (context.component) {
      feedback.message += `\n\nКомпонент: ${context.component}`
    }
    if (context.action) {
      feedback.message += `\n\nДействие: ${context.action}`
    }

    await this.submitFeedback(feedback)
  }
}

// Экспорт singleton instance
export const userFeedbackManager = UserFeedbackManager.getInstance()