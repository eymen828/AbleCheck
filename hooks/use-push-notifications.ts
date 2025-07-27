"use client"

import { useState, useEffect } from 'react'

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // VAPID Public Key - In Produktion sollte das aus Umgebungsvariablen kommen
  const vapidPublicKey = 'BElOG1JjijoRPzmM1URQieuQAqGIbw5oqRTcpGpgaDIdT5e_q-i8-JlUhQ4W6Rq1AZBkjPgroACYl46lYf08e5o'

  useEffect(() => {
    // Prüfe, ob Push-Benachrichtigungen unterstützt werden
    if (typeof window !== 'undefined') {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window
      setIsSupported(supported)
      
      if (supported) {
        checkSubscriptionStatus()
      }
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      
      if (existingSubscription) {
        setIsSubscribed(true)
        setSubscription({
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth'))
          }
        })
      }
    } catch (err) {
      console.error('Error checking subscription status:', err)
      setError('Fehler beim Prüfen des Benachrichtigungsstatus')
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push-Benachrichtigungen werden nicht unterstützt')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (err) {
      console.error('Error requesting permission:', err)
      setError('Fehler beim Anfordern der Berechtigung')
      return false
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push-Benachrichtigungen werden nicht unterstützt')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Berechtigung anfordern
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        setError('Berechtigung für Benachrichtigungen wurde verweigert')
        return false
      }

      // Service Worker registrieren
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Push-Subscription erstellen
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth'))
        }
      }

      // Subscription an Server senden
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Subscription')
      }

      setSubscription(subscriptionData)
      setIsSubscribed(true)
      return true

    } catch (err) {
      console.error('Error subscribing:', err)
      setError('Fehler beim Abonnieren der Benachrichtigungen')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return false

    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()
      
      if (pushSubscription) {
        await pushSubscription.unsubscribe()
      }

      // Subscription vom Server entfernen
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      })

      setSubscription(null)
      setIsSubscribed(false)
      return true

    } catch (err) {
      console.error('Error unsubscribing:', err)
      setError('Fehler beim Abbestellen der Benachrichtigungen')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission
  }
}

// Hilfsfunktionen
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}