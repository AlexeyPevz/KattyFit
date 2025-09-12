# Dependency Injection Container

Простой и мощный DI контейнер для управления зависимостями в приложении.

## Особенности

- ✅ **TypeScript поддержка** - Полная типизация всех сервисов
- ✅ **Singleton и Transient** - Гибкое управление жизненным циклом
- ✅ **Автоматическое разрешение зависимостей** - Контейнер сам находит и внедряет зависимости
- ✅ **React интеграция** - Удобные хуки для использования в компонентах
- ✅ **Декораторы** - `@Injectable` для автоматической регистрации
- ✅ **Тестирование** - Легкое мокирование для unit тестов

## Быстрый старт

### 1. Определение интерфейса сервиса

```typescript
// lib/di/services.ts
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
}
```

### 2. Создание реализации

```typescript
// lib/di/implementations.ts
import { Injectable } from './container'
import { ILogger } from './services'

@Injectable(true) // singleton
export class LoggerService implements ILogger {
  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, context)
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, context)
  }
}
```

### 3. Использование в React компоненте

```typescript
// components/MyComponent.tsx
import { useLogger } from '@/hooks/use-di'

export function MyComponent() {
  const logger = useLogger()

  const handleClick = () => {
    logger.info('Button clicked')
  }

  return <button onClick={handleClick}>Click me</button>
}
```

## API Reference

### Контейнер

```typescript
import { container } from '@/lib/di/container'

// Регистрация сервиса
container.register('myService', () => new MyService(), { singleton: true })

// Регистрация класса
container.registerClass('myService', MyService, { singleton: true })

// Регистрация значения
container.registerValue('myService', myInstance)

// Получение сервиса
const service = container.get<IMyService>('myService')

// Проверка существования
const exists = container.has('myService')
```

### Декораторы

```typescript
import { Injectable, Inject } from '@/lib/di/container'

@Injectable(true) // singleton
export class MyService {
  constructor(
    @Inject('logger') private logger: ILogger,
    @Inject('config') private config: IConfig
  ) {}
}
```

### React хуки

```typescript
import { 
  useService, 
  useServices, 
  useLogger, 
  useAuth 
} from '@/hooks/use-di'

// Получение одного сервиса
const logger = useService('logger')

// Получение нескольких сервисов
const { logger, auth, cache } = useServices(['logger', 'authService', 'cacheService'])

// Специализированные хуки
const logger = useLogger()
const auth = useAuth()
```

## Доступные сервисы

| Сервис | Интерфейс | Описание |
|--------|-----------|----------|
| `logger` | `ILogger` | Логирование |
| `authService` | `IAuthService` | Аутентификация |
| `emailService` | `IEmailService` | Отправка email |
| `fileService` | `IFileService` | Работа с файлами |
| `cacheService` | `ICacheService` | Кеширование |
| `analyticsService` | `IAnalyticsService` | Аналитика |
| `notificationService` | `INotificationService` | Уведомления |
| `validationService` | `IValidationService` | Валидация |
| `encryptionService` | `IEncryptionService` | Шифрование |
| `configService` | `IConfigService` | Конфигурация |
| `errorService` | `IErrorService` | Обработка ошибок |
| `apiService` | `IAPIService` | HTTP клиент |

## Примеры использования

### Аутентификация

```typescript
function LoginForm() {
  const auth = useAuth()
  const logger = useLogger()
  const notifications = useNotifications()

  const handleLogin = async (credentials) => {
    try {
      const result = await auth.login(credentials)
      if (result.success) {
        logger.info('User logged in', { userId: result.user.id })
        notifications.sendNotification('current-user', 'Welcome!', 'info')
      }
    } catch (error) {
      logger.error('Login failed', { error })
    }
  }

  return <form onSubmit={handleLogin}>...</form>
}
```

### Кеширование

```typescript
function DataComponent() {
  const cache = useCache()
  const [data, setData] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      // Пытаемся получить из кеша
      let cachedData = await cache.get('my-data')
      
      if (!cachedData) {
        // Загружаем данные
        cachedData = await fetchData()
        // Сохраняем в кеш на 5 минут
        await cache.set('my-data', cachedData, 300)
      }
      
      setData(cachedData)
    }

    loadData()
  }, [cache])

  return <div>{data && JSON.stringify(data)}</div>
}
```

### Валидация

```typescript
function ContactForm() {
  const validation = useValidation()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState([])

  const handleEmailChange = (value) => {
    setEmail(value)
    
    if (!validation.validateEmail(value)) {
      setErrors(['Invalid email format'])
    } else {
      setErrors([])
    }
  }

  return (
    <div>
      <input 
        value={email} 
        onChange={(e) => handleEmailChange(e.target.value)}
      />
      {errors.map(error => <div key={error} className="error">{error}</div>)}
    </div>
  )
}
```

## Тестирование

### Мокирование сервисов

```typescript
import { createTestContainer } from '@/lib/di/setup'

describe('MyComponent', () => {
  let mockLogger: jest.Mocked<ILogger>
  let testContainer: DIContainer

  beforeEach(() => {
    testContainer = createTestContainer()
    mockLogger = testContainer.get('logger')
  })

  it('should log when button clicked', () => {
    render(<MyComponent />)
    fireEvent.click(screen.getByText('Click me'))
    expect(mockLogger.info).toHaveBeenCalledWith('Button clicked')
  })
})
```

### Замена сервисов в тестах

```typescript
import { container } from '@/lib/di/container'

beforeEach(() => {
  // Заменяем реальный сервис на мок
  container.registerValue('logger', {
    info: jest.fn(),
    error: jest.fn(),
    // ... другие методы
  })
})
```

## Лучшие практики

### 1. Используйте интерфейсы

Всегда определяйте интерфейсы для ваших сервисов. Это упрощает тестирование и делает код более гибким.

### 2. Регистрируйте зависимости

Указывайте зависимости при регистрации сервисов:

```typescript
container.registerClass('userService', UserService, {
  dependencies: ['logger', 'apiService']
})
```

### 3. Используйте специализированные хуки

Вместо `useService('logger')` используйте `useLogger()` - это более читаемо и типобезопасно.

### 4. Группируйте связанные сервисы

```typescript
const { logger, auth, cache } = useServices(['logger', 'authService', 'cacheService'])
```

### 5. Обрабатывайте ошибки

```typescript
try {
  const result = await auth.login(credentials)
} catch (error) {
  logger.error('Login failed', { error })
  notifications.sendNotification('user', 'Login failed', 'error')
}
```

## Производительность

- **Singleton сервисы** создаются только один раз и переиспользуются
- **React хуки** используют `useMemo` для предотвращения лишних пересозданий
- **Ленивая загрузка** - сервисы создаются только при первом обращении

## Отладка

Для отладки можно получить список всех зарегистрированных сервисов:

```typescript
import { getRegisteredServices } from '@/lib/di/setup'

console.log('Registered services:', getRegisteredServices())
```