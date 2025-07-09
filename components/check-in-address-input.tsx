"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { 
  MapPin, 
  Shield, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  CheckCircle
} from "lucide-react"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface CheckInAddressInputProps {
  onAddressConfirmed: (address: string, coordinates?: { latitude: number; longitude: number }) => void
  onCancel: () => void
  onShowHelp: () => void
}

interface AddressSuggestion {
  id: string
  display_name: string
  lat: number
  lon: number
  address: {
    house_number?: string
    road?: string
    city?: string
    postcode?: string
    country?: string
  }
}

export function CheckInAddressInput({ onAddressConfirmed, onCancel, onShowHelp }: CheckInAddressInputProps) {
  const [address, setAddress] = useState("")
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isAddressValid, setIsAddressValid] = useState(false)
  
  const { announceAction, announceFormField } = useAccessibilityMode()

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddress(suggestion.display_name)
    setSelectedCoordinates({
      latitude: suggestion.lat,
      longitude: suggestion.lon
    })
    setIsAddressValid(true)
    announceFormField("Adresse", "Auswahl", `${suggestion.display_name} ausgewählt`)
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    if (value !== address) {
      setSelectedCoordinates(null)
      setIsAddressValid(false)
    }
    announceFormField("Adresse", "Eingabefeld", value ? "Adresse eingegeben" : "Leer")
  }

  const handleConfirm = () => {
    if (!address.trim()) {
      announceAction("Bitte geben Sie eine Adresse ein")
      return
    }

    onAddressConfirmed(address, selectedCoordinates || undefined)
    announceAction("Adresse bestätigt, Check-In wird gestartet")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Check-In Adresse
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onShowHelp}>
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          Geben Sie die Adresse des Ortes ein, den Sie bewerten möchten
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info Box */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">So funktioniert Check-In:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. Geben Sie die Adresse des Ortes ein</p>
                <p>2. Begeben Sie sich zum angegebenen Ort</p>
                <p>3. Starten Sie den 2-Minuten Timer vor Ort</p>
                <p>4. Geben Sie Ihre verifizierte Bewertung ab</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Adresseingabe */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Adresse des Ortes *
            </label>
            <AddressAutocomplete
              value={address}
              onChange={handleAddressChange}
              onSelect={handleAddressSelect}
              placeholder="z.B. Musterstraße 123, Berlin"
              className="w-full"
            />
          </div>

          {/* Adress-Status */}
          {address && (
            <div className="flex items-center gap-2 text-sm">
              {isAddressValid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Adresse gefunden und bestätigt</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-600">Bitte wählen Sie eine Adresse aus den Vorschlägen</span>
                </>
              )}
            </div>
          )}

          {/* Koordinaten Info */}
          {selectedCoordinates && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <p>Koordinaten: {selectedCoordinates.latitude.toFixed(6)}, {selectedCoordinates.longitude.toFixed(6)}</p>
            </div>
          )}
        </div>

        {/* Wichtige Hinweise */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Wichtige Hinweise
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Geben Sie die genaue Adresse des Ortes ein</li>
            <li>• Sie müssen sich physisch zum Ort begeben</li>
            <li>• Der Timer startet erst, wenn Sie vor Ort sind</li>
            <li>• GPS wird zur Standort-Verifikation verwendet</li>
          </ul>
        </div>

        {/* Vorteile von Check-In */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Vorteile Ihrer Check-In Bewertung:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-green-600" />
              <span>Höhere Glaubwürdigkeit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Spezielle "Check-In" Kennzeichnung</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-1 py-0">
                Verifiziert
              </Badge>
              <li>• Sie müssen maximal 100 Meter vom Ort entfernt sein</li>
              <li>• GPS wird zur genauen Standort-Verifikation verwendet</li>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleConfirm} 
            className="w-full" 
            size="lg"
            disabled={!address.trim()}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Zum Check-In Timer
          </Button>

          <Button onClick={onCancel} variant="ghost" className="w-full">
            Abbrechen
          </Button>
        </div>

        {/* Datenschutz Hinweis */}
        <div className="text-xs text-muted-foreground text-center">
          <p>
            Ihre Standortdaten werden nur zur Verifikation verwendet und nicht gespeichert.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}