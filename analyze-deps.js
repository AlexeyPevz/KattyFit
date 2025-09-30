const fs = require('fs');
const path = require('path');

const results = {
  endpoints: [],
  dependencies: {},
  missing: [],
  criticalPaths: []
};

// Рекурсивно ищем все API routes
function findApiRoutes(dir, routes = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findApiRoutes(fullPath, routes);
    } else if (file === 'route.ts') {
      routes.push(fullPath);
    }
  });
  
  return routes;
}

// Анализируем зависимости файла
function analyzeDependencies(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const deps = {
    file: filePath,
    imports: [],
    envVars: [],
    supabaseCalls: [],
    externalAPIs: [],
    hasErrorHandling: false,
    hasValidation: false
  };
  
  // Импорты
  const importMatches = content.matchAll(/import.*from ['"](.+)['"]/g);
  for (const match of importMatches) {
    deps.imports.push(match[1]);
  }
  
  // Переменные окружения
  const envMatches = content.matchAll(/process\.env\.(\w+)/g);
  for (const match of envMatches) {
    deps.envVars.push(match[1]);
  }
  
  // Supabase вызовы
  if (content.includes('supabase') || content.includes('supabaseAdmin')) {
    const tableMatches = content.matchAll(/\.from\(['"](\w+)['"]\)/g);
    for (const match of tableMatches) {
      deps.supabaseCalls.push(match[1]);
    }
  }
  
  // Внешние API
  const apiMatches = content.matchAll(/fetch\(['"]([^'"]+)['"]/g);
  for (const match of apiMatches) {
    if (match[1].startsWith('http')) {
      deps.externalAPIs.push(match[1]);
    }
  }
  
  // Error handling
  deps.hasErrorHandling = content.includes('try') && content.includes('catch');
  
  // Validation
  deps.hasValidation = content.includes('zod') || content.includes('.safeParse');
  
  return deps;
}

// Анализируем все endpoints
const apiDir = path.join(process.cwd(), 'app/api');
const routes = findApiRoutes(apiDir);

routes.forEach(route => {
  const deps = analyzeDependencies(route);
  results.endpoints.push(deps);
  
  // Собираем уникальные зависимости
  deps.envVars.forEach(v => {
    if (!results.dependencies[v]) {
      results.dependencies[v] = [];
    }
    results.dependencies[v].push(route);
  });
});

// Критичные переменные окружения
const criticalEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD'
];

// Проверяем наличие критичных зависимостей
criticalEnvVars.forEach(varName => {
  if (results.dependencies[varName] && results.dependencies[varName].length > 0) {
    results.criticalPaths.push({
      var: varName,
      required: true,
      usedIn: results.dependencies[varName].length + ' endpoints'
    });
  }
});

// Находим потенциальные проблемы
results.endpoints.forEach(ep => {
  if (ep.supabaseCalls.length > 0 && !ep.hasErrorHandling) {
    results.missing.push({
      file: ep.file,
      issue: 'Supabase calls without error handling'
    });
  }
  
  if (ep.externalAPIs.length > 0 && !ep.hasErrorHandling) {
    results.missing.push({
      file: ep.file,
      issue: 'External API calls without error handling'
    });
  }
});

// Статистика
console.log('\n📊 DEPENDENCY GRAPH ANALYSIS\n');
console.log('Total API Endpoints:', routes.length);
console.log('Total Environment Variables:', Object.keys(results.dependencies).length);
console.log('Critical Paths:', results.criticalPaths.length);
console.log('Potential Issues:', results.missing.length);

console.log('\n🔴 CRITICAL DEPENDENCIES:\n');
results.criticalPaths.forEach(cp => {
  console.log(`- ${cp.var}: ${cp.usedIn}`);
});

console.log('\n📦 ALL ENVIRONMENT VARIABLES:\n');
Object.keys(results.dependencies).sort().forEach(varName => {
  const count = results.dependencies[varName].length;
  const required = criticalEnvVars.includes(varName) ? '🔴 REQUIRED' : '�� OPTIONAL';
  console.log(`${required} ${varName}: ${count} endpoints`);
});

console.log('\n⚠️ POTENTIAL ISSUES:\n');
if (results.missing.length === 0) {
  console.log('✅ No issues found!');
} else {
  results.missing.forEach(m => {
    console.log(`- ${m.file.replace(process.cwd(), '')}`);
    console.log(`  Issue: ${m.issue}`);
  });
}

// Supabase tables
console.log('\n🗄️ SUPABASE TABLES USED:\n');
const allTables = new Set();
results.endpoints.forEach(ep => {
  ep.supabaseCalls.forEach(table => allTables.add(table));
});
Array.from(allTables).sort().forEach(table => {
  const endpoints = results.endpoints.filter(ep => ep.supabaseCalls.includes(table)).length;
  console.log(`- ${table}: ${endpoints} endpoints`);
});

// External APIs
console.log('\n🌐 EXTERNAL APIs:\n');
const allAPIs = new Set();
results.endpoints.forEach(ep => {
  ep.externalAPIs.forEach(api => {
    const domain = new URL(api).hostname;
    allAPIs.add(domain);
  });
});
Array.from(allAPIs).sort().forEach(api => {
  console.log(`- ${api}`);
});

