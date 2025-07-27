import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint ist erforderlich' },
        { status: 400 }
      )
    }

    // Subscription aus der Datenbank entfernen
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Fehler beim Entfernen der Subscription:', error)
      return NextResponse.json(
        { error: 'Fehler beim Entfernen der Subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription erfolgreich entfernt' 
    })

  } catch (error) {
    console.error('Fehler in /api/push/unsubscribe:', error)
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    )
  }
}