# ✅ Чек-лист развертывания в v0

## 🚀 Шаг 1: Подготовка v0

- [ ] Создать новый проект в v0 или открыть существующий
- [ ] Убедиться что выбран Next.js 15 (App Router)
- [ ] Проверить что Tailwind CSS включен
- [ ] Включить TypeScript

## 📦 Шаг 2: Импорт кода

### Вариант A: GitHub синхронизация (рекомендуется)
- [ ] Подключить GitHub репозиторий к v0
- [ ] Сделать push текущего кода
- [ ] v0 автоматически подхватит изменения

### Вариант B: Ручной импорт
- [ ] Скопировать содержимое `/app` директории
- [ ] Скопировать `/components` 
- [ ] Скопировать `/lib`
- [ ] Обновить `package.json` (добавить `@supabase/supabase-js`)

## 🔧 Шаг 3: Настройка окружения в v0

1. **Environment Variables** (Settings → Environment)
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   \`\`\`

2. **Убедиться что установлены компоненты Shadcn**
   - Если нет, v0 предложит установить автоматически
   - Или можно добавить через команды в терминале v0

## 🗄️ Шаг 4: База данных Supabase

- [ ] Создать проект в Supabase (если еще нет)
- [ ] Скопировать SQL из `/docs/supabase-schema.sql`
- [ ] Выполнить в Supabase SQL Editor
- [ ] Проверить что таблицы созданы:
  - `content`
  - `publications`
  - `integrations`
  - `thumbnails`
  - `api_keys`
  - `chat_messages`
  - `knowledge_base`

## 🔌 Шаг 5: Настройка интеграций

### ContentStudio (обязательно для международных платформ)
- [ ] Зарегистрироваться на contentstudio.io
- [ ] Подключить Instagram Business аккаунт
- [ ] Подключить TikTok Business аккаунт
- [ ] Получить API ключ
- [ ] Добавить в `/admin/settings/integrations`

### Российские платформы
- [ ] VK: получить токен для API и Messages
- [ ] Telegram: создать бота через @BotFather
- [ ] RuTube: получить доступ к API (опционально)

### AI сервисы
- [ ] ElevenLabs: получить API ключ для дубляжа
- [ ] YandexGPT или OpenAI: для чат-бота

## 🌐 Шаг 6: Vercel деплой

- [ ] Подключить GitHub к Vercel (если еще не подключен)
- [ ] Добавить environment variables в Vercel:
  - Все из v0
  - Дополнительные серверные ключи (не NEXT_PUBLIC_)
- [ ] Сделать деплой
- [ ] Получить production URL

## 🔔 Шаг 7: Настройка Webhook для чатов

Используя production URL из Vercel:

### Telegram
- [ ] Установить webhook: 
  \`\`\`
  https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://yourdomain.vercel.app/api/chat/webhook/telegram
  \`\`\`

### VK
- [ ] В настройках сообщества → Callback API
- [ ] Добавить адрес: `https://yourdomain.vercel.app/api/chat/webhook/vk`
- [ ] Выбрать события: входящие сообщения

## ✨ Шаг 8: Проверка функциональности

- [ ] Загрузить тестовое видео
- [ ] Сгенерировать обложку
- [ ] Опубликовать на тестовый канал
- [ ] Проверить работу чат-бота
- [ ] Добавить элементы в базу знаний

## 🎨 Шаг 9: Кастомизация в v0

- [ ] Настроить цвета бренда через v0 UI
- [ ] Проверить мобильную версию
- [ ] Настроить шрифты если нужно
- [ ] Добавить логотип

## 📱 Шаг 10: PWA настройка

- [ ] Добавить иконки в `/public`
- [ ] Настроить `manifest.json`
- [ ] Проверить работу offline

## 🎉 Готово!

Система полностью развернута и готова к использованию!

### Быстрые ссылки:
- Админка: `/admin`
- Контент: `/admin/content`
- Чаты: `/admin/chat`
- База знаний: `/admin/knowledge`
- Интеграции: `/admin/settings/integrations`

### Поддержка:
- Документация: `/docs`
- API референс: см. README.md
- Обновления: GitHub releases
