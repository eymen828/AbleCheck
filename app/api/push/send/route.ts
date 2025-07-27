import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import webpush from 'web-push'

// VAPID Keys - In Produktion sollten diese aus Umgebungsvariablen kommen
const vapidKeys = {
  publicKey: 'BElOG1JjijoRPzmM1URQieuQAqGIbw5oqRTcpGpgaDIdT5e_q-i8-JlUhQ4W6Rq1AZBkjPgroACYl46lYf08e5o',
  privateKey: 'dTHO0iAy78Lv-KI8CwdyblaasRYN9m5kU2iFaF66Nnw'
}

// VAPID Konfiguration
webpush.setVapidDetails(
  'mailto:admin@ablecheck.app',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: messageBody, image, url, adminPassword } = body

    // Admin-Passwort prüfen
    if (adminPassword !== 'push2024admin') {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Validierung der erforderlichen Felder
    if (!title || !messageBody) {
      return NextResponse.json(
        { error: 'Titel und Nachricht sind erforderlich' },
        { status: 400 }
      )
    }

    // Alle Push-Subscriptions aus der Datenbank laden
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (fetchError) {
      console.error('Fehler beim Laden der Subscriptions:', fetchError)
      return NextResponse.json(
        { error: 'Fehler beim Laden der Subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Keine Subscriptions gefunden',
        sentCount: 0
      })
    }

    // Payload für die Push-Nachricht
    const payload = JSON.stringify({
      title,
      body: messageBody,
      image,
      data: {
        url: url || '/',
        timestamp: Date.now()
      }
    })

    // Push-Benachrichtigungen an alle Subscriptions senden
    const sendPromises = subscriptions.map(async (subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      }

      try {
        await webpush.sendNotification(pushSubscription, payload)
        return { success: true, endpoint: subscription.endpoint }
      } catch (error: any) {
        console.error(`Fehler beim Senden an ${subscription.endpoint}:`, error)
        
        // Wenn die Subscription ungültig ist (410 Gone), entferne sie aus der Datenbank
        if (error.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint)
        }
        
        return { success: false, endpoint: subscription.endpoint, error: error.message }
      }
    })

    // Auf alle Sendevorgänge warten
    const results = await Promise.all(sendPromises)
    
    // Erfolgreiche Sendevorgänge zählen
    const successCount = results.filter(result => result.success).length
    const failureCount = results.filter(result => !result.success).length

    console.log(`Push-Benachrichtigungen gesendet: ${successCount} erfolgreich, ${failureCount} fehlgeschlagen`)

    return NextResponse.json({
      success: true,
      message: 'Benachrichtigungen wurden gesendet',
      sentCount: successCount,
      failedCount: failureCount,
      totalSubscriptions: subscriptions.length
    })

  } catch (error) {
    console.error('Fehler in /api/push/send:', error)
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    )
  }
}