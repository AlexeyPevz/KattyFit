# 🚀 Настройка переменных окружения для v0

После деплоя вашего проекта на v0, необходимо настроить переменные окружения для корректной работы приложения.

## 📋 Обязательные переменные

### 1. Supabase (База данных)
Создайте проект на [supabase.com](https://supabase.com) и получите:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 2. Админ доступ
\`\`\`
ADMIN_USERNAME=KattyFit
ADMIN_PASSWORD=выберите_надежный_пароль
NEXT_PUBLIC_ADMIN_USERNAME=KattyFit
\`\`\`

**Важно:** Убедитесь, что `NEXT_PUBLIC_ADMIN_USERNAME` совпадает с `ADMIN_USERNAME` для корректной работы аутентификации.

### 3. Push уведомления
Сгенерируйте VAPID ключи на [vapidkeys.com](https://vapidkeys.com):
\`\`\`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BKd0r3uVL4Wj...
VAPID_PRIVATE_KEY=GKMr2XGkfFD...
\`\`\`

## 📱 Интеграции с мессенджерами

### Telegram Bot
1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Установите webhook: `https://ваш-домен.vercel.app/api/chat/webhook/telegram`
\`\`\`
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_SECRET_TOKEN=любая_случайная_строка_для_безопасности
\`\`\`

### VKontakte
1. Создайте сообщество и включите сообщения
2. Получите токен в настройках сообщества
\`\`\`
VK_API_TOKEN=vk1.a.xxxxx
VK_CONFIRMATION_CODE=код_из_настроек_callback_api
VK_GROUP_ID=123456789
\`\`\`

## 💳 Платежная система (YooKassa)
\`\`\`
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=live_xxxxx
\`\`\`

## 🤖 AI сервисы (выберите один)

### YandexGPT
\`\`\`
YANDEXGPT_API_KEY=AQVNxxxxx
\`\`\`

### ИЛИ OpenAI
\`\`\`
OPENAI_API_KEY=sk-xxxxx
\`\`\`

## 📊 Аналитика (опционально)
\`\`\`
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_YM_ID=12345678
\`\`\`

## ⚡ Быстрый старт

1. Скопируйте `.env.example` в настройки v0
2. Заполните обязательные переменные
3. Остальные можно добавить позже

## 🔗 Полезные ссылки

- [Документация Supabase](https://supabase.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots)
- [VK API](https://dev.vk.com)
- [YooKassa](https://yookassa.ru/developers)
- [YandexGPT](https://cloud.yandex.ru/services/yandexgpt)

## ❓ Нужна помощь?

Обратитесь к разработчику или создайте issue в репозитории проекта.
