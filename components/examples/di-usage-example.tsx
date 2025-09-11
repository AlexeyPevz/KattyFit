"use client"

// Пример использования DI контейнера в React компоненте
// Демонстрирует, как использовать сервисы через хуки

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  useLogger, 
  useAuth, 
  useValidation, 
  useCache, 
  useAnalytics,
  useNotifications,
  useEmail,
  useFileService
} from '@/hooks/use-di'

export function DIUsageExample() {
  const logger = useLogger()
  const auth = useAuth()
  const validation = useValidation()
  const cache = useCache()
  const analytics = useAnalytics()
  const notifications = useNotifications()
  const email = useEmail()
  const fileService = useFileService()

  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [cacheKey, setCacheKey] = useState('')
  const [cacheValue, setCacheValue] = useState('')
  const [cachedData, setCachedData] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Логируем загрузку компонента
    logger.info('DI Usage Example component loaded')
    
    // Отслеживаем просмотр страницы
    analytics.trackPageView('di-usage-example')
    
    // Проверяем аутентификацию
    setIsAuthenticated(auth.isAuthenticated())
  }, [logger, analytics, auth])

  const handleLogin = async () => {
    try {
      logger.info('Attempting login', { email: emailInput })
      
      // Валидируем email
      if (!validation.validateEmail(emailInput)) {
        notifications.sendNotification('current-user', 'Invalid email format', 'error')
        return
      }

      // Валидируем пароль
      const passwordValidation = validation.validatePassword(passwordInput)
      if (!passwordValidation.isValid) {
        notifications.sendNotification('current-user', `Password errors: ${passwordValidation.errors.join(', ')}`, 'error')
        return
      }

      // Выполняем аутентификацию
      const result = await auth.login({ username: emailInput, password: passwordInput })
      
      if (result.success) {
        setIsAuthenticated(true)
        logger.info('Login successful', { userId: result.user?.id })
        analytics.trackEvent('user_login', { userId: result.user?.id })
        notifications.sendNotification('current-user', 'Login successful!', 'info')
      } else {
        logger.warn('Login failed', { email: emailInput })
        notifications.sendNotification('current-user', 'Login failed', 'error')
      }
    } catch (error) {
      logger.error('Login error', { error: error instanceof Error ? error.message : String(error) })
      notifications.sendNotification('current-user', 'Login error occurred', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
      setIsAuthenticated(false)
      logger.info('User logged out')
      analytics.trackEvent('user_logout')
      notifications.sendNotification('current-user', 'Logged out successfully', 'info')
    } catch (error) {
      logger.error('Logout error', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleCacheSet = async () => {
    try {
      await cache.set(cacheKey, cacheValue, 300) // TTL 5 minutes
      logger.info('Data cached', { key: cacheKey })
      notifications.sendNotification('current-user', 'Data cached successfully', 'info')
    } catch (error) {
      logger.error('Cache set error', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleCacheGet = async () => {
    try {
      const data = await cache.get<string>(cacheKey)
      setCachedData(data)
      logger.info('Data retrieved from cache', { key: cacheKey, found: !!data })
    } catch (error) {
      logger.error('Cache get error', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleSendEmail = async () => {
    try {
      const result = await email.sendEmail(
        emailInput,
        'Test Email from DI Example',
        'This is a test email sent using the DI container!'
      )
      
      if (result) {
        logger.info('Email sent successfully')
        notifications.sendNotification('current-user', 'Email sent successfully', 'info')
      } else {
        logger.warn('Failed to send email')
        notifications.sendNotification('current-user', 'Failed to send email', 'error')
      }
    } catch (error) {
      logger.error('Email send error', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await fileService.uploadFile(file, 'examples')
      
      if (result.success) {
        logger.info('File uploaded successfully', { fileName: file.name, url: result.url })
        notifications.sendNotification('current-user', `File uploaded: ${file.name}`, 'info')
      } else {
        logger.warn('File upload failed', { error: result.error })
        notifications.sendNotification('current-user', `File upload failed: ${result.error}`, 'error')
      }
    } catch (error) {
      logger.error('File upload error', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DI Container Usage Example</CardTitle>
          <CardDescription>
            Демонстрация использования различных сервисов через DI контейнер
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Authentication</h3>
            <div className="flex items-center space-x-2">
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
              {isAuthenticated && (
                <span className="text-sm text-gray-600">
                  User: {auth.getCurrentUser()?.username}
                </span>
              )}
            </div>
            
            {!isAuthenticated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleLogin}>Login</Button>
                </div>
              </div>
            ) : (
              <Button onClick={handleLogout}>Logout</Button>
            )}
          </div>

          {/* Cache Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cache Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cache-key">Cache Key</Label>
                <Input
                  id="cache-key"
                  value={cacheKey}
                  onChange={(e) => setCacheKey(e.target.value)}
                  placeholder="Enter cache key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cache-value">Cache Value</Label>
                <Input
                  id="cache-value"
                  value={cacheValue}
                  onChange={(e) => setCacheValue(e.target.value)}
                  placeholder="Enter cache value"
                />
              </div>
              <div className="md:col-span-2 flex space-x-2">
                <Button onClick={handleCacheSet}>Set Cache</Button>
                <Button onClick={handleCacheGet} variant="outline">Get Cache</Button>
              </div>
            </div>
            
            {cachedData && (
              <div className="p-3 bg-gray-100 rounded">
                <strong>Cached Data:</strong> {cachedData}
              </div>
            )}
          </div>

          {/* Email Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Email Service</h3>
            <Button onClick={handleSendEmail} disabled={!emailInput}>
              Send Test Email
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">File Service</h3>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Validation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Validation Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Validation</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email to validate"
                  />
                  <Badge variant={validation.validateEmail(emailInput) ? "default" : "destructive"}>
                    {validation.validateEmail(emailInput) ? "Valid" : "Invalid"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password Validation</Label>
                <div className="space-y-1">
                  <Input
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password to validate"
                  />
                  {passwordInput && (
                    <div className="text-sm">
                      {validation.validatePassword(passwordInput).errors.map((error, index) => (
                        <div key={index} className="text-red-500">• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}