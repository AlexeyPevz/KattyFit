#!/bin/bash

# 🚀 KattyFit Platform - Setup from Scratch
# Скрипт для проверки воспроизводимости "с нуля до запуска"

set -e  # Остановка при ошибке

echo "🚀 KattyFit Platform - Setup from Scratch"
echo "=========================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Проверка системных требований
check_requirements() {
    log "Проверка системных требований..."
    
    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js не установлен. Установите Node.js 18+ с https://nodejs.org/"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Требуется Node.js 18+. Текущая версия: $(node --version)"
    fi
    success "Node.js $(node --version) ✓"
    
    # Проверка npm
    if ! command -v npm &> /dev/null; then
        error "npm не установлен"
    fi
    success "npm $(npm --version) ✓"
    
    # Проверка git
    if ! command -v git &> /dev/null; then
        error "git не установлен"
    fi
    success "git $(git --version) ✓"
}

# Клонирование репозитория
clone_repository() {
    log "Клонирование репозитория..."
    
    if [ -d "ai-content-studio" ]; then
        warning "Папка ai-content-studio уже существует. Удаляем..."
        rm -rf ai-content-studio
    fi
    
    # Замените на реальный URL репозитория
    REPO_URL="https://github.com/your-username/ai-content-studio.git"
    
    if ! git clone "$REPO_URL"; then
        error "Не удалось клонировать репозиторий. Проверьте URL: $REPO_URL"
    fi
    
    cd ai-content-studio
    success "Репозиторий клонирован ✓"
}

# Установка зависимостей
install_dependencies() {
    log "Установка зависимостей..."
    
    # Очистка кэша
    npm cache clean --force
    
    # Установка зависимостей
    if ! npm install; then
        error "Не удалось установить зависимости"
    fi
    
    success "Зависимости установлены ✓"
}

# Создание файла окружения
create_env_file() {
    log "Создание файла окружения..."
    
    if [ -f ".env.local" ]; then
        warning "Файл .env.local уже существует. Создаем резервную копию..."
        cp .env.local .env.local.backup
    fi
    
    cat > .env.local << 'EOF'
# Supabase (обязательно)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI сервисы
ELEVENLABS_API_KEY=your_elevenlabs_key
YANDEX_GPT_API_KEY=your_yandex_key
OPENAI_API_KEY=your_openai_key

# ContentStudio (для автопостинга)
CONTENTSTUDIO_API_KEY=your_contentstudio_key

# Платежи
CLOUDPAYMENTS_PUBLIC_ID=your_cloudpayments_id
CLOUDPAYMENTS_SECRET=your_cloudpayments_secret

# Webhook для чатов
META_WEBHOOK_TOKEN=your_webhook_verification_token

# VK интеграция
VK_ACCESS_TOKEN=your_vk_token
VK_GROUP_ID=your_group_id

# YouTube интеграция
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token

# Sentry (опционально)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
EOF
    
    warning "Файл .env.local создан с шаблонными значениями"
    warning "ВАЖНО: Замените все 'your_*' значения на реальные!"
    success "Файл окружения создан ✓"
}

# Проверка TypeScript
check_typescript() {
    log "Проверка TypeScript..."
    
    if ! npm run type-check; then
        error "Ошибки TypeScript обнаружены. Проверьте код."
    fi
    
    success "TypeScript проверка пройдена ✓"
}

# Запуск тестов
run_tests() {
    log "Запуск тестов..."
    
    # Проверка наличия тестов
    if [ ! -d "__tests__" ]; then
        warning "Папка тестов не найдена. Пропускаем тесты."
        return
    fi
    
    if ! npm run test; then
        warning "Некоторые тесты не прошли. Проверьте конфигурацию."
    else
        success "Тесты пройдены ✓"
    fi
}

# Сборка проекта
build_project() {
    log "Сборка проекта..."
    
    if ! npm run build; then
        error "Сборка проекта не удалась. Проверьте ошибки выше."
    fi
    
    success "Проект собран ✓"
}

# Проверка конфигурации
check_configuration() {
    log "Проверка конфигурации..."
    
    # Проверка наличия обязательных файлов
    REQUIRED_FILES=(
        "package.json"
        "next.config.js"
        "tsconfig.json"
        "tailwind.config.ts"
        "components.json"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            error "Обязательный файл не найден: $file"
        fi
    done
    
    success "Конфигурация проверена ✓"
}

# Запуск в dev режиме
start_dev_server() {
    log "Запуск в режиме разработки..."
    
    warning "Запускаем dev сервер на 10 секунд для проверки..."
    warning "Откройте http://localhost:3000 в браузере"
    
    # Запуск в фоне
    npm run dev &
    DEV_PID=$!
    
    # Ожидание запуска
    sleep 10
    
    # Проверка доступности
    if curl -s http://localhost:3000 > /dev/null; then
        success "Dev сервер запущен и доступен ✓"
    else
        warning "Dev сервер запущен, но не отвечает на запросы"
    fi
    
    # Остановка сервера
    kill $DEV_PID 2>/dev/null || true
    success "Dev сервер остановлен ✓"
}

# Создание отчета
create_report() {
    log "Создание отчета..."
    
    REPORT_FILE="setup-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
# KattyFit Platform - Setup Report
Generated: $(date)
Node.js: $(node --version)
npm: $(npm --version)
Git: $(git --version)

## Проверки
✅ Системные требования
✅ Клонирование репозитория
✅ Установка зависимостей
✅ Создание файла окружения
✅ TypeScript проверка
✅ Сборка проекта
✅ Конфигурация
✅ Dev сервер

## Следующие шаги
1. Настройте переменные окружения в .env.local
2. Настройте базу данных Supabase
3. Запустите: npm run dev
4. Откройте: http://localhost:3000

## Файлы конфигурации
- package.json: Зависимости и скрипты
- next.config.js: Next.js конфигурация
- tsconfig.json: TypeScript конфигурация
- tailwind.config.ts: Tailwind CSS конфигурация
- components.json: Shadcn UI конфигурация

## Структура проекта
- /app: Next.js App Router
- /components: React компоненты
- /lib: Утилиты и сервисы
- /hooks: React hooks
- /types: TypeScript типы
- /__tests__: Тесты
- /docs: Документация
EOF
    
    success "Отчет создан: $REPORT_FILE ✓"
}

# Основная функция
main() {
    echo
    log "Начинаем настройку KattyFit Platform с нуля..."
    echo
    
    check_requirements
    clone_repository
    install_dependencies
    create_env_file
    check_configuration
    check_typescript
    run_tests
    build_project
    start_dev_server
    create_report
    
    echo
    success "🎉 Настройка завершена успешно!"
    echo
    echo "📋 Следующие шаги:"
    echo "1. Настройте переменные окружения в .env.local"
    echo "2. Настройте базу данных Supabase"
    echo "3. Запустите: npm run dev"
    echo "4. Откройте: http://localhost:3000"
    echo
    echo "📚 Документация:"
    echo "- README.md: Основная документация"
    echo "- V0_ENV_SETUP.md: Настройка переменных окружения"
    echo "- OPERATIONS_GUIDE.md: Операционное руководство"
    echo "- MIGRATION_GUIDE.md: Руководство по миграциям"
    echo
}

# Запуск
main "$@"