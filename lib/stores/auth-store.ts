// Централизованное управление состоянием аутентификации
// Простая реализация без внешних зависимостей

import { AuthSession, User, LoginCredentials, AdminCredentials } from '@/types/api'
import { AppError, AuthenticationError } from '@/types/errors'
import logger from '../logger'

// ===== ТИПЫ =====

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AppError | null
}

interface AuthStore extends AuthState {
  // Действия
  login: (credentials: LoginCredentials) => Promise<void>
  loginAdmin: (credentials: AdminCredentials) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
  clearError: () => void
  
  // Утилиты
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

// ===== ВАЛИДАЦИЯ =====

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password: string): boolean {
  return password.length >= 6
}

// ===== API ФУНКЦИИ =====

async function loginUser(credentials: LoginCredentials): Promise<AuthSession> {
  if (!validateEmail(credentials.email)) {
    throw new AuthenticationError('Invalid email format')
  }
  
  if (!validatePassword(credentials.password)) {
    throw new AuthenticationError('Password must be at least 6 characters')
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new AuthenticationError(errorData.error?.message || 'Login failed')
  }

  return response.json()
}

async function loginAdmin(credentials: AdminCredentials): Promise<AuthSession> {
  if (!credentials.username || !credentials.password) {
    throw new AuthenticationError('Username and password are required')
  }

  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new AuthenticationError(errorData.error?.message || 'Admin login failed')
  }

  return response.json()
}

async function refreshUserSession(): Promise<AuthSession> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new AuthenticationError('Session refresh failed')
  }

  return response.json()
}

// ===== STORE РЕАЛИЗАЦИЯ =====

class AuthStoreImpl implements AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }

  private listeners: Set<() => void> = new Set()

  constructor() {
    this.loadFromStorage()
    this.setupStorageListener()
  }

  // Геттеры
  get user(): User | null {
    return this.state.user
  }

  get isAuthenticated(): boolean {
    return this.state.isAuthenticated
  }

  get isLoading(): boolean {
    return this.state.isLoading
  }

  get error(): AppError | null {
    return this.state.error
  }

  // Приватные методы
  private setState(newState: Partial<AuthState>): void {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.user && data.isAuthenticated) {
          this.setState({
            user: data.user,
            isAuthenticated: data.isAuthenticated,
          })
        }
      }
    } catch (error) {
      logger.error('Error loading auth state from storage', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const data = {
        user: this.state.user,
        isAuthenticated: this.state.isAuthenticated,
      }
      localStorage.setItem('auth-storage', JSON.stringify(data))
    } catch (error) {
      logger.error('Error saving auth state to storage', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  private setupStorageListener(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (event) => {
      if (event.key === 'auth-storage') {
        this.loadFromStorage()
      }
    })
  }

  // Публичные методы
  async login(credentials: LoginCredentials): Promise<void> {
    this.setState({ isLoading: true, error: null })
    
    try {
      const session = await loginUser(credentials)
      
      this.setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      this.saveToStorage()
    } catch (error) {
      const appError = error instanceof AppError ? error : new AuthenticationError('Login failed')
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: appError,
      })
      throw appError
    }
  }

  async loginAdmin(credentials: AdminCredentials): Promise<void> {
    this.setState({ isLoading: true, error: null })
    
    try {
      const session = await loginAdmin(credentials)
      
      this.setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      this.saveToStorage()
    } catch (error) {
      const appError = error instanceof AppError ? error : new AuthenticationError('Admin login failed')
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: appError,
      })
      throw appError
    }
  }

  logout(): void {
    // Очищаем localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage')
      localStorage.removeItem('user_session')
      localStorage.removeItem('admin_session')
    }
    
    this.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  }

  async refreshSession(): Promise<void> {
    if (!this.state.isAuthenticated) {
      return
    }

    this.setState({ isLoading: true })
    
    try {
      const session = await refreshUserSession()
      
      this.setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      this.saveToStorage()
    } catch (error) {
      // При ошибке обновления сессии выходим
      this.logout()
    }
  }

  clearError(): void {
    this.setState({ error: null })
  }

  hasRole(role: string): boolean {
    return this.state.user?.role === role
  }

  hasPermission(permission: string): boolean {
    if (!this.state.user) return false
    
    // Админ имеет все разрешения
    if (this.state.user.role === 'admin') return true
    
    // Тренер имеет разрешения на курсы
    if (this.state.user.role === 'trainer') {
      return ['courses:read', 'courses:write', 'bookings:read'].includes(permission)
    }
    
    // Пользователь имеет базовые разрешения
    return ['profile:read', 'profile:write'].includes(permission)
  }

  // Подписка на изменения
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

// ===== SINGLETON =====

const authStore = new AuthStoreImpl()

// ===== HOOKS =====

export function useAuth(): AuthStore {
  return authStore
}

export function useUser(): { user: User | null; isAuthenticated: boolean } {
  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
  }
}

export function usePermissions(): { hasRole: (role: string) => boolean; hasPermission: (permission: string) => boolean } {
  return {
    hasRole: authStore.hasRole.bind(authStore),
    hasPermission: authStore.hasPermission.bind(authStore),
  }
}

// ===== УТИЛИТЫ =====

export const isAdmin = (): boolean => {
  return authStore.hasRole('admin')
}

export const isTrainer = (): boolean => {
  return authStore.hasRole('trainer')
}

export const canAccess = (permission: string): boolean => {
  return authStore.hasPermission(permission)
}

// ===== АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ СЕССИИ =====

if (typeof window !== 'undefined') {
  // Обновляем сессию каждые 5 минут
  setInterval(() => {
    if (authStore.isAuthenticated) {
      authStore.refreshSession()
    }
  }, 5 * 60 * 1000)

  // Обновляем сессию при фокусе на окне
  window.addEventListener('focus', () => {
    if (authStore.isAuthenticated) {
      authStore.refreshSession()
    }
  })
}

export default authStore
