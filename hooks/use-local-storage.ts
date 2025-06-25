"use client"

import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State für den Wert
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Nur im Browser localStorage verwenden
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Funktion zum Setzen des Werts
  const setValue = (value: T) => {
    try {
      setStoredValue(value)

      // Nur im Browser localStorage verwenden
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
