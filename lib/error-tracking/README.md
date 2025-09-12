# Error Tracking System

Система отслеживания ошибок и мониторинга производительности для AI Content Studio.

## Компоненты

### 1. Sentry Integration (`sentry.ts`)
- Инициализация Sentry для клиента и сервера
- Настройка фильтрации чувствительных данных
- Конфигурация тегов и контекста

### 2. Error Boundary (`error-boundary.tsx`)
- React Error Boundary для перехвата ошибок в компонентах
- HOC `withErrorBoundary` для оборачивания компонентов
- Пользовательский интерфейс для отображения ошибок

### 3. Performance Monitoring (`performance-monitoring.ts`)
- Мониторинг Web Vitals (CLS, FID, FCP, LCP, TTFB, INP)
- Отслеживание загрузки ресурсов
- Мониторинг навигации
- Проверка пороговых значений производительности

### 4. User Feedback (`user-feedback.ts`)
- Система сбора пользовательского фидбека
- Модальное окно для отправки отзывов
- Интеграция с Sentry для отправки фидбека об ошибках

## Использование

### Инициализация
```typescript
import { initializeErrorTracking } from '@/lib/error-tracking'

// Инициализация всех сервисов
initializeErrorTracking()
```

### Error Boundary
```typescript
import { ErrorBoundary, withErrorBoundary } from '@/lib/error-tracking/error-boundary'

// Обертка компонента
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <MyComponent />
</ErrorBoundary>

// HOC
const SafeComponent = withErrorBoundary(MyComponent)
```

### Performance Monitoring
```typescript
import { performanceMonitor } from '@/lib/error-tracking/performance-monitoring'

// Добавление пользовательской метрики
performanceMonitor.addMetric({
  name: 'custom_metric',
  value: 100,
  unit: 'ms',
  tags: { feature: 'search' }
})
```

### User Feedback
```typescript
import { userFeedbackManager } from '@/lib/error-tracking/user-feedback'

// Отправка фидбека об ошибке
await userFeedbackManager.submitErrorFeedback(error, {
  errorId: 'error-123',
  component: 'SearchForm',
  action: 'search'
})
```

## Конфигурация

### Environment Variables
```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_RELEASE=1.0.0
```

### Next.js Configuration
Sentry интегрирован в `next.config.js` с помощью `withSentryConfig`.

## API Endpoints

### POST /api/feedback
Принимает пользовательский фидбек и сохраняет его.

**Request Body:**
```json
{
  "message": "string",
  "email": "string (optional)",
  "name": "string (optional)",
  "rating": "number (1-5, optional)",
  "category": "bug | feature | general | performance (optional)",
  "url": "string (optional)",
  "userAgent": "string (optional)",
  "timestamp": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback received successfully"
}
```

## Мониторинг

### Web Vitals Thresholds
- **CLS**: ≤ 0.1
- **FID**: ≤ 100ms
- **FCP**: ≤ 1800ms
- **LCP**: ≤ 2500ms
- **TTFB**: ≤ 800ms
- **INP**: ≤ 200ms

### Logging
Все события логируются через централизованную систему логирования (`lib/logger.ts`).

### Sentry Integration
- Автоматическая отправка ошибок в Sentry
- Фильтрация чувствительных данных
- Контекстная информация об ошибках
- Пользовательский фидбек

## Безопасность

- Фильтрация паролей, токенов и других чувствительных данных
- Валидация входных данных через Zod
- Безопасная обработка ошибок
- Логирование без утечки конфиденциальной информации