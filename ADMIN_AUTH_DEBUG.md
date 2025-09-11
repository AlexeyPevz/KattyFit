# Диагностика проблем с аутентификацией админ панели

## Шаги для диагностики:

### 1. Проверьте консоль браузера
Откройте Developer Tools (F12) и перейдите на вкладку Console. При попытке входа вы должны увидеть:

\`\`\`
Attempting admin login with: {username: "ваш_логин", password: "***"}
API response: {status: 200, data: {success: true, username: "ваш_логин", message: "Успешная аутентификация"}}
Admin auth successful: {username: "ваш_логин", sessionData: {...}, redirectUrl: "/admin"}
Redirecting to: /admin
AdminGuard auth check: {sessionUsername: "ваш_логин", expectedUser: "ваш_логин", match: true}
AdminGuard: Authentication successful
\`\`\`

### 2. Проверьте переменные окружения
Запустите тест:
\`\`\`bash
node test-admin-auth.js
\`\`\`

### 3. Данные для входа:
Используйте данные, заданные в переменных окружения v0:
- **Логин:** значение переменной `NEXT_PUBLIC_ADMIN_USERNAME`
- **Пароль:** значение переменной `ADMIN_PASSWORD`

### 4. Возможные проблемы и решения:

#### Проблема: "Username mismatch"
**Решение:** Убедитесь, что переменные `ADMIN_USERNAME` и `NEXT_PUBLIC_ADMIN_USERNAME` имеют одинаковые значения.

#### Проблема: Страница перезагружается без входа
**Решение:** 
1. Проверьте консоль на ошибки
2. Убедитесь, что API возвращает статус 200
3. Проверьте, что localStorage сохраняет данные сессии

#### Проблема: "Ошибка конфигурации сервера"
**Решение:** Установите переменные окружения `ADMIN_USERNAME` и `ADMIN_PASSWORD`

### 5. Проверка localStorage
В консоли браузера выполните:
\`\`\`javascript
console.log(localStorage.getItem("admin_session"))
\`\`\`

Должно вернуть объект с username и expiresAt.

### 6. Принудительная очистка сессии
Если нужно сбросить сессию:
\`\`\`javascript
localStorage.removeItem("admin_session")
location.reload()
\`\`\`

## Изменения в коде:

1. ✅ Исправлено несоответствие переменных окружения между API и клиентом
2. ✅ Добавлена отладочная информация во все компоненты
3. ✅ Улучшена логика редиректов с использованием window.location
4. ✅ Добавлены слушатели изменений localStorage
5. ✅ Убрано дублирование AdminGuard в главной странице админ панели
