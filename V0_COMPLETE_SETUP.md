# 🚀 Полная инструкция по настройке KattyFit на v0

## ✅ Что уже готово

Проект полностью готов к деплою на v0! Все критичные функции реализованы:

1. **CloudPayments** - полная интеграция для приема платежей
2. **HLS плеер** - защищенный просмотр видео с проверкой доступа
3. **Календарь бронирования** - запись на тренировки с выбором времени
4. **Промокоды** - система скидок с админкой
5. **Умный чат-бот** - с продающими сценариями и RAG
6. **Аналитика** - дашборд с метриками и графиками
7. **API защита** - rate limiting и обработка ошибок
8. **Оптимизация** - lazy loading и кеширование

## 📋 Необходимые переменные окружения

Добавьте эти переменные в настройках v0:

### Обязательные (без них не запустится)
\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Админ доступ
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
\`\`\`

### Платежи (для монетизации)
\`\`\`env
# CloudPayments
NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID=your_public_id
CLOUDPAYMENTS_SECRET=your_api_secret
\`\`\`

### AI и интеграции (для полного функционала)
\`\`\`env
# Чат-бот (выберите один)
YANDEXGPT_API_KEY=your_yandex_key    # Для русского языка
OPENAI_API_KEY=your_openai_key       # Альтернатива

# Контент
CONTENTSTUDIO_API_KEY=your_key       # Автопостинг
ELEVENLABS_API_KEY=your_key          # Дубляж видео

# Мессенджеры
TELEGRAM_BOT_TOKEN=your_bot_token
VK_API_TOKEN=your_vk_token
META_WEBHOOK_TOKEN=your_meta_token
\`\`\`

### Дополнительные (опционально)
\`\`\`env
# Push уведомления
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public
VAPID_PRIVATE_KEY=your_vapid_private

# HLS защита
HLS_ALLOWED_HOSTS=cdn.example.com
HLS_JWT_SECRET=your_jwt_secret

# Хранилище
SUPABASE_STORAGE_BUCKET=content
\`\`\`

## 🗄️ Настройка базы данных

1. Зайдите в Supabase SQL Editor
2. Выполните скрипт `/scripts/final-schema.sql`
3. Добавьте тестовые данные:

\`\`\`sql
-- Добавить тестовые промокоды
INSERT INTO promocodes (code, discount_percent, max_uses) VALUES
  ('WELCOME10', 10, NULL),
  ('FIRST20', 20, 100),
  ('YOGA2024', 15, 50);

-- Добавить типы тренировок  
INSERT INTO training_types (code, title, price, type) VALUES
  ('online-personal', 'Персональная онлайн', 2500, 'online'),
  ('online-group', 'Групповая онлайн', 1000, 'online');

-- Добавить пакеты
INSERT INTO training_packages (code, title, sessions, price, discount_percent) VALUES
  ('package-5', 'Пакет 5 занятий', 5, 11250, 10),
  ('package-10', 'Пакет 10 занятий', 10, 21250, 15);
\`\`\`

## 🚀 После деплоя

### 1. Проверьте статус
- Откройте `/admin` (логин/пароль из переменных)
- Посмотрите карточку "Статус конфигурации"
- Убедитесь что все зеленое

### 2. Настройте интеграции
- Перейдите в `/admin/settings/integrations`
- Добавьте API ключи для нужных сервисов
- Активируйте интеграции

### 3. Добавьте контент
- `/admin/content` - загрузите видео
- `/admin/courses` - создайте курсы
- `/admin/knowledge` - добавьте FAQ для бота

### 4. Настройте Webhook для чатов
\`\`\`
Telegram: https://your-v0-app.vercel.app/api/chat/webhook/telegram
VK: https://your-v0-app.vercel.app/api/chat/webhook/vk
\`\`\`

## 🎯 Quick Start

1. **Тестовая оплата**
   - Откройте любой курс
   - Нажмите "Купить"
   - Используйте тестовую карту CloudPayments

2. **Тестовое бронирование**
   - Перейдите в `/booking`
   - Выберите дату и время
   - Оформите запись

3. **Тестовый промокод**
   - При оплате введите `WELCOME10`
   - Получите скидку 10%

## 📊 Мониторинг

- `/admin/analytics` - основные метрики
- `/admin/promocodes` - статистика промокодов
- `/admin/chat` - омниканальные диалоги

## ⚠️ Важные замечания

1. **Безопасность**
   - Смените дефолтный пароль админа
   - Используйте сложные API ключи
   - Регулярно проверяйте логи

2. **Производительность**
   - Включен lazy loading компонентов
   - Rate limiting на API (30 req/min)
   - Кеширование на 5 минут

3. **Лимиты v0**
   - Следите за использованием
   - Оптимизируйте тяжелые операции
   - Используйте Edge Runtime где возможно

## 🆘 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера
2. Посмотрите логи в v0
3. Убедитесь что все переменные установлены
4. Проверьте статус Supabase

---

**Проект готов к запуску!** Просто добавьте переменные окружения и начинайте продавать! 🚀
