// Push Notifications Service
// Handles Web Push API integration for browser notifications

import { env } from './env'

interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  data?: any
  actions?: Array<{action: string, title: string, icon?: string}>
}

class PushNotificationService {
  private vapidPublicKey: string
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  // Check current permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser')
    }

    return await Notification.requestPermission()
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported')
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      this.serviceWorkerRegistration = registration
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      throw error
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    try {
      // Check if already subscribed
      const existingSubscription = await this.getSubscription()
      if (existingSubscription) {
        return existingSubscription
      }

      // Register service worker if not already registered
      if (!this.serviceWorkerRegistration) {
        await this.registerServiceWorker()
      }

      // Request permission
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Subscribe to push notifications
      const subscription = await this.serviceWorkerRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      const subscription = await this.getSubscription()
      if (!subscription) {
        return true // Already unsubscribed
      }

      const success = await subscription.unsubscribe()
      if (success) {
        // Notify server about unsubscription
        await this.sendUnsubscriptionToServer(subscription)
      }

      return success
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }

  // Get current subscription
  async getSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        await this.registerServiceWorker()
      }

      return await this.serviceWorkerRegistration!.pushManager.getSubscription()
    } catch (error) {
      console.error('Failed to get push subscription:', error)
      return null
    }
  }

  // Show local notification
  async showLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported')
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    const notification = new Notification(title, {
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      ...options
    })

    // Auto-close after 5 seconds if not requiring interaction
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }

    return new Promise((resolve) => {
      notification.onclose = () => resolve()
    })
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  // Send unsubscription to server
  private async sendUnsubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      })
    } catch (error) {
      console.error('Failed to send unsubscription to server:', error)
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Export singleton instance
export const pushNotifications = new PushNotificationService()
