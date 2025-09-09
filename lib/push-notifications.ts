// Управление push-уведомлениями
export class PushNotificationManager {
  private static instance: PushNotificationManager
  private registration: ServiceWorkerRegistration | null = null

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.ready
        console.log('Push уведомления готовы к работе')
      } catch (error) {
        console.error('Ошибка инициализации push уведомлений:', error)
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Браузер не поддерживает уведомления')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init()
    }

    const permission = await this.requestPermission()
    if (!permission || !this.registration) {
      return null
    }

    try {
      // Конвертируем VAPID публичный ключ
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID публичный ключ не настроен')
      }

      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey)

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      // Сохраняем подписку на сервере
      await this.saveSubscription(subscription)

      return subscription
    } catch (error) {
      console.error('Ошибка подписки на push уведомления:', error)
      return null
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await this.removeSubscription(subscription)
        return true
      }
      return false
    } catch (error) {
      console.error('Ошибка отписки от push уведомлений:', error)
      return false
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.init()
    }

    if (!this.registration) {
      return null
    }

    return await this.registration.pushManager.getSubscription()
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })

    if (!response.ok) {
      throw new Error('Не удалось сохранить подписку на сервере')
    }
  }

  private async removeSubscription(subscription: PushSubscription): Promise<void> {
    await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
  }

  // Локальное уведомление (для тестирования)
  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission()
    if (permission && this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge.png',
        vibrate: [100, 50, 100],
        ...options,
      })
    }
  }
}

export const pushNotifications = PushNotificationManager.getInstance()
