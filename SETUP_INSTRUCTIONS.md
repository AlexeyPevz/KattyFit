# Инструкции по настройке KattyFit Content Management System

## 1. Настройка Supabase

### Создание таблиц
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Выполните SQL из файла `/docs/supabase-schema.sql`

### Настройка переменных окружения
В настройках проекта v0 добавьте:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 2. Настройка API ключей

### Через интерфейс админки
1. Перейдите в `/admin/settings/integrations`
2. Введите API ключи для каждого сервиса:
   - **VK**: API токен сообщества
   - **Telegram**: Bot token и Chat ID
   - **ElevenLabs**: API ключ для дубляжа
   - **OpenAI**: API ключ для генерации текстов (опционально)

### Через Supabase (альтернативный способ)
Выполните SQL для добавления ключей:
```sql
-- VK API
INSERT INTO api_keys (service, key_name, key_value, is_active)
VALUES ('vk', 'api_key', 'YOUR_VK_TOKEN', true);

-- Telegram Bot
INSERT INTO api_keys (service, key_name, key_value, is_active)
VALUES 
  ('telegram', 'api_key', 'YOUR_BOT_TOKEN', true),
  ('telegram_chat_id', 'api_key', 'YOUR_CHAT_ID', true);

-- ElevenLabs
INSERT INTO api_keys (service, key_name, key_value, is_active)
VALUES ('elevenlabs', 'api_key', 'YOUR_ELEVENLABS_KEY', true);
```

## 3. Настройка OAuth (требует совместной сессии)

### YouTube
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте новый проект или выберите существующий
3. Включите YouTube Data API v3
4. Создайте OAuth 2.0 credentials
5. Добавьте redirect URI: `https://yourdomain.com/api/auth/callback/youtube`
6. Сохраните Client ID и Client Secret в админке

### TikTok Business
1. Создайте [TikTok for Developers](https://developers.tiktok.com/) аккаунт
2. Создайте приложение
3. Получите Client ID и Client Secret
4. Настройте redirect URI: `https://yourdomain.com/api/auth/callback/tiktok`

## 4. Проверка работоспособности

### Тест загрузки контента
1. Перейдите в `/admin/content`
2. Загрузите тестовое видео или добавьте ссылку RuTube
3. Проверьте, что контент появился в списке

### Тест генерации обложек
1. В списке контента нажмите на меню (три точки)
2. Выберите "Генерировать обложку"
3. Настройте параметры и сохраните

### Тест публикации
1. Перейдите на вкладку "Публикация"
2. Выберите контент и платформы
3. Нажмите "Опубликовать"

### Тест дубляжа (требует ElevenLabs ключ)
1. В списке контента выберите "Управление локализацией"
2. Выберите языки для дубляжа
3. Запустите процесс и дождитесь завершения

## 5. Дополнительные настройки

### Хранилище файлов (опционально)
Для production рекомендуется настроить Supabase Storage или Cloudinary:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Планировщик задач (опционально)
Для автоматической публикации настройте cron jobs или используйте Vercel Cron Functions.

## 6. Устранение проблем

### Ошибка "Supabase не настроен"
- Проверьте переменные окружения
- Убедитесь, что таблицы созданы
- Проверьте RLS политики

### Ошибка публикации
- Проверьте API ключи в `/admin/settings/integrations`
- Убедитесь, что сервис активен
- Проверьте логи в Vercel Functions

### Ошибка дубляжа
- Проверьте ElevenLabs API ключ
- Убедитесь, что видео доступно по публичному URL
- Проверьте лимиты ElevenLabs

## 7. Контакты для поддержки

При возникновении вопросов обращайтесь к разработчику для помощи с настройкой.