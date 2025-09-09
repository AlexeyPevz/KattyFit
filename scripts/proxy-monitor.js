#!/usr/bin/env node

/**
 * Скрипт мониторинга прокси
 * Проверяет доступность прокси и отправляет уведомления
 */

const https = require('https')
const http = require('http')

// Конфигурация
const config = {
  // Прокси для проверки
  proxies: [
    {
      name: 'ASOCKS',
      host: process.env.ASOCKS_HOST,
      port: process.env.ASOCKS_PORT,
      username: process.env.ASOCKS_USERNAME,
      password: process.env.ASOCKS_PASSWORD,
      type: 'asocks'
    },
    {
      name: 'Beget VPS',
      host: process.env.BEGET_PROXY_HOST,
      port: process.env.BEGET_PROXY_PORT,
      type: 'beget'
    }
  ],
  
  // Сервисы для проверки
  services: [
    { name: 'YouTube API', url: 'https://www.googleapis.com/youtube/v3/videos?part=id&chart=mostPopular&maxResults=1' },
    { name: 'OpenAI API', url: 'https://api.openai.com/v1/models' },
    { name: 'ElevenLabs API', url: 'https://api.elevenlabs.io/v1/voices' }
  ],
  
  // Настройки мониторинга
  checkInterval: 5 * 60 * 1000, // 5 минут
  timeout: 10000, // 10 секунд
  retryAttempts: 3,
  retryDelay: 5000 // 5 секунд
}

// Логирование
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] [${level}] ${message}`)
}

// Проверка прокси
async function checkProxy(proxy) {
  if (!proxy.host || !proxy.port) {
    return { name: proxy.name, status: 'not_configured', error: 'Missing host or port' }
  }

  const startTime = Date.now()
  
  try {
    const response = await makeRequest(proxy, 'https://httpbin.org/ip')
    const responseTime = Date.now() - startTime
    
    if (response.success) {
      return {
        name: proxy.name,
        status: 'healthy',
        responseTime,
        data: response.data
      }
    } else {
      return {
        name: proxy.name,
        status: 'error',
        error: response.error,
        responseTime
      }
    }
  } catch (error) {
    return {
      name: proxy.name,
      status: 'error',
      error: error.message,
      responseTime: Date.now() - startTime
    }
  }
}

// Выполнение запроса через прокси
function makeRequest(proxy, url) {
  return new Promise((resolve) => {
    const options = {
      hostname: proxy.host,
      port: proxy.port,
      path: url,
      method: 'GET',
      timeout: config.timeout,
      headers: {
        'User-Agent': 'ProxyMonitor/1.0'
      }
    }

    // Добавляем аутентификацию если есть
    if (proxy.username && proxy.password) {
      const auth = Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64')
      options.headers['Proxy-Authorization'] = `Basic ${auth}`
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            success: res.statusCode === 200,
            data: jsonData,
            statusCode: res.statusCode
          })
        } catch (error) {
          resolve({
            success: false,
            error: 'Invalid JSON response',
            data: data
          })
        }
      })
    })

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({
        success: false,
        error: 'Request timeout'
      })
    })

    req.end()
  })
}

// Проверка сервиса
async function checkService(service) {
  const startTime = Date.now()
  
  try {
    const response = await fetch(service.url, {
      method: 'HEAD',
      timeout: config.timeout
    })
    
    const responseTime = Date.now() - startTime
    
    return {
      name: service.name,
      status: response.ok ? 'available' : 'unavailable',
      responseTime,
      statusCode: response.status
    }
  } catch (error) {
    return {
      name: service.name,
      status: 'error',
      error: error.message,
      responseTime: Date.now() - startTime
    }
  }
}

// Отправка уведомления
async function sendNotification(message) {
  // Здесь можно добавить отправку уведомлений
  // Например, в Telegram, Slack, email и т.д.
  log(`NOTIFICATION: ${message}`, 'ALERT')
}

// Основная функция мониторинга
async function runMonitoring() {
  log('Starting proxy monitoring...')
  
  const results = {
    proxies: [],
    services: [],
    timestamp: new Date().toISOString()
  }

  // Проверяем прокси
  for (const proxy of config.proxies) {
    if (proxy.host && proxy.port) {
      const result = await checkProxy(proxy)
      results.proxies.push(result)
      
      if (result.status === 'error') {
        await sendNotification(`Proxy ${proxy.name} is down: ${result.error}`)
      } else if (result.status === 'healthy') {
        log(`Proxy ${proxy.name} is healthy (${result.responseTime}ms)`)
      }
    }
  }

  // Проверяем сервисы
  for (const service of config.services) {
    const result = await checkService(service)
    results.services.push(result)
    
    if (result.status === 'error') {
      await sendNotification(`Service ${service.name} is unavailable: ${result.error}`)
    } else if (result.status === 'available') {
      log(`Service ${service.name} is available (${result.responseTime}ms)`)
    }
  }

  // Сохраняем результаты
  log(`Monitoring completed. Proxies: ${results.proxies.length}, Services: ${results.services.length}`)
  
  // Можно сохранить результаты в файл или отправить в API
  // fs.writeFileSync('proxy-monitor-results.json', JSON.stringify(results, null, 2))
}

// Запуск мониторинга
async function start() {
  log('Proxy Monitor started')
  
  // Первая проверка
  await runMonitoring()
  
  // Периодические проверки
  setInterval(runMonitoring, config.checkInterval)
}

// Обработка ошибок
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'ERROR')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR')
})

// Запуск
if (require.main === module) {
  start()
}

module.exports = { runMonitoring, checkProxy, checkService }