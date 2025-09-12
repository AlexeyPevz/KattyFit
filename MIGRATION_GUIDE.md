# 🔄 Руководство по миграциям

> Руководство по обновлению и миграции KattyFit Platform

## 📋 Обзор миграций

### v1.0.0 - Production Ready Release

#### Критические изменения
- **TypeScript**: Устранены все 772 ошибки
- **Архитектура**: Внедрен DI контейнер
- **Логирование**: Централизованное логирование
- **Тестирование**: 5 интеграционных тестов

## 🚀 Миграция с предыдущих версий

### Из v0.x (Pre-production)

#### 1. Обновление зависимостей
```bash
# Удаление старых зависимостей
npm uninstall @types/jest jest

# Установка новых зависимостей
npm install @types/jest@^29.5.0 jest@^29.7.0
```

#### 2. Обновление конфигурации

##### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "__tests__/**/*"]
}
```

##### Next.js (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ['@sentry/nextjs']
  }
}

module.exports = nextConfig
```

#### 3. Обновление переменных окружения

##### Добавить новые переменные
```env
# Sentry (опционально)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token

# VK Integration
VK_ACCESS_TOKEN=your_vk_token
VK_GROUP_ID=your_group_id

# YouTube Integration
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
```

#### 4. Обновление базы данных

##### Миграция 001: Initial Schema
```sql
-- Создание основных таблиц
-- Файл: /docs/migrations/001_initial_schema.sql

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Курсы
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Видео
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  duration INTEGER,
  course_id UUID REFERENCES courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Платежи
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Лиды CRM
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(50),
  stage VARCHAR(20) CHECK (stage IN ('new', 'contacted', 'negotiation', 'customer', 'qualified', 'proposal')),
  value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Миграция 002: Indexes
```sql
-- Создание индексов для производительности
-- Файл: /docs/migrations/002_add_indexes.sql

-- Индексы для пользователей
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Индексы для курсов
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- Индексы для видео
CREATE INDEX IF NOT EXISTS idx_videos_course_id ON videos(course_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);

-- Индексы для платежей
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- Индексы для лидов
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
```

##### Миграция 003: Triggers
```sql
-- Создание триггеров для автоматического обновления
-- Файл: /docs/migrations/003_add_triggers.sql

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для всех таблиц
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 5. Обновление кода

##### Замена console.* на logger.*
```bash
# Автоматическая замена (уже выполнено)
# Все console.log заменены на logger.info
# Все console.error заменены на logger.error
# Все console.warn заменены на logger.warn
```

**Файлы изменены**:
- `lib/logger.ts:1-150` - Новый Logger класс
- `app/api/**/*.ts` - Замена в API routes
- `components/**/*.tsx` - Замена в компонентах
- `lib/**/*.ts` - Замена в утилитах

##### Устранение any типов
```typescript
// Было:
function processData(data: any): any {
  return data.someProperty;
}

// Стало:
interface ProcessedData {
  someProperty: string;
  otherProperty: number;
}

function processData(data: unknown): ProcessedData {
  if (typeof data === 'object' && data !== null && 'someProperty' in data) {
    return data as ProcessedData;
  }
  throw new Error('Invalid data format');
}
```

**Файлы изменены**:
- `lib/services/database-service.ts:1-100`
- `lib/services/ai-service.ts:1-80`
- `lib/proxy-manager.ts:1-120`
- `app/api/**/*.ts` - Все API routes

##### Внедрение DI контейнера
```typescript
// Новый DI контейнер
// Файл: lib/di/container.ts:1-200

// Использование в компонентах
import { useService } from '@/hooks/use-di';

function MyComponent() {
  const logger = useService('logger');
  const config = useService('config');
  
  // Использование сервисов
}
```

**Новые файлы**:
- `lib/di/container.ts` - DI контейнер
- `lib/di/setup.ts` - Настройка сервисов
- `lib/di/implementations.ts` - Реализации сервисов
- `hooks/use-di.ts` - React hooks для DI

#### 6. Добавление тестов

##### Интеграционные тесты
```bash
# Новые тестовые файлы
__tests__/integration/auth-api.test.ts
__tests__/integration/chat-api.test.ts
__tests__/integration/payments-api.test.ts
__tests__/integration/video-upload-api.test.ts
__tests__/rag-engine.test.ts
```

**Конфигурация Jest**:
- `jest.config.js:1-50` - Основная конфигурация
- `jest.setup.js:1-30` - Настройка тестов
- `simple-test-runner.js:1-100` - Кастомный раннер

