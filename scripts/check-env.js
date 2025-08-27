#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Определяем обязательные переменные
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
];

// Опциональные, но важные
const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'TELEGRAM_BOT_TOKEN',
  'VK_API_TOKEN',
  'YOOKASSA_SHOP_ID',
  'YOOKASSA_SECRET_KEY',
  'YANDEXGPT_API_KEY',
  'OPENAI_API_KEY',
];

console.log('🔍 Проверка переменных окружения для KattyFit...\n');

let hasErrors = false;
const missing = [];
const optional = [];

// Проверяем обязательные переменные
REQUIRED_ENV_VARS.forEach(varName => {
  if (!process.env[varName]) {
    hasErrors = true;
    missing.push(varName);
    console.log(`❌ ${varName} - ОТСУТСТВУЕТ (обязательная)`);
  } else {
    console.log(`✅ ${varName} - установлена`);
  }
});

console.log('\n📋 Опциональные переменные:\n');

// Проверяем опциональные переменные
OPTIONAL_ENV_VARS.forEach(varName => {
  if (!process.env[varName]) {
    optional.push(varName);
    console.log(`⚠️  ${varName} - не установлена (опционально)`);
  } else {
    console.log(`✅ ${varName} - установлена`);
  }
});

// Проверяем наличие хотя бы одного AI сервиса
const hasAI = process.env.YANDEXGPT_API_KEY || process.env.OPENAI_API_KEY;
if (!hasAI) {
  console.log('\n⚠️  Внимание: Не настроен ни один AI сервис (YandexGPT или OpenAI)');
  console.log('   Чат-бот не сможет генерировать интеллектуальные ответы');
}

// Итоги
console.log('\n📊 Итоги проверки:\n');

if (hasErrors) {
  console.log(`❌ Найдено ${missing.length} отсутствующих ОБЯЗАТЕЛЬНЫХ переменных`);
  console.log('   Приложение НЕ БУДЕТ работать корректно!');
  console.log('\n🔧 Что делать:');
  console.log('1. Откройте настройки проекта в v0');
  console.log('2. Перейдите в раздел Environment Variables');
  console.log('3. Добавьте отсутствующие переменные из .env.example');
  console.log('4. См. инструкцию в V0_ENV_SETUP.md');
  process.exit(1);
} else {
  console.log('✅ Все обязательные переменные установлены!');
  
  if (optional.length > 0) {
    console.log(`\n⚠️  ${optional.length} опциональных переменных не установлено`);
    console.log('   Некоторые функции могут быть недоступны');
  } else {
    console.log('✅ Все опциональные переменные также установлены!');
  }
  
  console.log('\n🚀 Приложение готово к работе!');
}

// Создаем файл статуса для v0
const status = {
  checked: new Date().toISOString(),
  required: {
    total: REQUIRED_ENV_VARS.length,
    missing: missing.length,
    vars: missing
  },
  optional: {
    total: OPTIONAL_ENV_VARS.length,
    missing: optional.length,
    vars: optional
  },
  ready: !hasErrors
};

fs.writeFileSync(
  path.join(process.cwd(), '.env-check-status.json'),
  JSON.stringify(status, null, 2)
);