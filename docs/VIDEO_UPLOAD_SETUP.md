# 🎬 Настройка загрузки видео с геолокацией

## Архитектура решения

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   v0/Vercel │────▶│ Proxy (VPN) │────▶│YouTube API  │
│   (основной)│     │   (Beget)   │     │ (через VPN) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                         
       │                                         
       ▼                                         
┌─────────────┐                                 
│   VK API    │ (напрямую из v0)               
│  (из России)│                                 
└─────────────┘                                 
```

## 1. Настройка прокси-сервера на Beget

### Шаг 1: Создание VPS
1. Закажите VPS на Beget с поддержкой VPN
2. Установите Node.js 18+
3. Настройте VPN соединение (OpenVPN, WireGuard)

### Шаг 2: Установка прокси
```bash
# На VPS Beget
mkdir youtube-proxy
cd youtube-proxy
npm init -y
npm install express axios multer googleapis dotenv

# Скопируйте proxy-server-example.js
# Создайте .env файл
```

### Шаг 3: Настройка .env на прокси
```env
PORT=3001
API_KEY=ваш_секретный_ключ_для_прокси
YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxx
YOUTUBE_REFRESH_TOKEN=xxx
```

### Шаг 4: Запуск через PM2
```bash
npm install -g pm2
pm2 start proxy-server.js --name youtube-proxy
pm2 startup
pm2 save
```

## 2. Настройка v0/Vercel

Добавьте переменные окружения:

```env
# Прокси для YouTube
VIDEO_PROXY_URL=https://your-beget-server.ru:3001
VIDEO_PROXY_API_KEY=ваш_секретный_ключ_для_прокси

# VK API (работает напрямую)
VK_API_TOKEN=vk1.a.xxxxx
VK_GROUP_ID=123456789

# RuTube (опционально)
RUTUBE_API_TOKEN=xxxxx
```

## 3. Использование в коде

```typescript
// В конструкторе курсов
import { createVideoUploadService } from '@/lib/video-upload-service'

const uploadService = createVideoUploadService()

// Загрузка видео
const results = await uploadService.uploadVideo(file, {
  title: "Урок 1: Основы растяжки",
  description: "Базовые упражнения для начинающих",
  tags: ["растяжка", "фитнес", "йога"],
  isPrivate: true
})

// Результат будет содержать URL для всех платформ
console.log(results)
// [
//   { platform: 'vk', success: true, url: '...', embedUrl: '...' },
//   { platform: 'youtube', success: true, url: '...', embedUrl: '...' }
// ]
```

## 4. Воспроизведение с геолокацией

```tsx
// В компоненте урока
import { GeoVideoPlayer } from '@/components/player/geo-video-player'

<GeoVideoPlayer
  vkUrl={video.vk_embed_url}
  youtubeUrl={video.youtube_embed_url}
  hlsUrl={video.hls_url}
  title={video.title}
  onProgress={handleProgress}
  onComplete={handleComplete}
/>
```

## 5. Альтернативные решения

### Вариант 1: Cloudflare Workers
```javascript
// Прокси через Cloudflare Workers (бесплатно до 100k запросов)
export default {
  async fetch(request) {
    const url = new URL(request.url)
    
    // Проксируем к YouTube API
    const ytUrl = `https://www.googleapis.com/youtube/v3${url.pathname}${url.search}`
    
    return fetch(ytUrl, {
      headers: request.headers,
      method: request.method,
      body: request.body
    })
  }
}
```

### Вариант 2: Использование только VK
```typescript
// Если YouTube недоступен, используем только VK
const config = {
  platforms: isRussianIP ? ['vk'] : ['youtube', 'vk'],
  fallbackToVK: true
}
```

### Вариант 3: Предзагрузка через CI/CD
```yaml
# GitHub Actions с VPN
- name: Upload videos to YouTube
  uses: gacts/setup-wireguard@v1
  with:
    config: ${{ secrets.WIREGUARD_CONFIG }}
- run: npm run upload-videos
```

## 6. Мониторинг и отладка

### Проверка доступности платформ
```bash
# На v0
curl https://your-app.vercel.app/api/video/platforms/status

# Ответ
{
  "vk": { "available": true, "latency": 120 },
  "youtube": { "available": true, "latency": 340, "via": "proxy" },
  "rutube": { "available": true, "latency": 80 }
}
```

### Логирование
```typescript
// В прокси сервере
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})
```

## 7. Безопасность

1. **API ключи**
   - Используйте разные ключи для прокси и основного приложения
   - Ротация ключей каждые 3 месяца

2. **Ограничение доступа**
   - IP whitelist на прокси (только v0 servers)
   - Rate limiting на прокси

3. **Шифрование**
   - HTTPS обязательно
   - Можно добавить дополнительное шифрование payload

## 8. Оптимизация

1. **Кеширование**
   ```typescript
   // Кешируем результаты загрузки
   const cache = new Map()
   
   if (cache.has(fileHash)) {
     return cache.get(fileHash)
   }
   ```

2. **Очередь загрузки**
   ```typescript
   // Используем Bull для очереди
   uploadQueue.add('video', {
     file: fileBuffer,
     metadata: { ... }
   })
   ```

3. **Прогрессивная загрузка**
   - Сначала на VK (быстро)
   - Потом на YouTube в фоне
   - Уведомление когда все готово

## Итог

С такой архитектурой вы получаете:
- ✅ Надежную загрузку на все платформы
- ✅ Автоматический выбор источника по гео
- ✅ Работу из России без VPN для пользователей
- ✅ Fallback механизмы
- ✅ Масштабируемость