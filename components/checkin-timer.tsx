"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Timer, MapPin, CheckCircle, ArrowLeft, HelpCircle, X, AlertTriangle, Loader2 } from "lucide-react"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface CheckInTimerProps {
  placeName: string
  onTimerComplete: () => void
  onBack: () => void
  onShowHelp: () => void
  isFirstTime?: boolean
}

interface Location {
  latitude: number
  longitude: number
  accuracy: number
}

export function CheckInTimer({ placeName, onTimerComplete, onBack, onShowHelp, isFirstTime = false }: CheckInTimerProps) {
  const { handleAccessibleClick, announceAction } = useAccessibilityMode()
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [initialLocation, setInitialLocation] = useState<Location | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [hasMovedTooFar, setHasMovedTooFar] = useState(false)
  const [showFirstTimeInfo, setShowFirstTimeInfo] = useState(isFirstTime)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const watchRef = useRef<number | null>(null)

  const REQUIRED_TIME = 120 // 2 minutes in seconds
  const MAX_DISTANCE = 100 // Maximum allowed distance in meters

  // Calculate distance between two GPS coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  // Get user's current location
  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation wird von diesem Browser nicht unterstützt"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          let errorMessage = "Standort konnte nicht ermittelt werden"
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Standortinformationen sind nicht verfügbar"
              break
            case error.TIMEOUT:
              errorMessage = "Zeitüberschreitung beim Ermitteln des Standorts"
              break
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  // Start location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) return

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(newLocation)

        // Check if user has moved too far from initial location
        if (initialLocation) {
          const distance = calculateDistance(
            initialLocation.latitude,
            initialLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
          )
          
          if (distance > MAX_DISTANCE) {
            setHasMovedTooFar(true)
            stopTimer()
            announceAction("Sie haben sich zu weit vom ursprünglichen Standort entfernt. Timer wurde gestoppt.")
          }
        }
      },
      (error) => {
        console.error("Location tracking error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000
      }
    )
  }

  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
  }

  // Start timer
  const startTimer = async () => {
    setIsGettingLocation(true)
    setLocationError(null)
    setHasMovedTooFar(false)

    try {
      const location = await getCurrentLocation()
      setInitialLocation(location)
      setCurrentLocation(location)
      setIsActive(true)
      startLocationTracking()
      announceAction("Check-In Timer gestartet. GPS-Position wird überwacht.")
    } catch (error) {
      setLocationError((error as Error).message)
      announceAction(`Fehler beim Starten: ${(error as Error).message}`)
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Stop timer
  const stopTimer = () => {
    setIsActive(false)
    stopLocationTracking()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Reset timer
  const resetTimer = () => {
    stopTimer()
    setSeconds(0)
    setHasMovedTooFar(false)
    announceAction("Timer wurde zurückgesetzt")
  }

  // Timer effect
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1
          if (newSeconds === REQUIRED_TIME) {
            announceAction("Mindestzeit erreicht! Check-In-Bewertung kann jetzt abgegeben werden.")
          }
          return newSeconds
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, announceAction])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      stopLocationTracking()
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isTimerComplete = seconds >= REQUIRED_TIME && !hasMovedTooFar
  const progressPercentage = Math.min((seconds / REQUIRED_TIME) * 100, 100)

  if (showFirstTimeInfo) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAccessibleClick(e.currentTarget, onBack, "Zurück zur Bewertungsauswahl")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-600" />
              <h1 className="text-lg font-bold">Check-In-Bewertung</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Timer className="w-6 h-6 text-orange-600" />
                Was ist eine Check-In-Bewertung?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Check-In-Bewertungen sind besonders vertrauenswürdige Bewertungen, die direkt vor Ort abgegeben werden.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <Timer className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Mindestzeit vor Ort</h4>
                    <p className="text-xs text-muted-foreground">
                      Sie müssen mindestens 2 Minuten vor Ort verbringen, um eine fundierte Bewertung abgeben zu können.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">GPS-Verifikation</h4>
                    <p className="text-xs text-muted-foreground">
                      Ihr Standort wird kontinuierlich überprüft, um sicherzustellen, dass Sie wirklich vor Ort sind.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm">Vertrauenswürdig</h4>
                    <p className="text-xs text-muted-foreground">
                      Check-In-Bewertungen werden mit einem besonderen Badge markiert und gelten als besonders glaubwürdig.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Wichtig:</strong> Bleiben Sie während der gesamten Zeit in der Nähe des Ortes. 
                  Wenn Sie sich mehr als 100 Meter entfernen, wird der Timer automatisch gestoppt.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={(e) => handleAccessibleClick(e.currentTarget, () => setShowFirstTimeInfo(false), "Check-In starten")}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Timer className="w-5 h-5" />
                  Check-In starten
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => handleAccessibleClick(e.currentTarget, onBack, "Zurück zur Auswahl")}
                  className="w-full"
                >
                  Zurück zur Auswahl
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleAccessibleClick(e.currentTarget, onBack, "Zurück zur Bewertungsauswahl")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Timer className="w-5 h-5 text-orange-600" />
            <h1 className="text-lg font-bold">Check-In Timer</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleAccessibleClick(e.currentTarget, onShowHelp, "Hilfe anzeigen")}
            className="p-2"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Place Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {placeName}
            </CardTitle>
            <CardDescription>Check-In-Bewertung läuft...</CardDescription>
          </CardHeader>
        </Card>

        {/* Timer Display */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-mono font-bold text-orange-600">
                {formatTime(seconds)}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isTimerComplete ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isTimerComplete 
                    ? "✅ Mindestzeit erreicht!" 
                    : `Noch ${REQUIRED_TIME - seconds} Sekunden bis zur Mindestzeit`
                  }
                </p>
                
                {currentLocation && (
                  <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    GPS-Position verifiziert
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {locationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {hasMovedTooFar && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sie haben sich zu weit vom ursprünglichen Standort entfernt. Der Timer wurde gestoppt.
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          {!isActive && !isTimerComplete && (
            <Button
              onClick={(e) => handleAccessibleClick(e.currentTarget, startTimer, "Timer starten")}
              disabled={isGettingLocation}
              className="w-full gap-2"
              size="lg"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  GPS-Position wird ermittelt...
                </>
              ) : (
                <>
                  <Timer className="w-5 h-5" />
                  Timer starten
                </>
              )}
            </Button>
          )}

          {isActive && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={(e) => handleAccessibleClick(e.currentTarget, stopTimer, "Timer pausieren")}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Pausieren
              </Button>
              <Button
                variant="outline"
                onClick={(e) => handleAccessibleClick(e.currentTarget, resetTimer, "Timer zurücksetzen")}
                className="gap-2"
              >
                Reset
              </Button>
            </div>
          )}

          {isTimerComplete && (
            <Button
              onClick={(e) => handleAccessibleClick(e.currentTarget, onTimerComplete, "Zur Bewertung fortfahren")}
              className="w-full gap-2"
              size="lg"
            >
              <CheckCircle className="w-5 h-5" />
              Bewertung fortsetzen
            </Button>
          )}
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Standort-Überwachung aktiv
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Bleiben Sie in einem Umkreis von 100 Metern um Ihren Startpunkt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}