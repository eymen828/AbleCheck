"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  HelpCircle,
  Loader2
} from "lucide-react"
import { useGeolocation, calculateDistance } from "@/hooks/use-geolocation"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface CheckInTimerProps {
  address: string
  targetLocation?: {
    latitude: number
    longitude: number
  }
  onCheckInComplete: (checkInData: CheckInData) => void
  onCancel: () => void
  onShowHelp: () => void
}

export interface CheckInData {
  duration: number
  startTime: number
  endTime: number
  locationVerified: boolean
  averageDistance: number
  positionChecks: number
}

const REQUIRED_DURATION = 2 * 60 * 1000 // 2 Minuten in Millisekunden
const MAX_DISTANCE = 100 // Maximale Entfernung in Metern
const POSITION_CHECK_INTERVAL = 10000 // Alle 10 Sekunden Position prüfen

export function CheckInTimer({ address, targetLocation, onCheckInComplete, onCancel, onShowHelp }: CheckInTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [locationChecks, setLocationChecks] = useState<number[]>([])
  const [positionChecks, setPositionChecks] = useState(0)
  const [isLocationVerified, setIsLocationVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { position, error: geoError, isLoading, getCurrentPosition, watchPosition, clearWatch } = useGeolocation()
  const { announceAction } = useAccessibilityMode()
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const positionCheckRef = useRef<NodeJS.Timeout | null>(null)

  // Timer aktualisieren
  useEffect(() => {
    if (isRunning && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, startTime])

  // Position überwachen
  useEffect(() => {
    if (isRunning && targetLocation) {
      // Sofort Position prüfen
      getCurrentPosition()
      
      // Position kontinuierlich überwachen
      const watchId = watchPosition((newPosition) => {
        checkLocationProximity(newPosition)
      })
      
      if (watchId) {
        watchIdRef.current = watchId
      }

      // Regelmäßige Position-Checks
      positionCheckRef.current = setInterval(() => {
        getCurrentPosition()
      }, POSITION_CHECK_INTERVAL)
    }

    return () => {
      if (watchIdRef.current) {
        clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (positionCheckRef.current) {
        clearInterval(positionCheckRef.current)
        positionCheckRef.current = null
      }
    }
  }, [isRunning, targetLocation, getCurrentPosition, watchPosition, clearWatch])

  // Position prüfen wenn neue Position verfügbar
  useEffect(() => {
    if (position && targetLocation && isRunning) {
      checkLocationProximity(position)
    }
  }, [position, targetLocation, isRunning])

  const checkLocationProximity = (currentPosition: any) => {
    if (!targetLocation) return

    const distance = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    )

    setLocationChecks(prev => [...prev, distance])
    setPositionChecks(prev => prev + 1)

    // Standort als verifiziert markieren wenn innerhalb der erlaubten Entfernung
    if (distance <= MAX_DISTANCE) {
      setIsLocationVerified(true)
    }
  }

  const startTimer = () => {
    // Prüfe zunächst die aktuelle Position
    if (!position && !isLoading) {
      getCurrentPosition()
    }
    
    // Validiere Standort vor dem Start
    if (targetLocation && position) {
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      )
      
      if (distance > MAX_DISTANCE) {
        setError("Sie sind zu weit vom Zielort entfernt (>" + MAX_DISTANCE + "m). Bitte begeben Sie sich näher zum angegebenen Ort.")
        return
      }
    }

    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setElapsedTime(0)
    setLocationChecks([])
    setPositionChecks(0)
    setIsLocationVerified(false)
    announceAction("Check-In Timer gestartet")
  }

  const pauseTimer = () => {
    setIsRunning(false)
    announceAction("Check-In Timer pausiert")
  }

  const resetTimer = () => {
    setIsRunning(false)
    setStartTime(null)
    setElapsedTime(0)
    setLocationChecks([])
    setPositionChecks(0)
    setIsLocationVerified(false)
    announceAction("Check-In Timer zurückgesetzt")
  }

  const completeCheckIn = () => {
    if (!startTime) return

    const averageDistance = locationChecks.length > 0 
      ? locationChecks.reduce((sum, dist) => sum + dist, 0) / locationChecks.length 
      : 0

    const checkInData: CheckInData = {
      duration: elapsedTime,
      startTime,
      endTime: Date.now(),
      locationVerified: isLocationVerified,
      averageDistance,
      positionChecks,
    }

    onCheckInComplete(checkInData)
    announceAction("Check-In erfolgreich abgeschlossen")
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = Math.min((elapsedTime / REQUIRED_DURATION) * 100, 100)
  const isComplete = elapsedTime >= REQUIRED_DURATION && isLocationVerified
  const remainingTime = Math.max(REQUIRED_DURATION - elapsedTime, 0)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Check-In Timer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onShowHelp}>
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Bleiben Sie mindestens 2 Minuten am angegebenen Ort für eine verifizierte Bewertung
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Adresse Anzeige */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Check-In Adresse:</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{address}</p>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-2">
            {formatTime(elapsedTime)}
          </div>
          <Progress value={progress} className="h-3" />
          <div className="text-sm text-muted-foreground mt-2">
            {isComplete ? "Bereit für Check-In!" : `Noch ${formatTime(remainingTime)} verbleibend`}
          </div>
        </div>

        {/* Location Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Standort-Status:</span>
            <Badge variant={isLocationVerified ? "default" : "destructive"}>
              <MapPin className="w-3 h-3 mr-1" />
              {isLocationVerified ? "Verifiziert (≤100m)" : "Zu weit entfernt (>100m)"}
            </Badge>
          </div>
          
          {(error || geoError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || geoError?.message}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Standort wird ermittelt...
            </div>
          )}

          {positionChecks > 0 && (
            <div className="text-xs text-muted-foreground">
              Position geprüft: {positionChecks} mal
              {locationChecks.length > 0 && (
                <span className="ml-2">
                  Ø Entfernung: {Math.round(locationChecks.reduce((sum, dist) => sum + dist, 0) / locationChecks.length)}m (max. 100m)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button 
              onClick={startTimer} 
              className="flex-1" 
              disabled={!targetLocation || isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              {startTime ? "Fortsetzen" : "Starten"}
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pausieren
            </Button>
          )}
          
          <Button onClick={resetTimer} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Complete Button */}
        {isComplete && (
          <Button onClick={completeCheckIn} className="w-full" size="lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            Check-In Bewertung abgeben
          </Button>
        )}

        {/* Cancel Button */}
        <Button onClick={onCancel} variant="ghost" className="w-full">
          Abbrechen
        </Button>
      </CardContent>
    </Card>
  )
}