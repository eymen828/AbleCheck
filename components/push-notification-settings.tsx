"use client"

import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useLanguage } from "@/lib/language-context"

export function PushNotificationSettings() {
  const { t } = useLanguage()
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe
  } = usePushNotifications()

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 opacity-50">
        <BellOff className="w-4 h-4" />
        <span className="text-sm">Push-Benachrichtigungen nicht unterstützt</span>
      </div>
    )
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await subscribe()
    } else {
      await unsubscribe()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <Label htmlFor="push-notifications" className="text-sm font-medium">
            Push-Benachrichtigungen
          </Label>
        </div>
        <Switch
          id="push-notifications"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Erhalten Sie Benachrichtigungen über neue Features und wichtige Updates
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <p className="text-xs text-muted-foreground">
          Wird verarbeitet...
        </p>
      )}
    </div>
  )
}