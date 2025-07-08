"use client"

import { useState, useEffect, useCallback } from "react"

interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface GeolocationError {
  code: number
  message: string
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<GeolocationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported("geolocation" in navigator)
  }, [])

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError({ code: 0, message: "Geolocation wird von diesem Browser nicht unterstützt" })
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        })
        setIsLoading(false)
      },
      (err) => {
        setError({
          code: err.code,
          message: getErrorMessage(err.code),
        })
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    )
  }, [isSupported])

  const watchPosition = useCallback((callback: (position: GeolocationPosition) => void) => {
    if (!isSupported) return null

    return navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        }
        setPosition(newPosition)
        callback(newPosition)
      },
      (err) => {
        setError({
          code: err.code,
          message: getErrorMessage(err.code),
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
      }
    )
  }, [isSupported])

  const clearWatch = useCallback((watchId: number) => {
    if (isSupported) {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [isSupported])

  return {
    position,
    error,
    isLoading,
    isSupported,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  }
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return "Standortzugriff wurde verweigert"
    case 2:
      return "Standort nicht verfügbar"
    case 3:
      return "Zeitüberschreitung beim Abrufen des Standorts"
    default:
      return "Unbekannter Fehler beim Abrufen des Standorts"
  }
}

// Hilfsfunktion zur Berechnung der Entfernung zwischen zwei Koordinaten
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Erdradius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000 // Entfernung in Metern
}