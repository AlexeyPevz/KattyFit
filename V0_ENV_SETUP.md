# Настройка переменных окружения в v0

## 🔧 Пошаговая инструкция

### 1. Откройте настройки проекта в v0
1. Перейдите на сайт v0.dev
2. Откройте ваш проект
3. Нажмите на иконку настроек (⚙️) в правом верхнем углу
4. Выберите "Environment Variables"

### 2. Добавьте обязательные переменные

**Скопируйте и вставьте следующие переменные:**

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_123
NEXT_PUBLIC_ADMIN_USERNAME=admin
\`\`\`

### 3. Настройте Supabase (обязательно)

1. **Создайте проект в Supabase:**
   - Перейдите на https://supabase.com
   - Создайте новый проект
   - Скопируйте URL и API ключи

2. **Найдите ваши ключи:**
   - Project URL: `Settings` → `API` → `Project URL`
   - Anon key: `Settings` → `API` → `anon/public key`
   - Service role key: `Settings` → `API` → `service_role key`

3. **Выполните SQL схему:**
   \`\`\`sql
   -- Скопируйте содержимое файла docs/complete-database-schema.sql
   -- Выполните в Supabase SQL Editor
   \`\`\`

### 4. Добавьте опциональные переменные (для полного функционала)

**YandexGPT (для чата с AI):**
\`\`\`env
YANDEXGPT_API_KEY=your_yandex_gpt_api_key
\`\`\`

**CloudPayments (для платежей):**
\`\`\`env
NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID=pk_your_public_id
CLOUDPAYMENTS_SECRET=your_secret_key
\`\`\`

**Telegram интеграция:**
\`\`\`env
TELEGRAM_BOT_TOKEN=your_bot_token
\`\`\`

**VK интеграция:**
\`\`\`env
VK_API_TOKEN=your_vk_token
\`\`\`

**OpenAI (альтернатива YandexGPT):**
\`\`\`env
OPENAI_API_KEY=sk-your_openai_key
\`\`\`

**ElevenLabs (озвучка):**
\`\`\`env
ELEVENLABS_API_KEY=your_elevenlabs_key
\`\`\`

**Push уведомления:**
\`\`\`env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
\`\`\`

### 5. Проверьте настройки

После добавления переменных:

1. **Сохраните изменения** в v0
2. **Перезапустите превью** проекта
3. **Проверьте статус** переменных:
   - Перейдите на `/admin/settings/integrations`
   - Все настроенные сервисы должны показывать "Подключено"

### 6. Типичные ошибки и решения

**❌ "Supabase connection failed"**
- Проверьте правильность URL (должен включать https://)
- Убедитесь что ключи скопированы полностью
- Проверьте что проект Supabase активен

**❌ "Admin auth failed"**
- Убедитесь что ADMIN_USERNAME и ADMIN_PASSWORD установлены
- Добавьте NEXT_PUBLIC_ADMIN_USERNAME для клиентской части
- Проверьте что пароль содержит минимум 8 символов

**❌ "Chat not working"**
- Добавьте YANDEXGPT_API_KEY или OPENAI_API_KEY
- Проверьте что API ключ активен
- Убедитесь что в ключе нет лишних пробелов

### 7. Минимальная конфигурация для тестирования

Если хотите быстро протестировать проект, используйте только эти переменные:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo_key
SUPABASE_SERVICE_ROLE_KEY=demo_service_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_ADMIN_USERNAME=admin
\`\`\`

⚠️ **Внимание:** Используйте реальные Supabase ключи для продакшена!

### 8. Проверка работоспособности

После настройки переменных:

1. **Админка:** `/admin` - должна загружаться
2. **Интеграции:** `/admin/settings/integrations` - показать статус
3. **Демо данные:** Должны отображаться с индикаторами "Демо"
4. **API:** Проверьте Network tab в браузере на ошибки

### 9. Готовые наборы переменных

**Для разработки:**
\`\`\`env
# Минимум для работы
ADMIN_USERNAME=admin
ADMIN_PASSWORD=dev123
NEXT_PUBLIC_ADMIN_USERNAME=admin
\`\`\`

**Для тестирования:**
\`\`\`env
# Добавьте Supabase + админ
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ADMIN_USERNAME=test
ADMIN_PASSWORD=test123
NEXT_PUBLIC_ADMIN_USERNAME=test
\`\`\`

**Для продакшена:**
\`\`\`env
# Все переменные с реальными ключами
# (полный список см. выше)
\`\`\`

---

## ✅ Результат

После корректной настройки:
- ✅ Проект запускается без ошибок
- ✅ Админка доступна по адресу `/admin`  
- ✅ Все интеграции показывают корректный статус
- ✅ Демо данные отображаются правильно
- ✅ API работает стабильно

**🚀 Проект готов к использованию!**