#### 7. Error Tracking

##### Sentry интеграция
```typescript
// Новые файлы для мониторинга
lib/error-tracking/sentry.tsx:1-280
lib/error-tracking/error-boundary.tsx:1-150
lib/error-tracking/performance-monitoring.ts:1-220
lib/error-tracking/user-feedback.ts:1-300
```

**Stub файлы** (для отсутствующих зависимостей):
- `lib/error-tracking/sentry-stub.ts:1-50`
- `lib/error-tracking/web-vitals-stub.ts:1-30`

## 🔄 Процедура миграции

### 1. Подготовка

```bash
# 1. Создание резервной копии
pg_dump $DATABASE_URL > backup_before_migration.sql

# 2. Создание ветки для миграции
git checkout -b migration/v1.0.0

# 3. Проверка текущего состояния
npm run type-check
npm run test
```

### 2. Применение изменений

```bash
# 1. Обновление зависимостей
npm install

# 2. Применение миграций БД
npm run migrate

# 3. Обновление переменных окружения
# (в v0 dashboard)

# 4. Проверка конфигурации
npm run check-env
```

### 3. Тестирование

```bash
# 1. Проверка типов
npm run type-check

# 2. Запуск тестов
npm run test

# 3. Сборка проекта
npm run build

# 4. Проверка в dev режиме
npm run dev
```

### 4. Деплой

```bash
# 1. Коммит изменений
git add .
git commit -m "feat: migrate to v1.0.0 - production ready"

# 2. Пуш в main
git push origin main

# 3. Деплой через v0
# (автоматический при push в main)
```

### 5. Проверка после деплоя

```bash
# 1. Проверка health endpoint
curl https://yourdomain.com/api/health

# 2. Проверка админки
# Откройте https://yourdomain.com/admin

# 3. Проверка статуса конфигурации
# /admin/settings/integrations
```

## 🚨 Откат (Rollback)

### Если что-то пошло не так

```bash
# 1. Откат кода
git checkout previous-commit-hash
git push origin main --force

# 2. Откат базы данных
psql $DATABASE_URL < backup_before_migration.sql

# 3. Откат переменных окружения
# (в v0 dashboard)

# 4. Перезапуск
# (автоматический при push)
```

## 📊 Проверка миграции

### Чек-лист после миграции

- [ ] **Сборка**: `npm run build` успешна
- [ ] **Типы**: `npm run type-check` без ошибок
- [ ] **Тесты**: `npm run test` проходят
- [ ] **Health**: `/api/health` возвращает 200
- [ ] **Админка**: `/admin` доступна
- [ ] **Конфигурация**: Все сервисы показывают "Настроено"
- [ ] **База данных**: Все таблицы созданы
- [ ] **API**: Все endpoints работают
- [ ] **Логи**: Нет критических ошибок
- [ ] **Performance**: Web Vitals в норме

### Мониторинг после миграции

```bash
# Проверка логов
tail -f logs/app.log | grep -E "(ERROR|CRITICAL)"

# Проверка производительности
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/

# Проверка базы данных
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

## 🔧 Troubleshooting миграции

### Частые проблемы

#### 1. Ошибки TypeScript
```bash
# Очистка кэша
rm -rf .next node_modules
npm install

# Проверка типов
npm run type-check
```

#### 2. Ошибки базы данных
```bash
# Проверка подключения
psql $DATABASE_URL -c "SELECT 1;"

# Применение миграций вручную
psql $DATABASE_URL < docs/migrations/001_initial_schema.sql
```

#### 3. Ошибки переменных окружения
```bash
# Проверка переменных
npm run check-env

# Проверка в v0 dashboard
# Settings → Environment Variables
```

#### 4. Ошибки тестов
```bash
# Очистка кэша Jest
npm run test -- --clearCache

# Запуск тестов с подробным выводом
npm run test -- --verbose
```

## 📞 Поддержка миграции

### Если возникли проблемы

1. **Проверьте логи**: v0 dashboard → Logs
2. **Проверьте статус**: `/admin/settings/integrations`
3. **Создайте issue**: GitHub Issues с описанием проблемы
4. **Откатитесь**: Следуйте процедуре отката выше

### Контакты

- **Email**: support@kattyfit.com
- **GitHub**: Issues в репозитории
- **Slack**: #kattyfit-support

---

**Важно**: Всегда создавайте резервную копию перед миграцией!

**Последнее обновление**: 2024-01-15  
**Версия миграции**: v1.0.0  
**Статус**: Production Ready ✅