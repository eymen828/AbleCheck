import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: 'Ungültige Subscription-Daten' },
        { status: 400 }
      )
    }

    // Subscription in der Datenbank speichern
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      })
      .select()

    if (error) {
      console.error('Fehler beim Speichern der Subscription:', error)
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription erfolgreich gespeichert' 
    })

  } catch (error) {
    console.error('Fehler in /api/push/subscribe:', error)
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    )
  }
}