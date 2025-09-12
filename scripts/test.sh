#!/bin/bash
# Скрипт для запуска тестов
# Запускает все типы тестов с различными конфигурациями

set -e

echo "🧪 Запуск тестов..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 18+ и попробуйте снова."
    exit 1
fi

# Проверяем наличие pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm не найден. Установите pnpm: npm install -g pnpm"
    exit 1
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
pnpm install

# Запускаем unit тесты
echo "🔬 Запуск unit тестов..."
pnpm test:unit

# Запускаем integration тесты
echo "🔗 Запуск integration тестов..."
pnpm test:integration

# Запускаем e2e тесты
echo "🌐 Запуск e2e тестов..."
pnpm test:e2e

# Запускаем тесты покрытия
echo "📊 Запуск тестов покрытия..."
pnpm test:coverage

# Запускаем тесты производительности
echo "⚡ Запуск тестов производительности..."
pnpm test:performance

# Запускаем тесты безопасности
echo "🔒 Запуск тестов безопасности..."
pnpm test:security

# Запускаем тесты доступности
echo "♿ Запуск тестов доступности..."
pnpm test:a11y

echo "✅ Все тесты завершены успешно!"