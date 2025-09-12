#!/bin/bash
# Скрипт для проверки кода
# Запускает линтер, форматтер и проверку типов

set -e

echo "🔍 Проверка кода..."

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

# Проверяем типы TypeScript
echo "🔍 Проверка типов TypeScript..."
pnpm type-check

# Запускаем ESLint
echo "🔍 Запуск ESLint..."
pnpm lint

# Запускаем Prettier
echo "🎨 Проверка форматирования Prettier..."
pnpm format:check

# Запускаем проверку импортов
echo "📦 Проверка импортов..."
pnpm lint:imports

# Запускаем проверку зависимостей
echo "🔍 Проверка зависимостей..."
pnpm lint:deps

# Запускаем проверку безопасности
echo "🔒 Проверка безопасности..."
pnpm audit

# Запускаем проверку лицензий
echo "📄 Проверка лицензий..."
pnpm lint:licenses

echo "✅ Все проверки кода завершены успешно!"
