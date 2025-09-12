# Тесты проекта

Этот каталог содержит все тесты для проекта, разделенные по типам и функциональности.

## Структура

\`\`\`
__tests__/
├── integration/           # Интеграционные тесты
│   ├── auth-api.test.ts   # Тесты API аутентификации
│   ├── chat-api.test.ts   # Тесты AI чата
│   ├── video-upload-api.test.ts # Тесты загрузки видео
│   ├── payments-api.test.ts # Тесты платежей
│   └── index.test.ts      # Полные интеграционные тесты
├── auth-store.test.ts     # Тесты состояния аутентификации
├── env.test.ts           # Тесты переменных окружения
├── error-handler.test.ts  # Тесты обработки ошибок
├── rag-engine.test.ts    # Тесты RAG движка
└── README.md             # Этот файл
\`\`\`

## Запуск тестов

### Все тесты
\`\`\`bash
npm test
\`\`\`

### Только unit тесты
\`\`\`bash
npm run test:unit
\`\`\`

### Только интеграционные тесты
\`\`\`bash
npm run test:integration
\`\`\`

### Тесты в режиме наблюдения
\`\`\`bash
npm run test:watch
\`\`\`

### Тесты с покрытием кода
\`\`\`bash
npm run test:coverage
\`\`\`

## Типы тестов

### Unit тесты
- **auth-store.test.ts** - Тестирование состояния аутентификации
- **env.test.ts** - Тестирование валидации переменных окружения
- **error-handler.test.ts** - Тестирование обработки ошибок
- **rag-engine.test.ts** - Тестирование RAG движка

### Интеграционные тесты
- **auth-api.test.ts** - Полный flow аутентификации через API
- **chat-api.test.ts** - Полный flow AI чата с YandexGPT
- **video-upload-api.test.ts** - Полный flow загрузки видео
- **payments-api.test.ts** - Полный flow платежей через CloudPayments
- **index.test.ts** - Комплексные тесты всего приложения

## Покрытие кода

Целевое покрытие кода:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Моки и зависимости

Все внешние зависимости замокированы:
- `@/lib/supabase-admin` - База данных
- `@/lib/logger` - Логирование
- `@/lib/services/ai-service` - AI сервис
- `@/lib/video-upload-service` - Загрузка видео
- `crypto` - Криптография
- `next/router` - Next.js роутер
- `next/navigation` - Next.js навигация

## Добавление новых тестов

1. Создайте файл с суффиксом `.test.ts` или `.test.tsx`
2. Используйте существующие моки или создайте новые
3. Следуйте паттерну AAA (Arrange, Act, Assert)
4. Добавьте негативные и граничные тесты
5. Обновите этот README при необходимости

## Примеры тестов

### Unit тест
\`\`\`typescript
describe('MyComponent', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' }
    
    // Act
    const result = render(<MyComponent {...props} />)
    
    // Assert
    expect(result.getByText('Test')).toBeInTheDocument()
  })
})
\`\`\`

### Интеграционный тест
\`\`\`typescript
describe('API Integration', () => {
  it('should handle complete flow', async () => {
    // Arrange
    const request = new NextRequest('http://localhost/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' })
    })
    
    // Act
    const response = await handler(request)
    const data = await response.json()
    
    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
\`\`\`
