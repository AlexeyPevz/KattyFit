# 🚀 Руководство по настройке в v0

## ✅ Быстрый старт

### 1. Импорт проекта в v0
1. Откройте [v0.dev](https://v0.dev)
2. Создайте новый проект
3. Выберите "Import from GitHub" или скопируйте код вручную
4. Убедитесь, что выбран Next.js 14+ с App Router

### 2. Установка зависимостей
В терминале v0 выполните:
\`\`\`bash
npm install
\`\`\`

### 3. Настройка переменных окружения
В настройках проекта (Settings → Environment Variables) добавьте:

#### Обязательные переменные:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
\`\`\`

#### Опциональные переменные:
\`\`\`env
# AI сервисы
OPENAI_API_KEY=sk-...
YANDEXGPT_API_KEY=your-yandex-key
ELEVENLABS_API_KEY=your-elevenlabs-key

# Социальные сети
VK_API_TOKEN=your-vk-token
TELEGRAM_BOT_TOKEN=your-telegram-token
TIKTOK_API_KEY=your-tiktok-key
CONTENTSTUDIO_API_KEY=your-contentstudio-key

# Платежи
NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID=your-public-id
CLOUDPAYMENTS_SECRET=your-secret

# Push уведомления
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-key

# WhatsApp
WA_PHONE_NUMBER_ID=your-phone-id
WA_TOKEN=your-whatsapp-token
\`\`\`

## 🔧 Настройка базы данных

### Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. Скопируйте URL и Anon Key в переменные окружения
3. Выполните SQL из файла `docs/supabase-schema.sql`

### Схема базы данных
Основные таблицы:
- `content` - контент
- `publications` - публикации
- `integrations` - интеграции
- `thumbnails` - миниатюры
- `api_keys` - API ключи
- `chat_messages` - сообщения чата
- `knowledge_base` - база знаний

## 🎨 Настройка интерфейса

### Цветовая схема
Проект использует Tailwind CSS с кастомными цветами:
- Primary: Violet (фиолетовый)
- Secondary: Pink (розовый)
- Accent: Blue (синий)

### Компоненты
Все компоненты UI находятся в `/components/ui/` и используют shadcn/ui.

## 📱 PWA настройка

### Манифест
Файл `public/manifest.json` уже настроен для PWA.

### Иконки
Добавьте иконки в `/public/`:
- `favicon.ico` (32x32)
- `apple-touch-icon.png` (180x180)
- `favicon-32x32.png` (32x32)
- `favicon-16x16.png` (16x16)

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите GitHub репозиторий к Vercel
2. Добавьте все переменные окружения
3. Сделайте деплой

### Другие платформы
Проект совместим с:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🔍 Проверка работы

### Preview режим
В v0 preview режиме:
- ✅ Все компоненты загружаются
- ✅ Fallback значения работают
- ✅ UI отображается корректно
- ⚠️ API функции ограничены

### Production режим
После настройки переменных окружения:
- ✅ Все функции работают полноценно
- ✅ База данных подключена
- ✅ API интеграции активны
- ✅ Платежи работают

## 🛠️ Отладка

### Проверка переменных окружения
\`\`\`bash
npm run check-env
\`\`\`

### Логи
Проверьте консоль браузера и серверные логи на наличие ошибок.

### Статус интеграций
Откройте `/admin` → "Статус конфигурации" для проверки настроек.

## 📞 Поддержка

### Документация
- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Проблемы
Если возникают проблемы:
1. Проверьте переменные окружения
2. Убедитесь, что база данных настроена
3. Проверьте логи в консоли
4. Обратитесь к документации API

## 🎉 Готово!

После выполнения всех шагов ваш проект будет готов к использованию в v0 и production!
