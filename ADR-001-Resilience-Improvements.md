# ADR-001: Улучшения отказоустойчивости для v0 деплоя

## Статус
Принято

## Контекст
Проект деплоится через v0, где переменные окружения настраиваются через веб-интерфейс. Обнаружены критические проблемы отказоустойчивости, которые могут привести к silent failures и нестабильной работе в production.

## Проблемы

### 1. Silent failures при отсутствии переменных окружения
**Файл:** `lib/env.ts:12-14`
**Проблема:** Переменные возвращают пустые строки вместо ошибок, что приводит к неочевидным сбоям
**Риск:** Критический - приложение может работать с неполной конфигурацией

### 2. Небезопасная генерация токенов сессии
**Файл:** `app/api/admin/auth/route.ts:93`
**Проблема:** Использование Math.random() для генерации токенов
**Риск:** Высокий - предсказуемые токены сессии

### 3. Отсутствие timeout'ов в критических операциях
**Файл:** `lib/proxy-manager.ts:204-255`
**Проблема:** Нет защиты от зависших запросов
**Риск:** Высокий - ресурсы могут быть заблокированы

### 4. Отсутствие circuit breaker'а для AI сервисов
**Файл:** `lib/rag-engine.ts:231-254`
**Проблема:** Каскадные сбои AI сервисов
**Риск:** Средний - деградация функциональности

### 5. Недостаточная валидация входных данных
**Файл:** `app/api/chat/yandexgpt/route.ts:6-13`
**Проблема:** Отсутствие санитизации и лимитов
**Риск:** Средний - потенциальные атаки

## Решение

### 1. Адаптивная валидация переменных окружения для v0
```typescript
// lib/env.ts - адаптировано для v0
export const env = {
  get supabaseUrl() {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!value) {
      // В v0 переменные могут быть не установлены во время билда
      if (typeof window === 'undefined') {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL не настроена в v0 Environment Variables')
      }
      return ''
    }
    return value
  },
  // ... остальные переменные
}
```

### 2. Криптографически стойкие токены
```typescript
// app/api/admin/auth/route.ts
const crypto = await import('crypto')
const sessionToken = crypto.randomBytes(32).toString('hex')
```

### 3. Timeout'ы для всех внешних запросов
```typescript
// lib/proxy-manager.ts
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), timeout)
```

### 4. Circuit breaker для AI сервисов
```typescript
// lib/rag-engine.ts
class CircuitBreaker {
  private failures: Map<string, number> = new Map()
  private readonly maxFailures = 3
  private readonly resetTimeout = 60000
}
```

### 5. Валидация и санитизация входных данных
```typescript
// app/api/chat/yandexgpt/route.ts
if (!message || typeof message !== 'string' || message.length > 4000) {
  return NextResponse.json({ error: "Invalid input" }, { status: 400 })
}
```

## Последствия

### Положительные
- Предотвращение silent failures
- Улучшенная безопасность
- Более стабильная работа в production
- Лучшая диагностика проблем

### Отрицательные
- Увеличение сложности кода
- Потенциальные breaking changes для существующих интеграций
- Необходимость тестирования в v0 среде

## Мониторинг

### v0 Environment Variables Checklist
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY  
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] ADMIN_USERNAME
- [ ] ADMIN_PASSWORD
- [ ] NEXT_PUBLIC_ADMIN_USERNAME

### Логи для отслеживания
- Ошибки валидации переменных окружения
- Срабатывания circuit breaker'а
- Timeout'ы в прокси-запросах
- Неудачные попытки аутентификации

## Альтернативы

1. **Graceful degradation** - приложение работает с ограниченным функционалом
2. **External configuration service** - вынос конфигурации в отдельный сервис
3. **Health checks** - периодическая проверка доступности сервисов

## Реализация

### Этап 1: Критические исправления (немедленно)
- [x] Валидация переменных окружения
- [x] Безопасные токены сессии
- [x] Timeout'ы для внешних запросов

### Этап 2: Улучшения стабильности (1-2 недели)
- [x] Circuit breaker для AI сервисов
- [x] Валидация входных данных
- [ ] Мониторинг и алерты

### Этап 3: Оптимизация (1 месяц)
- [ ] Кэширование ответов AI
- [ ] Retry механизмы
- [ ] Метрики производительности

## Примечания для v0

1. **Environment Variables** должны быть настроены в v0 dashboard
2. **Build-time vs Runtime** - переменные доступны только в runtime
3. **Error handling** - ошибки должны быть информативными для v0 пользователей
4. **Fallbacks** - приложение должно работать даже при частичной конфигурации

## Связанные файлы

- `lib/env.ts` - централизованная конфигурация
- `app/api/admin/auth/route.ts` - аутентификация
- `lib/proxy-manager.ts` - управление прокси
- `lib/rag-engine.ts` - AI сервисы
- `app/api/chat/yandexgpt/route.ts` - чат API