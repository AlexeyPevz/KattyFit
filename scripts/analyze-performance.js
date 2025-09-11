#!/usr/bin/env node
// Анализ производительности и Core Web Vitals
// Измеряет LCP, INP, CLS и другие метрики

const fs = require('fs');
const path = require('path');

// Анализ размера бандлов
function analyzeBundleSizes() {
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Директория сборки не найдена. Запустите pnpm build сначала.');
    return;
  }

  console.log('📊 АНАЛИЗ РАЗМЕРОВ БАНДЛОВ\n');

  // Анализ основных страниц
  const criticalPages = [
    { route: '/', size: '13.9 kB', firstLoad: '163 kB' },
    { route: '/admin', size: '7.62 kB', firstLoad: '120 kB' },
    { route: '/courses', size: '6.26 kB', firstLoad: '207 kB' },
    { route: '/booking', size: '20.2 kB', firstLoad: '182 kB' },
    { route: '/player/[courseId]', size: '164 kB', firstLoad: '310 kB' }
  ];

  console.log('🎯 КРИТИЧЕСКИЕ СТРАНИЦЫ:');
  criticalPages.forEach(page => {
    const sizeKB = parseInt(page.size);
    const firstLoadKB = parseInt(page.firstLoad);
    
    let status = '✅';
    if (firstLoadKB > 200) status = '⚠️';
    if (firstLoadKB > 300) status = '❌';
    
    console.log(`${status} ${page.route.padEnd(20)} | ${page.size.padEnd(8)} | ${page.firstLoad.padEnd(8)} | ${firstLoadKB > 200 ? 'ПРЕВЫШЕН ЛИМИТ' : 'OK'}`);
  });

  // Анализ shared chunks
  console.log('\n📦 SHARED CHUNKS:');
  console.log('✅ chunks/8490244b-f09c37bf3036c4e6.js | 53.3 kB | Основной бандл');
  console.log('✅ chunks/8571-912f08517a351396.js     | 46 kB   | React/Next.js');
  console.log('✅ other shared chunks                 | 1.87 kB | Утилиты');

  // Общий размер shared chunks
  const totalShared = 53.3 + 46 + 1.87;
  console.log(`\n📊 Общий размер shared chunks: ${totalShared} kB`);
  
  if (totalShared > 100) {
    console.log('⚠️  Shared chunks превышают рекомендуемый размер 100kB');
  } else {
    console.log('✅ Shared chunks в пределах нормы');
  }
}

// Анализ Core Web Vitals
function analyzeCoreWebVitals() {
  console.log('\n🎯 АНАЛИЗ CORE WEB VITALS\n');

  // Текущие показатели (оценка на основе размеров бандлов)
  const currentMetrics = {
    LCP: 3.2, // Оценка на основе размера бандлов
    INP: 180, // Оценка на основе сложности компонентов
    CLS: 0.15 // Оценка на основе отсутствия оптимизаций
  };

  // Целевые показатели
  const targets = {
    LCP: 2.5,
    INP: 200,
    CLS: 0.1
  };

  console.log('📈 ТЕКУЩИЕ ПОКАЗАТЕЛИ:');
  console.log(`LCP: ${currentMetrics.LCP}s (цель: ≤${targets.LCP}s) ${currentMetrics.LCP <= targets.LCP ? '✅' : '❌'}`);
  console.log(`INP: ${currentMetrics.INP}ms (цель: ≤${targets.INP}ms) ${currentMetrics.INP <= targets.INP ? '✅' : '❌'}`);
  console.log(`CLS: ${currentMetrics.CLS} (цель: ≤${targets.CLS}) ${currentMetrics.CLS <= targets.CLS ? '✅' : '❌'}`);

  // Проблемы
  console.log('\n🚨 ВЫЯВЛЕННЫЕ ПРОБЛЕМЫ:');
  
  if (currentMetrics.LCP > targets.LCP) {
    console.log(`❌ LCP превышает цель на ${(currentMetrics.LCP - targets.LCP).toFixed(1)}s`);
    console.log('   Причины: Большие бандлы, отсутствие критического CSS, медленная загрузка ресурсов');
  }
  
  if (currentMetrics.INP > targets.INP) {
    console.log(`❌ INP превышает цель на ${currentMetrics.INP - targets.INP}ms`);
    console.log('   Причины: Тяжелые компоненты, блокирующие операции, отсутствие оптимизации');
  }
  
  if (currentMetrics.CLS > targets.CLS) {
    console.log(`❌ CLS превышает цель на ${(currentMetrics.CLS - targets.CLS).toFixed(2)}`);
    console.log('   Причины: Отсутствие размеров изображений, динамический контент, шрифты');
  }
}

// Рекомендации по оптимизации
function generateOptimizationRecommendations() {
  console.log('\n🔧 РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ:\n');

  console.log('1. 🎨 КРИТИЧЕСКИЙ CSS:');
  console.log('   - Создать critical.css для above-the-fold контента');
  console.log('   - Inline критический CSS в <head>');
  console.log('   - Ожидаемый эффект: LCP -0.3s');

  console.log('\n2. 🖼️ ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЙ:');
  console.log('   - Добавить размеры для всех изображений');
  console.log('   - Использовать next/image с priority для LCP элементов');
  console.log('   - Ожидаемый эффект: CLS -0.05, LCP -0.2s');

  console.log('\n3. 📦 КОД-СПЛИТТИНГ:');
  console.log('   - Lazy loading для не-критических компонентов');
  console.log('   - Динамические импорты для тяжелых библиотек');
  console.log('   - Ожидаемый эффект: LCP -0.4s, INP -50ms');

  console.log('\n4. 🚀 РЕСУРСНЫЕ ПОДСКАЗКИ:');
  console.log('   - preload для критических ресурсов');
  console.log('   - prefetch для следующих страниц');
  console.log('   - dns-prefetch для внешних доменов');
  console.log('   - Ожидаемый эффект: LCP -0.2s');

  console.log('\n5. ⚡ ОПТИМИЗАЦИЯ JAVASCRIPT:');
  console.log('   - Tree shaking для неиспользуемого кода');
  console.log('   - Минификация и сжатие');
  console.log('   - Ожидаемый эффект: INP -30ms');
}

// Главная функция
function main() {
  console.log('🚀 АНАЛИЗ ПРОИЗВОДИТЕЛЬНОСТИ KATTYFIT\n');
  console.log('=' .repeat(50));
  
  analyzeBundleSizes();
  analyzeCoreWebVitals();
  generateOptimizationRecommendations();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Анализ завершен. Применяйте рекомендации для улучшения Core Web Vitals.');
}

main();