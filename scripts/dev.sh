#!/bin/bash
# Скрипт для запуска в режиме разработки
# Проверяет окружение и запускает все необходимые сервисы

set -e

echo "🚀 Запуск в режиме разработки..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверяем версию Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Требуется Node.js 18+. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) найден"

# Проверяем наличие pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не найден. Установите pnpm: npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm $(pnpm -v) найден"

# Проверяем переменные окружения
echo "🔍 Проверка переменных окружения..."

if [ ! -f .env.local ]; then
    echo "⚠️  Файл .env.local не найден. Создаю шаблон..."
    cp .env.example .env.local 2>/dev/null || echo "Создайте файл .env.local с необходимыми переменными"
fi

# Проверяем критические переменные
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "ADMIN_USERNAME"
    "ADMIN_PASSWORD"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Отсутствуют критические переменные окружения:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo "   Установите их в .env.local или в переменных окружения v0"
    exit 1
fi

echo "✅ Все критические переменные окружения установлены"

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
pnpm install

# Проверяем типы
echo "🔍 Проверка типов TypeScript..."
pnpm type-check

# Запускаем линтер
echo "🔍 Проверка кода линтером..."
pnpm lint

# Запускаем тесты
echo "🧪 Запуск тестов..."
pnpm test

# Запускаем dev сервер
echo "🌐 Запуск dev сервера..."
pnpm dev