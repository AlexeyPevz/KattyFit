# 🔧 Настройка переменных окружения для v0

> **Критически важно**: Все переменные должны быть настроены в v0 dashboard перед первым запуском!

## 📋 Обязательные переменные

### 1. Supabase (База данных)
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`
**Источник**: Supabase Dashboard → Settings → API  
**Файл**: `lib/supabase.ts:1-20`

### 2. AI Сервисы
\`\`\`env
# YandexGPT (основной AI)
YANDEX_GPT_API_KEY=AQVN1234567890abcdef...

# OpenAI (резервный AI)
OPENAI_API_KEY=sk-1234567890abcdef...

# ElevenLabs (дубляж видео)
ELEVENLABS_API_KEY=1234567890abcdef...
\`\`\`
**Источник**: 
- YandexGPT: [Yandex Cloud Console](https://console.cloud.yandex.ru/)
- OpenAI: [OpenAI Platform](https://platform.openai.com/)
- ElevenLabs: [ElevenLabs Dashboard](https://elevenlabs.io/)

### 3. Платежи (CloudPayments)
\`\`\`env
CLOUDPAYMENTS_PUBLIC_ID=pk_1234567890abcdef...
CLOUDPAYMENTS_SECRET=1234567890abcdef...
\`\`\`
**Источник**: [CloudPayments Dashboard](https://merchant.cloudpayments.ru/)  
**Файл**: `app/api/webhooks/cloudpayments/route.ts:1-50`

### 4. VK Интеграция
\`\`\`env
VK_ACCESS_TOKEN=vk1.a.1234567890abcdef...
VK_GROUP_ID=123456789
\`\`\`
**Источник**: [VK API](https://vk.com/apps?act=manage)  
**Файл**: `lib/video-upload-service.ts:50-80`

### 5. YouTube Интеграция
\`\`\`env
YOUTUBE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-1234567890abcdef
YOUTUBE_REFRESH_TOKEN=1//1234567890abcdef
\`\`\`
**Источник**: [Google Cloud Console](https://console.cloud.google.com/)  
**Файл**: `lib/video-upload-service.ts:100-150`

## 🔧 Опциональные переменные

### 6. ContentStudio (Автопостинг)
\`\`\`env
CONTENTSTUDIO_API_KEY=cs_1234567890abcdef...
\`\`\`
**Источник**: [ContentStudio Dashboard](https://contentstudio.io/)  
**Файл**: `app/api/content/contentstudio/route.ts:1-30`

### 7. Webhook токены
\`\`\`env
META_WEBHOOK_TOKEN=your_webhook_verification_token
\`\`\`
**Источник**: Meta Business Manager  
**Файл**: `app/api/chat/webhook/[platform]/route.ts:1-50`

### 8. Sentry (Мониторинг ошибок)
\`\`\`env
NEXT_PUBLIC_SENTRY_DSN=https://1234567890@o123456.ingest.sentry.io/123456
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=1234567890abcdef...
\`\`\`
**Источник**: [Sentry Dashboard](https://sentry.io/)  
**Файл**: `lib/error-tracking/sentry.tsx:8-12`

## 🚀 Пошаговая настройка в v0

### Шаг 1: Откройте v0 Dashboard
1. Перейдите в ваш проект в v0
2. Откройте Settings → Environment Variables

### Шаг 2: Добавьте переменные
Для каждой переменной:
1. Нажмите "Add Variable"
2. Введите имя переменной (точно как указано выше)
3. Введите значение
4. Выберите "Production" environment
5. Нажмите "Save"

### Шаг 3: Проверьте настройки
1. Убедитесь, что все переменные помечены как "Production"
2. Проверьте, что нет опечаток в именах переменных
3. Убедитесь, что значения скопированы полностью

### Шаг 4: Перезапустите приложение
1. Перейдите в Deployments
2. Нажмите "Redeploy" для последней версии
3. Дождитесь завершения деплоя

## ✅ Проверка настройки

### Автоматическая проверка
Откройте админку: `https://yourdomain.com/admin/settings/integrations`

Статус должен показывать:
- ✅ **Supabase**: Настроено
- ✅ **AI Services**: Настроено  
- ✅ **Payments**: Настроено
- ✅ **VK Integration**: Настроено
- ✅ **YouTube Integration**: Настроено

### Ручная проверка через API
\`\`\`bash
# Проверка статуса конфигурации
curl https://yourdomain.com/api/settings/config-status

# Ожидаемый ответ:
{
  "supabase": true,
  "ai": true,
  "payments": true,
  "vk": true,
  "youtube": true
}
\`\`\`

## 🐛 Troubleshooting

### Проблема: "Configuration not found"
**Решение**: Проверьте, что переменные добавлены в v0 dashboard

### Проблема: "Invalid API key"
**Решение**: 
1. Проверьте правильность API ключа
2. Убедитесь, что ключ активен
3. Проверьте права доступа

### Проблема: "Database connection failed"
**Решение**:
1. Проверьте `NEXT_PUBLIC_SUPABASE_URL`
2. Проверьте `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Убедитесь, что Supabase проект активен

### Проблема: "Payment processing failed"
**Решение**:
1. Проверьте `CLOUDPAYMENTS_PUBLIC_ID`
2. Проверьте `CLOUDPAYMENTS_SECRET`
3. Убедитесь, что аккаунт CloudPayments активен

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в v0 dashboard
2. Откройте админку и посмотрите статус конфигурации
3. Создайте issue в GitHub с описанием проблемы

---

**Важно**: Без правильной настройки переменных окружения приложение не будет работать корректно!
