# 🚀 KattyFit Omnichannel Automation Platform

> ⚠️ **Важно для v0**: После деплоя обязательно настройте переменные окружения! 
> - 📋 См. инструкцию: [V0_ENV_SETUP.md](./V0_ENV_SETUP.md)
> - 🔍 Проверьте статус: `npm run check-env`
> - 📊 Или откройте админку и посмотрите карточку "Статус конфигурации"

Платформа автоматизации контента и омниканальных коммуникаций для фитнес-тренера KattyFit.

## ✨ Ключевые возможности

### 📱 Управление контентом
- **Загрузка видео**: Прямая загрузка файлов или импорт с RuTube
- **AI генерация обложек**: 4 шаблона с настройкой текста и стилей
- **Мультиязычный дубляж**: ElevenLabs Dubbing API (10 языков)
- **Автопостинг**: ContentStudio для международных платформ + прямые интеграции для RU

### 💬 Омниканальные чаты
- **Единый центр управления**: Telegram, VK, Instagram, WhatsApp
- **AI-ассистент**: RAG на базе YandexGPT/OpenAI
- **База знаний**: FAQ, примеры диалогов, информация о курсах
- **Автоматические ответы**: 24/7 поддержка клиентов

### 🌐 Интеграции
- **ContentStudio**: Instagram, TikTok, YouTube через единый API
- **Российские платформы**: VK, Telegram, RuTube - прямые API
- **ElevenLabs**: Дубляж видео до 2.5 часов
- **AI сервисы**: YandexGPT, OpenAI для чат-бота

## 🛠 Технический стек

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI**: Shadcn UI, Radix UI - совместимо с v0
- **База данных**: Supabase (PostgreSQL)
- **AI/ML**: ElevenLabs, YandexGPT, OpenAI
- **Deployment**: Vercel

## 🚀 Быстрый старт

### 1. Настройка окружения

Создайте `.env.local` файл:
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ContentStudio (для автопостинга)
CONTENTSTUDIO_API_KEY=your_contentstudio_key

# AI сервисы
ELEVENLABS_API_KEY=your_elevenlabs_key
YANDEX_GPT_API_KEY=your_yandex_key
OPENAI_API_KEY=your_openai_key

# Webhook для чатов
META_WEBHOOK_TOKEN=your_webhook_verification_token
\`\`\`

### 2. База данных

Выполните SQL из `/docs/supabase-schema.sql` в Supabase SQL Editor.

### 3. Установка и запуск

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

### 4. Настройка интеграций

1. Перейдите в `/admin/settings/integrations`
2. Добавьте API ключи для нужных сервисов
3. Для ContentStudio - зарегистрируйтесь и подключите Instagram/TikTok аккаунты

### 5. Webhook для чатов

Настройте webhook URL для каждой платформы:
- **Telegram**: `https://yourdomain.com/api/chat/webhook/telegram`
- **VK**: `https://yourdomain.com/api/chat/webhook/vk`
- **Instagram/WhatsApp**: через Meta Business

## 📂 Структура проекта

\`\`\`
/app
  /admin          # Админ-панель
    /content      # Управление контентом
    /chat         # Омниканальные чаты  
    /knowledge    # База знаний для AI
    /settings     # Настройки и интеграции
  /api
    /content      # API для контента
    /chat         # Webhook для чатов
/components
  /admin          # Компоненты админки
/lib
  supabase.ts     # Клиент БД
  rag-engine.ts   # AI движок для чатов
\`\`\`

## 🔧 Основные API маршруты

- `POST /api/content/upload` - Загрузка видео
- `POST /api/content/rutube` - Импорт с RuTube
- `POST /api/content/contentstudio` - ContentStudio интеграция
- `POST /api/content/publish` - Публикация контента
- `POST /api/content/translate` - Дубляж через ElevenLabs
- `POST /api/chat/webhook/[platform]` - Webhook для чатов

## 💡 Приоритеты развития

1. ✅ **ContentStudio интеграция** - автопостинг + AI обложки
2. ✅ **Омниканальные чаты** - единый движок для всех платформ
3. ✅ **RAG-движок** - умный бот с базой знаний
4. ⏳ **CloudPayments** - монетизация курсов
5. ⏳ **HLS-плеер** - защищенный просмотр контента

## 📝 Чек-лист для Кати

Что нужно предоставить:
- [ ] ContentStudio аккаунт и API ключ
- [ ] Instagram Business аккаунт (подключить к ContentStudio)
- [ ] TikTok Business аккаунт (подключить к ContentStudio)
- [ ] VK токен для API и Messages API
- [ ] Telegram Bot токен
- [ ] ElevenLabs API ключ
- [ ] База знаний: FAQ, примеры диалогов, информация о курсах
- [ ] Примеры успешных публикаций для обучения AI

## 🤝 Реферальная программа

- **ContentStudio**: 30% первый год + 15% далее
- **Blotato** (альтернатива): 25% lifetime комиссии

При масштабировании на других клиентов - хороший источник пассивного дохода!
