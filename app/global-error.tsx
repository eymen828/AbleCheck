"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, RefreshCw, AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">AbleCheck</h1>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <CardTitle className="text-xl">Etwas ist schiefgelaufen</CardTitle>
              </div>
              <CardDescription>Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={reset} className="gap-2 w-full">
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
                Zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
