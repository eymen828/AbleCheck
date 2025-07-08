"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Timer, ArrowLeft, Info } from "lucide-react"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface RatingTypeSelectionProps {
  onSelectStandard: () => void
  onSelectCheckIn: () => void
  onBack: () => void
}

export function RatingTypeSelection({ onSelectStandard, onSelectCheckIn, onBack }: RatingTypeSelectionProps) {
  const { handleAccessibleClick } = useAccessibilityMode()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleAccessibleClick(e.currentTarget, onBack, "Zurück zur Ortsliste")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold">Bewertungstyp wählen</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-xl font-semibold">Wie möchten Sie bewerten?</h2>
          <p className="text-muted-foreground text-sm">
            Wählen Sie zwischen einer Standard-Bewertung oder einer verifizierten Check-In-Bewertung
          </p>
        </div>

        {/* Standard Review Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader
            onClick={(e) => handleAccessibleClick(e.currentTarget, onSelectStandard, "Standard-Bewertung auswählen")}
            className="pb-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Standard-Bewertung</CardTitle>
                  <CardDescription className="text-sm">
                    Normale Bewertung basierend auf Ihren Erfahrungen
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent 
            onClick={(e) => handleAccessibleClick(e.currentTarget, onSelectStandard, "Standard-Bewertung auswählen")}
            className="pt-0"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  ⚡ Schnell
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  📝 Flexibel
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Bewerten Sie einen Ort basierend auf Ihren Erinnerungen oder Erfahrungen. Keine Zeit- oder Standortbeschränkungen.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Keine Mindestzeit erforderlich</li>
                <li>• Bewertung von überall möglich</li>
                <li>• Basierend auf Ihren Erfahrungen</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Check-In Review Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 dark:border-orange-800">
          <CardHeader
            onClick={(e) => handleAccessibleClick(e.currentTarget, onSelectCheckIn, "Check-In-Bewertung auswählen")}
            className="pb-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Timer className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Check-In-Bewertung
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                      Verifiziert
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Verifizierte Bewertung direkt vor Ort mit Zeitnachweis
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent 
            onClick={(e) => handleAccessibleClick(e.currentTarget, onSelectCheckIn, "Check-In-Bewertung auswählen")}
            className="pt-0"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                  📍 GPS-verifiziert
                </Badge>
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                  ⏱️ 2+ Min vor Ort
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Bewerten Sie direkt vor Ort. Ihre Position und Verweildauer werden automatisch verifiziert.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Mindestens 2 Minuten vor Ort erforderlich</li>
                <li>• GPS-Standortverifikation</li>
                <li>• Höhere Glaubwürdigkeit</li>
                <li>• Besonders vertrauenswürdige Bewertung</li>
              </ul>
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-orange-600">
                  Check-In-Bewertungen werden mit einem speziellen Badge markiert und als besonders vertrauenswürdig eingestuft.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}