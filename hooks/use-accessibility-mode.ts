"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface AccessibilitySettings {
  isBlindModeEnabled: boolean
  speechRate: number
  speechVolume: number
  doubleClickDelay: number
  announceOnHover: boolean
}

export function useAccessibilityMode() {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>("ablecheck-accessibility-settings", {
    isBlindModeEnabled: false,
    speechRate: 1,
    speechVolume: 0.8,
    doubleClickDelay: 500,
    announceOnHover: false,
  })

  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastClickTimeRef = useRef<number>(0)
  const lastClickElementRef = useRef<HTMLElement | null>(null)

  // Prüfe Browser-Unterstützung und initialisiere
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "speechSynthesis" in window
      setIsSupported(supported)
      setIsInitialized(true)

      if (supported && settings.isBlindModeEnabled) {
        // Teste die Sprachsynthese beim ersten Laden
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length === 0) {
            // Warte auf Stimmen-Loading
            const handleVoicesChanged = () => {
              window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged)
            }
            window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged)
          }
        }, 100)
      }
    }
  }, [settings.isBlindModeEnabled])

  const updateSettings = useCallback(
    (updates: Partial<AccessibilitySettings>) => {
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)

      // Ankündigung bei Aktivierung/Deaktivierung
      if (updates.isBlindModeEnabled !== undefined) {
        setTimeout(() => {
          if (updates.isBlindModeEnabled) {
            speak(
              "Blindenmodus aktiviert. Klicken Sie einmal um Beschreibungen zu hören, zweimal um Aktionen auszuführen.",
              true,
            )
          } else {
            speak("Blindenmodus deaktiviert", true)
          }
        }, 100)
      }
    },
    [settings, setSettings],
  )

  const speak = useCallback(
    (text: string, interrupt = false) => {
      if (!isInitialized || !isSupported || !settings.isBlindModeEnabled || !text.trim()) {
        return
      }

      try {
        if (interrupt) {
          window.speechSynthesis.cancel()
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = settings.speechRate
        utterance.volume = settings.speechVolume
        utterance.lang = "de-DE"

        // Versuche eine deutsche Stimme zu finden
        const voices = window.speechSynthesis.getVoices()
        const germanVoice = voices.find(
          (voice) => voice.lang.startsWith("de") || voice.name.toLowerCase().includes("german"),
        )
        if (germanVoice) {
          utterance.voice = germanVoice
        }

        utterance.onstart = () => {
          setIsSpeaking(true)
        }

        utterance.onend = () => {
          setIsSpeaking(false)
        }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event)
          setIsSpeaking(false)
        }

        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Error in speak function:", error)
        setIsSpeaking(false)
      }
    },
    [isInitialized, isSupported, settings],
  )

  const stopSpeaking = useCallback(() => {
    if (isSupported && typeof window !== "undefined") {
      try {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } catch (error) {
        console.error("Error stopping speech:", error)
      }
    }
  }, [isSupported])

  const handleAccessibleClick = useCallback(
    (element: HTMLElement, onClick: () => void, description?: string) => {
      if (!settings.isBlindModeEnabled) {
        onClick()
        return
      }

      const now = Date.now()
      const timeSinceLastClick = now - lastClickTimeRef.current
      const isSameElement = lastClickElementRef.current === element

      // Erste Klick oder anderes Element - Beschreibung vorlesen
      if (!isSameElement || timeSinceLastClick > settings.doubleClickDelay) {
        const textToSpeak =
          description ||
          element.getAttribute("aria-label") ||
          element.textContent?.trim() ||
          element.getAttribute("title") ||
          element.getAttribute("alt") ||
          "Unbekanntes Element"

        speak(textToSpeak.substring(0, 200), true) // Begrenze auf 200 Zeichen
        lastClickTimeRef.current = now
        lastClickElementRef.current = element

        // Timeout für zweiten Klick
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }

        clickTimeoutRef.current = setTimeout(() => {
          lastClickTimeRef.current = 0
          lastClickElementRef.current = null
        }, settings.doubleClickDelay)
      } else {
        // Zweiter Klick auf gleiches Element - Aktion ausführen
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }
        lastClickTimeRef.current = 0
        lastClickElementRef.current = null
        speak("Ausgewählt", true)

        // Kleine Verzögerung damit "Ausgewählt" noch gehört wird
        setTimeout(() => {
          onClick()
        }, 200)
      }
    },
    [settings, speak],
  )

  const handleAccessibleHover = useCallback(
    (element: HTMLElement, description?: string) => {
      if (!settings.isBlindModeEnabled || !settings.announceOnHover) return

      const textToSpeak = description || element.getAttribute("aria-label") || element.textContent?.trim() || "Element"

      speak(textToSpeak.substring(0, 100), true) // Kurze Hover-Ansagen
    },
    [settings, speak],
  )

  const announcePageChange = useCallback(
    (pageName: string) => {
      if (settings.isBlindModeEnabled && isInitialized) {
        // Kurze Verzögerung für Seitenübergänge
        setTimeout(() => {
          speak(`Seite gewechselt zu ${pageName}`, true)
        }, 300)
      }
    },
    [settings, speak, isInitialized],
  )

  const announceFormField = useCallback(
    (fieldName: string, fieldType: string, value?: string) => {
      if (settings.isBlindModeEnabled && isInitialized) {
        let announcement = `${fieldType} ${fieldName}`
        if (value && value.trim()) {
          announcement += `, Wert: ${value.substring(0, 50)}`
        }
        speak(announcement, true)
      }
    },
    [settings, speak, isInitialized],
  )

  const announceAction = useCallback(
    (action: string) => {
      if (settings.isBlindModeEnabled && isInitialized) {
        speak(action, true)
      }
    },
    [settings, speak, isInitialized],
  )

  return {
    settings,
    updateSettings,
    isSupported,
    isSpeaking,
    isInitialized,
    speak,
    stopSpeaking,
    handleAccessibleClick,
    handleAccessibleHover,
    announcePageChange,
    announceFormField,
    announceAction,
  }
}
