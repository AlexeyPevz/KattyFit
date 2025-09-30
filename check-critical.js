const fs = require('fs');
const path = require('path');

console.log('\n🔍 CRITICAL PATH ANALYSIS\n');

// Проверяем наличие SQL схемы
const sqlFiles = [
  'docs/complete-database-schema.sql',
  'docs/supabase-schema.sql',
  'docs/migrations/001_initial_schema.sql'
];

console.log('📋 DATABASE SCHEMA FILES:\n');
sqlFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Проверяем env.example
console.log('\n📝 ENV CONFIGURATION:\n');
const envExample = fs.existsSync('.env.example');
console.log(`${envExample ? '✅' : '❌'} .env.example exists`);

// Проверяем критические файлы
const criticalFiles = [
  'lib/supabase.ts',
  'lib/supabase-admin.ts',
  'lib/env.ts',
  'app/api/admin/auth/route.ts',
  'app/layout.tsx',
  'middleware.ts'
];

console.log('\n🔑 CRITICAL FILES:\n');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const size = exists ? fs.statSync(file).size : 0;
  console.log(`${exists ? '✅' : '❌'} ${file} (${size} bytes)`);
});

// Проверяем pages
console.log('\n📄 KEY PAGES:\n');
const pages = [
  'app/page.tsx',
  'app/preview/page.tsx',
  'app/admin/page.tsx',
  'app/admin/auth/page.tsx'
];

pages.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Проверяем компоненты
console.log('\n🎨 UI COMPONENTS:\n');
const components = [
  'components/landing/hero.tsx',
  'components/landing/navbar.tsx',
  'components/admin/env-status.tsx',
  'components/payment/cloudpayments-checkout.tsx'
];

components.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Анализируем imports в критичных файлах
console.log('\n🔗 IMPORT CHAINS:\n');

function checkImports(file) {
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, 'utf8');
  const imports = [];
  const matches = content.matchAll(/from ['"](@\/[^'"]+)['"]/g);
  for (const match of matches) {
    imports.push(match[1]);
  }
  return imports;
}

const mainPageImports = checkImports('app/page.tsx');
console.log(`app/page.tsx imports ${mainPageImports.length} local modules:`);
mainPageImports.slice(0, 5).forEach(imp => console.log(`  - ${imp}`));

// Проверяем missing dependencies
console.log('\n🚨 DEPENDENCY ISSUES:\n');

function findBrokenImports(file) {
  const imports = checkImports(file);
  const broken = [];
  
  imports.forEach(imp => {
    const filePath = imp.replace('@/', '') + '.ts';
    const filePath2 = imp.replace('@/', '') + '.tsx';
    
    if (!fs.existsSync(filePath) && !fs.existsSync(filePath2)) {
      broken.push(imp);
    }
  });
  
  return broken;
}

const criticalForCheck = [
  'app/page.tsx',
  'app/admin/page.tsx',
  'lib/supabase.ts'
];

let totalBroken = 0;
criticalForCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const broken = findBrokenImports(file);
    if (broken.length > 0) {
      console.log(`❌ ${file}:`);
      broken.forEach(b => console.log(`   Missing: ${b}`));
      totalBroken += broken.length;
    } else {
      console.log(`✅ ${file}: All imports OK`);
    }
  }
});

if (totalBroken === 0) {
  console.log('✅ No broken imports found!');
}

// Проверяем build артефакты
console.log('\n📦 BUILD CHECK:\n');
const buildExists = fs.existsSync('.next');
console.log(`${buildExists ? '✅' : '⚠️'} .next build directory ${buildExists ? 'exists' : 'not exists (normal before first build)'}`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`✅ Next.js version: ${packageJson.dependencies.next}`);
console.log(`✅ React version: ${packageJson.dependencies.react}`);

