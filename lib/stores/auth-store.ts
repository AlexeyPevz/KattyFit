// Централизованное управление состоянием аутентификации
// Использует Zustand для простоты и производительности

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthSession, User, LoginCredentials, AdminCredentials } from '@/types/api'
import { AppError, AuthenticationError } from '@/types/errors'

// ===== СОСТОЯНИЕ =====

interface AuthState {
  // Состояние
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AppError | null
  
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

// ===== STORE =====

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Логин пользователя
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const session = await loginUser(credentials)
          
          set({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const appError = error instanceof AppError ? error : new AuthenticationError('Login failed')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: appError,
          })
          throw appError
        }
      },

      // Логин администратора
      loginAdmin: async (credentials: AdminCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const session = await loginAdmin(credentials)
          
          set({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const appError = error instanceof AppError ? error : new AuthenticationError('Admin login failed')
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: appError,
          })
          throw appError
        }
      },

      // Выход
      logout: () => {
        // Очищаем localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_session')
          localStorage.removeItem('admin_session')
        }
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      // Обновление сессии
      refreshSession: async () => {
        const { isAuthenticated } = get()
        
        if (!isAuthenticated) {
          return
        }

        set({ isLoading: true })
        
        try {
          const session = await refreshUserSession()
          
          set({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // При ошибке обновления сессии выходим
          get().logout()
        }
      },

      // Очистка ошибки
      clearError: () => {
        set({ error: null })
      },

      // Проверка роли
      hasRole: (role: string) => {
        const { user } = get()
        return user?.role === role
      },

      // Проверка разрешения
      hasPermission: (permission: string) => {
        const { user } = get()
        
        if (!user) return false
        
        // Админ имеет все разрешения
        if (user.role === 'admin') return true
        
        // Тренер имеет разрешения на курсы
        if (user.role === 'trainer') {
          return ['courses:read', 'courses:write', 'bookings:read'].includes(permission)
        }
        
        // Пользователь имеет базовые разрешения
        return ['profile:read', 'profile:write'].includes(permission)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ===== HOOKS =====

export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    loginAdmin: store.loginAdmin,
    logout: store.logout,
    refreshSession: store.refreshSession,
    clearError: store.clearError,
    hasRole: store.hasRole,
    hasPermission: store.hasPermission,
  }
}

export const useUser = () => {
  const { user, isAuthenticated } = useAuthStore()
  return { user, isAuthenticated }
}

export const usePermissions = () => {
  const { hasRole, hasPermission } = useAuthStore()
  return { hasRole, hasPermission }
}

// ===== УТИЛИТЫ =====

export const isAdmin = (): boolean => {
  return useAuthStore.getState().hasRole('admin')
}

export const isTrainer = (): boolean => {
  return useAuthStore.getState().hasRole('trainer')
}

export const canAccess = (permission: string): boolean => {
  return useAuthStore.getState().hasPermission(permission)
}

// ===== АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ СЕССИИ =====

if (typeof window !== 'undefined') {
  // Обновляем сессию каждые 5 минут
  setInterval(() => {
    const { isAuthenticated, refreshSession } = useAuthStore.getState()
    if (isAuthenticated) {
      refreshSession()
    }
  }, 5 * 60 * 1000)

  // Обновляем сессию при фокусе на окне
  window.addEventListener('focus', () => {
    const { isAuthenticated, refreshSession } = useAuthStore.getState()
    if (isAuthenticated) {
      refreshSession()
    }
  })
}