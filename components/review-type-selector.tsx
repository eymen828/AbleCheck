"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  MapPin, 
  Clock, 
  Shield,
  CheckCircle,
  Edit3
} from "lucide-react"

interface ReviewTypeSelectorProps {
  onSelectStandard: () => void
  onSelectCheckIn: () => void
  onCancel: () => void
}

export function ReviewTypeSelector({ onSelectStandard, onSelectCheckIn, onCancel }: ReviewTypeSelectorProps) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Bewertungsart wählen</h2>
        <p className="text-muted-foreground">
          Wählen Sie, wie Sie Ihre Bewertung abgeben möchten
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Standard Bewertung */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelectStandard}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Standard-Bewertung
            </CardTitle>
            <CardDescription>
              Schnelle und einfache Bewertung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Sofort verfügbar</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-green-500" />
                <span>Keine Wartezeit</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>Kein Standort erforderlich</span>
              </div>
            </div>
            
            <Button className="w-full" onClick={onSelectStandard}>
              Standard-Bewertung wählen
            </Button>
          </CardContent>
        </Card>

        {/* Check-In Bewertung */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 dark:border-blue-800" onClick={onSelectCheckIn}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Check-In Bewertung
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verifiziert
              </Badge>
            </CardTitle>
            <CardDescription>
              Standort-verifizierte Bewertung mit höherer Glaubwürdigkeit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Standort-Verifikation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>2 Minuten vor Ort</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Höhere Glaubwürdigkeit</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 Check-In Bewertungen werden mit einem speziellen Badge markiert und haben höhere Priorität in der Anzeige.
              </p>
            </div>
            
            <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50" onClick={onSelectCheckIn}>
              Check-In Bewertung starten
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </div>
  )
}