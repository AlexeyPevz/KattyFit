// Пример прокси-сервера для YouTube API
// Развертывается на VPS с VPN (например, Beget)

const express = require('express')
const axios = require('axios')
const multer = require('multer')
const { google } = require('googleapis')
const fs = require('fs')

const app = express()
const upload = multer({ dest: 'uploads/' })

// Настройки
const PORT = process.env.PORT || 3001
const API_KEY = process.env.API_KEY || 'your-secret-key'
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET
const YOUTUBE_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN

// Middleware для проверки API ключа
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Инициализация YouTube клиента
const oauth2Client = new google.auth.OAuth2(
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  'http://localhost:3001/oauth2callback'
)

oauth2Client.setCredentials({
  refresh_token: YOUTUBE_REFRESH_TOKEN
})

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client
})

// Health check для YouTube
app.get('/health/youtube', async (req, res) => {
  try {
    // Простая проверка доступности YouTube API
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1', {
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`
      }
    })
    res.json({ status: 'ok', available: true })
  } catch (error) {
    res.json({ status: 'error', available: false })
  }
})

// Загрузка видео на YouTube
app.post('/youtube/upload', checkApiKey, upload.single('file'), async (req, res) => {
  try {
    const { title, description, isPrivate } = req.body
    const videoPath = req.file.path

    // Загружаем видео на YouTube
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: title,
          description: description,
          tags: ['fitness', 'yoga', 'stretching'],
          categoryId: '17', // Sports
        },
        status: {
          privacyStatus: isPrivate === '1' ? 'unlisted' : 'public',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    })

    // Удаляем временный файл
    fs.unlinkSync(videoPath)

    // Возвращаем результат
    res.json({
      platform: 'youtube',
      success: true,
      videoId: response.data.id,
      url: `https://www.youtube.com/watch?v=${response.data.id}`,
      embedUrl: `https://www.youtube.com/embed/${response.data.id}`,
    })
  } catch (error) {
    console.error('YouTube upload error:', error)
    res.status(500).json({
      platform: 'youtube',
      success: false,
      error: error.message,
    })
  }
})

// Получение информации о видео
app.get('/youtube/video/:videoId', checkApiKey, async (req, res) => {
  try {
    const { videoId } = req.params
    
    const response = await youtube.videos.list({
      part: ['snippet', 'status', 'contentDetails'],
      id: [videoId],
    })

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json(response.data.items[0])
  } catch (error) {
    console.error('YouTube video info error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Обновление видео
app.put('/youtube/video/:videoId', checkApiKey, async (req, res) => {
  try {
    const { videoId } = req.params
    const { title, description } = req.body
    
    const response = await youtube.videos.update({
      part: ['snippet'],
      requestBody: {
        id: videoId,
        snippet: {
          title: title,
          description: description,
          categoryId: '17',
        },
      },
    })

    res.json({
      success: true,
      video: response.data,
    })
  } catch (error) {
    console.error('YouTube update error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Вспомогательная функция для получения access token
async function getAccessToken() {
  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials.access_token
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`)
  console.log('Make sure VPN is connected for YouTube API access')
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  app.close(() => {
    console.log('HTTP server closed')
  })
})
