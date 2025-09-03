// Утилита для определения страны пользователя по IP

interface GeoLocation {
  country: string
  countryCode: string
  city?: string
  ip: string
}

// Кеш для геолокации на время сессии
let geoCache: GeoLocation | null = null

export async function getUserGeolocation(): Promise<GeoLocation | null> {
  // Возвращаем из кеша если есть
  if (geoCache) return geoCache

  try {
    // Проверяем, выполняется ли код на клиенте
    if (typeof window !== 'undefined') {
      // На клиенте используем наш API endpoint
      try {
        const response = await fetch('/api/geolocation')
        if (response.ok) {
          const data = await response.json()
          geoCache = data
          return data
        }
      } catch (error) {
        console.error('Ошибка получения геолокации через API:', error)
      }
    }

    // На сервере используем внешние сервисы
    const services = [
      'https://ipapi.co/json/',
      'https://ipinfo.io/json',
      'https://api.ipify.org?format=json'
    ]

    for (const service of services) {
      try {
        const response = await fetch(service)
        if (!response.ok) continue

        const data = await response.json()
        
        // Нормализуем ответ разных сервисов
        const location: GeoLocation = {
          country: data.country_name || data.country || 'Unknown',
          countryCode: data.country_code || data.country || 'XX',
          city: data.city,
          ip: data.ip || data.query || 'unknown'
        }

        // Кешируем результат
        geoCache = location
        return location
      } catch (err) {
        console.error(`Ошибка геолокации через ${service}:`, err)
        continue
      }
    }

    // Если все сервисы недоступны, пробуем через Cloudflare headers
    if (typeof window === 'undefined') {
      // На сервере можем проверить заголовки
      return null
    }

    // Fallback - считаем что не из России
    return {
      country: 'Unknown',
      countryCode: 'XX',
      ip: 'unknown'
    }
  } catch (error) {
    console.error('Ошибка определения геолокации:', error)
    return null
  }
}

export function isRussianUser(location: GeoLocation | null): boolean {
  if (!location || !location.countryCode) return false
  
  // Проверяем по коду страны
  const russianCodes = ['RU', 'RUS']
  return russianCodes.includes(location.countryCode.toUpperCase())
}

// Выбор видео источника на основе геолокации
export async function selectVideoSource(
  vkUrl?: string, 
  youtubeUrl?: string
): Promise<{ url: string; source: 'vk' | 'youtube' | 'default' }> {
  // Если есть только один источник, используем его
  if (!vkUrl && youtubeUrl) return { url: youtubeUrl, source: 'youtube' }
  if (vkUrl && !youtubeUrl) return { url: vkUrl, source: 'vk' }
  if (!vkUrl && !youtubeUrl) return { url: '', source: 'default' }

  // Если оба источника есть, выбираем по геолокации
  const location = await getUserGeolocation()
  const isRussia = isRussianUser(location)

  if (isRussia && vkUrl) {
    return { url: vkUrl, source: 'vk' }
  }

  if (youtubeUrl) {
    return { url: youtubeUrl, source: 'youtube' }
  }

  // Fallback на VK если YouTube недоступен
  return { url: vkUrl || '', source: 'vk' }
}

// Серверная функция для получения гео из заголовков
export function getGeolocationFromHeaders(headers: Headers): GeoLocation | null {
  try {
    // Cloudflare headers
    const cfCountry = headers.get('cf-ipcountry')
    const cfIp = headers.get('cf-connecting-ip')
    
    if (cfCountry) {
      return {
        country: cfCountry,
        countryCode: cfCountry,
        ip: cfIp || 'unknown'
      }
    }

    // X-Forwarded-For и другие прокси заголовки
    const xForwardedFor = headers.get('x-forwarded-for')
    const ip = xForwardedFor?.split(',')[0].trim() || headers.get('x-real-ip')

    if (ip) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        ip
      }
    }

    return null
  } catch (error) {
    console.error('Ошибка парсинга заголовков:', error)
    return null
  }
}