# 🚀 Руководство по деплою в v0

## 📋 Предварительные требования

### ✅ Проверка готовности
- [ ] Проект собирается без ошибок (`npm run build`)
- [ ] Все TypeScript ошибки исправлены
- [ ] Переменные окружения настроены
- [ ] База данных Supabase создана
- [ ] API ключи получены

## 🔧 Настройка в v0

### 1. Создание проекта
1. Откройте [v0.dev](https://v0.dev)
2. Нажмите "New Project"
3. Выберите "Import from GitHub" или "Start from scratch"
4. Убедитесь, что выбран Next.js 14+ с App Router

### 2. Импорт кода
#### Вариант A: GitHub синхронизация (рекомендуется)
1. Подключите GitHub репозиторий
2. Выберите ветку `main`
3. v0 автоматически подхватит изменения

#### Вариант B: Ручной импорт
1. Скопируйте содержимое `/app` директории
2. Скопируйте `/components`
3. Скопируйте `/lib`
4. Обновите `package.json` если нужно

### 3. Установка зависимостей
В терминале v0:
\`\`\`bash
npm install
\`\`\`

### 4. Настройка переменных окружения
В Settings → Environment Variables добавьте:

#### Обязательные:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
\`\`\`

#### Опциональные:
\`\`\`env
OPENAI_API_KEY=sk-...
YANDEXGPT_API_KEY=your-yandex-key
ELEVENLABS_API_KEY=your-elevenlabs-key
VK_API_TOKEN=your-vk-token
TELEGRAM_BOT_TOKEN=your-telegram-token
TIKTOK_API_KEY=your-tiktok-key
CONTENTSTUDIO_API_KEY=your-contentstudio-key
NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID=your-public-id
CLOUDPAYMENTS_SECRET=your-secret
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key
WA_PHONE_NUMBER_ID=your-phone-id
WA_TOKEN=your-whatsapp-token
\`\`\`

## 🗄️ Настройка базы данных

### Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в SQL Editor
3. Выполните SQL из `docs/supabase-schema.sql`
4. Скопируйте URL и Anon Key в переменные окружения

### Проверка подключения
Откройте `/admin` → "Статус конфигурации" для проверки.

## 🚀 Деплой

### 1. Vercel (рекомендуется)
1. В v0 нажмите "Deploy to Vercel"
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения в Vercel
4. Сделайте деплой

### 2. Другие платформы
#### Netlify
1. Подключите GitHub репозиторий
2. Настройте build command: `npm run build`
3. Настройте publish directory: `.next`
4. Добавьте переменные окружения

#### Railway
1. Подключите GitHub репозиторий
2. Выберите "Deploy from GitHub"
3. Добавьте переменные окружения
4. Сделайте деплой

## 🔍 Проверка деплоя

### 1. Preview режим
- [ ] Главная страница загружается
- [ ] Админка доступна по `/admin`
- [ ] Все компоненты отображаются
- [ ] Нет ошибок в консоли

### 2. Production режим
- [ ] База данных подключена
- [ ] API работает корректно
- [ ] Аутентификация работает
- [ ] Интеграции активны

### 3. Тестирование функций
- [ ] Загрузка контента
- [ ] Публикация в соцсети
- [ ] Чат-бот отвечает
- [ ] Платежи работают

## 🛠️ Отладка проблем

### Ошибки сборки
\`\`\`bash
# Проверка TypeScript
npm run build

# Проверка линтера
npm run lint
\`\`\`

### Ошибки runtime
1. Проверьте консоль браузера
2. Проверьте серверные логи
3. Убедитесь, что переменные окружения настроены
4. Проверьте подключение к базе данных

### Проблемы с API
1. Проверьте CORS настройки
2. Убедитесь, что API ключи действительны
3. Проверьте лимиты API
4. Проверьте логи сервера

## 📱 PWA настройка

### Манифест
Файл `public/manifest.json` уже настроен.

### Иконки
Добавьте иконки в `/public/`:
- `favicon.ico`
- `apple-touch-icon.png`
- `favicon-32x32.png`
- `favicon-16x16.png`

### Service Worker
Автоматически генерируется Next.js.

## 🔐 Безопасность

### Переменные окружения
- Никогда не коммитьте `.env` файлы
- Используйте разные ключи для dev/prod
- Регулярно ротируйте API ключи

### CORS
Настройте CORS для API в production.

### Rate Limiting
Добавьте rate limiting для API endpoints.

## 📊 Мониторинг

### Логи
- Vercel: Dashboard → Functions → Logs
- Railway: Dashboard → Deployments → Logs
- Netlify: Dashboard → Functions → Logs

### Метрики
- Vercel: Analytics
- Google Analytics
- Sentry для ошибок

## 🎉 Готово!

После успешного деплоя ваш проект будет доступен по URL и готов к использованию!

### Полезные ссылки:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [v0.dev](https://v0.dev)
