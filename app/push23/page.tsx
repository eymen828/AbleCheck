"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Users, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  Lock
} from 'lucide-react'

export default function PushNotificationAdmin() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [actionUrl, setActionUrl] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const authenticate = () => {
    // Einfaches Passwort-System - In Produktion sollte das sicherer sein
    if (password === 'push2024admin') {
      setIsAuthenticated(true)
      setResult(null)
    } else {
      setResult({ success: false, message: 'Falsches Passwort!' })
    }
  }

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      setResult({ success: false, message: 'Titel und Nachricht sind erforderlich!' })
      return
    }

    setIsSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          body: message.trim(),
          image: imageUrl.trim() || undefined,
          url: actionUrl.trim() || undefined,
          adminPassword: password // Zusätzliche Sicherheit
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Benachrichtigung erfolgreich gesendet!`, 
          count: data.sentCount 
        })
        // Formulardaten zurücksetzen
        setTitle('')
        setMessage('')
        setImageUrl('')
        setActionUrl('')
      } else {
        setResult({ success: false, message: data.error || 'Fehler beim Senden' })
      }

    } catch (error) {
      console.error('Fehler beim Senden:', error)
      setResult({ success: false, message: 'Netzwerkfehler beim Senden der Benachrichtigung' })
    } finally {
      setIsSending(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Admin-Bereich</CardTitle>
            <CardDescription>
              Geben Sie das Passwort ein, um Push-Benachrichtigungen zu senden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                placeholder="Admin-Passwort eingeben"
              />
            </div>
            
            {result && !result.success && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <Button onClick={authenticate} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            Push-Benachrichtigungen
          </h1>
          <p className="text-muted-foreground">
            Senden Sie Benachrichtigungen an alle AbleCheck-Nutzer
          </p>
          <Badge variant="secondary" className="mt-2">
            <Users className="w-3 h-3 mr-1" />
            Admin-Panel
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Neue Benachrichtigung senden
            </CardTitle>
            <CardDescription>
              Füllen Sie die Felder aus, um eine Push-Benachrichtigung an alle registrierten Nutzer zu senden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Neue Features verfügbar!"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {title.length}/50 Zeichen
                </p>
              </div>

              <div>
                <Label htmlFor="message">Nachricht *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="z.B. Entdecken Sie die neuen Barrierefreiheit-Features in der AbleCheck App..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/200 Zeichen
                </p>
              </div>

              <div>
                <Label htmlFor="imageUrl">Bild-URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL zu einem Bild, das in der Benachrichtigung angezeigt wird
                </p>
              </div>

              <div>
                <Label htmlFor="actionUrl">Ziel-URL (optional)</Label>
                <Input
                  id="actionUrl"
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://ablecheck.app/new-feature"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL, die beim Klicken auf die Benachrichtigung geöffnet wird
                </p>
              </div>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {result.message}
                  {result.success && result.count !== undefined && (
                    <span className="block mt-1 font-medium">
                      An {result.count} Nutzer gesendet
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={sendNotification}
                disabled={isSending || !title.trim() || !message.trim()}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sendet...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Benachrichtigung senden
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setIsAuthenticated(false)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>⚠️ Hinweis:</strong> Diese Benachrichtigung wird an alle registrierten 
              AbleCheck-Nutzer gesendet. Verwenden Sie diese Funktion verantwortungsbewusst.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}