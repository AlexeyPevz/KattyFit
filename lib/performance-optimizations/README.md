# Performance Optimizations

Набор утилит и хуков для оптимизации производительности React компонентов.

## Основные принципы

### 1. Мемоизация
- `useMemo` - для дорогих вычислений
- `useCallback` - для функций, передаваемых как props
- `React.memo` - для компонентов

### 2. Виртуализация
- Виртуальная прокрутка для больших списков
- Ленивая загрузка компонентов
- Пагинация и бесконечная прокрутка

### 3. Дебаунсинг и троттлинг
- `useDebounce` - для поиска и фильтрации
- `useThrottle` - для обработки скролла и ресайза

### 4. Оптимизация рендеринга
- Батчинг обновлений состояния
- Избегание лишних ре-рендеров
- Оптимизация зависимостей в useEffect

## Хуки

### useDebounce
Задерживает обновление значения до тех пор, пока не пройдет указанное время без изменений.

\`\`\`typescript
const debouncedSearchTerm = useDebounce(searchTerm, 300)
\`\`\`

### useThrottle
Ограничивает частоту вызова функции.

\`\`\`typescript
const throttledScrollHandler = useThrottle(handleScroll, 16) // ~60fps
\`\`\`

### useOptimizedSearch
Оптимизированный поиск с дебаунсингом.

\`\`\`typescript
const filteredItems = useOptimizedSearch(
  items,
  searchTerm,
  ['name', 'email'],
  300 // debounce delay
)
\`\`\`

### useVirtualScroll
Виртуальная прокрутка для больших списков.

\`\`\`typescript
const {
  visibleItems,
  totalHeight,
  offsetY,
  setScrollTop
} = useVirtualScroll(items, itemHeight, containerHeight, overscan)
\`\`\`

### usePerformanceMonitor
Мониторинг производительности компонента.

\`\`\`typescript
const { renderCount, lastRenderTime } = usePerformanceMonitor('ComponentName')
\`\`\`

### useLazyLoad
Ленивая загрузка компонентов при появлении в viewport.

\`\`\`typescript
const { ref, isIntersecting, hasLoaded } = useLazyLoad(0.1, '0px')
\`\`\`

### useOptimizedForm
Оптимизированная обработка форм.

\`\`\`typescript
const {
  values,
  errors,
  touched,
  setValue,
  setFieldTouched,
  reset,
  isValid
} = useOptimizedForm(initialValues, validationSchema)
\`\`\`

## Лучшие практики

### 1. Избегайте лишних ре-рендеров
\`\`\`typescript
// ❌ Плохо - создает новую функцию при каждом рендере
<Component onClick={() => handleClick(id)} />

// ✅ Хорошо - мемоизированная функция
const handleClick = useCallback((id: string) => {
  // логика
}, [dependencies])

<Component onClick={handleClick} />
\`\`\`

### 2. Мемоизируйте дорогие вычисления
\`\`\`typescript
// ❌ Плохо - вычисляется при каждом рендере
const expensiveValue = items.reduce((acc, item) => acc + item.value, 0)

// ✅ Хорошо - мемоизированное вычисление
const expensiveValue = useMemo(() => 
  items.reduce((acc, item) => acc + item.value, 0), 
  [items]
)
\`\`\`

### 3. Оптимизируйте зависимости
\`\`\`typescript
// ❌ Плохо - лишние зависимости
useEffect(() => {
  fetchData(userId)
}, [userId, someOtherValue]) // someOtherValue не используется

// ✅ Хорошо - только необходимые зависимости
useEffect(() => {
  fetchData(userId)
}, [userId])
\`\`\`

### 4. Используйте виртуализацию для больших списков
\`\`\`typescript
// Для списков > 100 элементов
const { visibleItems, totalHeight, offsetY } = useVirtualScroll(
  items, 
  60, // высота элемента
  400, // высота контейнера
  5 // overscan
)
\`\`\`

### 5. Дебаунсинг для поиска
\`\`\`typescript
const debouncedSearchTerm = useDebounce(searchTerm, 300)

const filteredItems = useMemo(() => {
  return items.filter(item => 
    item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )
}, [items, debouncedSearchTerm])
\`\`\`

## Измерение производительности

### React DevTools Profiler
1. Установите React DevTools
2. Откройте вкладку Profiler
3. Запишите профиль производительности
4. Анализируйте компоненты с высоким временем рендеринга

### Performance API
\`\`\`typescript
// Измерение времени рендеринга
const startTime = performance.now()
// ... рендеринг компонента
const endTime = performance.now()
console.log(`Render time: ${endTime - startTime}ms`)
\`\`\`

### usePerformanceMonitor
\`\`\`typescript
const { renderCount, lastRenderTime } = usePerformanceMonitor('MyComponent')

// В development режиме будет логировать:
// [Performance] MyComponent rendered 5 times, 120ms since last render
\`\`\`

## Профилирование

### 1. Identify Bottlenecks
- Используйте React DevTools Profiler
- Проверьте компоненты с частыми ре-рендерами
- Анализируйте время выполнения

### 2. Optimize Critical Path
- Мемоизируйте дорогие вычисления
- Оптимизируйте зависимости useEffect
- Используйте виртуализацию для больших списков

### 3. Measure Impact
- Сравните производительность до и после оптимизации
- Используйте метрики Core Web Vitals
- Тестируйте на разных устройствах

## Примеры использования

См. `components/examples/performance-optimized-list.tsx` для полного примера оптимизированного списка с:
- Виртуальной прокруткой
- Оптимизированным поиском
- Дебаунсингом
- Мониторингом производительности
- Мемоизированными обработчиками

## Заключение

Оптимизация производительности - это итеративный процесс. Начните с измерения, определите узкие места, примените оптимизации и измерьте результат. Помните, что преждевременная оптимизация может усложнить код без значительного улучшения производительности.
