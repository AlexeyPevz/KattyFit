# ⚡ Быстрый старт

> Минимальная инструкция для запуска KattyFit Platform за 5 минут

## 🚀 За 5 минут

### 1. Клонирование и установка
\`\`\`bash
# Клонируйте репозиторий
git clone https://github.com/your-username/ai-content-studio.git
cd ai-content-studio

# Установите зависимости
npm install
\`\`\`

### 2. Настройка окружения
\`\`\`bash
# Скопируйте шаблон
cp .env.example .env.local

# Отредактируйте переменные
nano .env.local
\`\`\`

**Минимальные переменные**:
\`\`\`env
# Supabase (обязательно)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI (для чата)
YANDEX_GPT_API_KEY=your_yandex_key
\`\`\`

### 3. Запуск
\`\`\`bash
# Проверка
npm run type-check

# Сборка
npm run build

# Запуск
npm run dev
\`\`\`

### 4. Проверка
- Откройте http://localhost:3000
- Перейдите в админку: http://localhost:3000/admin
- Проверьте статус: http://localhost:3000/admin/settings/integrations

## 🔧 Полная настройка

### Автоматическая настройка
\`\`\`bash
# Запустите скрипт настройки
./scripts/setup-from-scratch.sh
\`\`\`

### Ручная настройка

#### 1. База данных (Supabase)
1. Создайте проект в [Supabase](https://supabase.com/)
2. Выполните SQL из `/docs/supabase-schema.sql`
3. Скопируйте URL и ключи в `.env.local`

#### 2. AI сервисы
1. **YandexGPT**: [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. **OpenAI**: [OpenAI Platform](https://platform.openai.com/)
3. **ElevenLabs**: [ElevenLabs Dashboard](https://elevenlabs.io/)

#### 3. Платежи (CloudPayments)
1. Зарегистрируйтесь в [CloudPayments](https://cloudpayments.ru/)
2. Получите Public ID и Secret
3. Добавьте в `.env.local`

#### 4. Интеграции
1. **VK**: [VK API](https://vk.com/apps?act=manage)
2. **YouTube**: [Google Cloud Console](https://console.cloud.google.com/)
3. **ContentStudio**: [ContentStudio Dashboard](https://contentstudio.io/)

## 📋 Чек-лист

### Перед запуском
- [ ] Node.js 18+ установлен
- [ ] Git установлен
- [ ] Репозиторий клонирован
- [ ] Зависимости установлены (`npm install`)

### Настройка окружения
- [ ] `.env.local` создан
- [ ] Supabase переменные настроены
- [ ] AI сервисы настроены
- [ ] Платежи настроены (опционально)

### База данных
- [ ] Supabase проект создан
- [ ] SQL схема выполнена
- [ ] Подключение работает

### Запуск
- [ ] TypeScript проверка пройдена (`npm run type-check`)
- [ ] Проект собирается (`npm run build`)
- [ ] Dev сервер запускается (`npm run dev`)
- [ ] Сайт доступен (http://localhost:3000)

### Проверка функциональности
- [ ] Главная страница загружается
- [ ] Админка доступна (/admin)
- [ ] Статус конфигурации показывает "Настроено"
- [ ] API endpoints отвечают

## 🐛 Troubleshooting

### Ошибка: "Module not found"
\`\`\`bash
# Очистка кэша
rm -rf .next node_modules
npm install
\`\`\`

### Ошибка: "TypeScript errors"
\`\`\`bash
# Проверка типов
npm run type-check

# Исправление (если нужно)
npm run build
\`\`\`

### Ошибка: "Database connection failed"
1. Проверьте Supabase URL и ключи
2. Убедитесь, что проект активен
3. Проверьте SQL схему

### Ошибка: "Build failed"
\`\`\`bash
# Подробный вывод
npm run build -- --verbose

# Проверка зависимостей
npm ls
\`\`\`

## 📞 Поддержка

### Документация
- **README.md**: Полная документация
- **V0_ENV_SETUP.md**: Настройка переменных окружения
- **OPERATIONS_GUIDE.md**: Операционное руководство
- **MIGRATION_GUIDE.md**: Руководство по миграциям

### Контакты
- **GitHub Issues**: Создайте issue с описанием проблемы
- **Email**: support@kattyfit.com
- **Slack**: #kattyfit-support

### Полезные команды
\`\`\`bash
# Проверка статуса
npm run check-env

# Запуск тестов
npm run test

# Линтинг
npm run lint

# Сборка для продакшена
npm run build

# Запуск продакшен сервера
npm run start
\`\`\`

---

**Время настройки**: ~5 минут (минимальная) / ~30 минут (полная)  
**Версия**: 1.0.0  
**Статус**: Production Ready ✅
