"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Star, 
  Plus,
  Search,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import type { PlaceRating } from "@/lib/supabase"

interface PlaceSelectorProps {
  places: PlaceRating[]
  onCancel: () => void
  onCreateNew: (name: string, address: string) => void
}

export function PlaceSelector({ places, onCancel, onCreateNew }: PlaceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newPlaceName, setNewPlaceName] = useState("")
  const [newPlaceAddress, setNewPlaceAddress] = useState("")

  const filteredPlaces = places.filter(place => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (place.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  const handleCreateNew = () => {
    if (newPlaceName.trim() && newPlaceAddress.trim()) {
      onCreateNew(newPlaceName.trim(), newPlaceAddress.trim())
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ort für Bewertung auswählen</CardTitle>
        <CardDescription>
          Wählen Sie einen bestehenden Ort aus oder erstellen Sie einen neuen
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!showCreateNew ? (
          <>
            {/* Suche */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Orten suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Orte Liste */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p>Keine Orte gefunden</p>
                </div>
              ) : (
                filteredPlaces.map((place) => (
                  <Card key={place.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{place.name}</h3>
                          {place.address && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {place.address}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {place.avg_overall_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-sm">{place.avg_overall_rating.toFixed(1)}</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {place.review_count} Bewertungen
                            </span>
                            {place.checkin_review_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {place.checkin_review_count} Check-Ins
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/place/${place.id}?review=true`}>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Neuen Ort erstellen Button */}
            <Button 
              onClick={() => setShowCreateNew(true)} 
              variant="outline" 
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Neuen Ort hinzufügen
            </Button>
          </>
        ) : (
          /* Neuen Ort erstellen */
          <div className="space-y-4">
            <div>
              <Label htmlFor="place-name">Name des Ortes *</Label>
              <Input
                id="place-name"
                placeholder="z.B. Café Beispiel"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="place-address">Adresse *</Label>
              <Input
                id="place-address"
                placeholder="z.B. Musterstraße 123, Berlin"
                value={newPlaceAddress}
                onChange={(e) => setNewPlaceAddress(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleCreateNew}
                disabled={!newPlaceName.trim() || !newPlaceAddress.trim()}
                className="flex-1"
              >
                Ort erstellen und bewerten
              </Button>
              <Button 
                onClick={() => setShowCreateNew(false)} 
                variant="outline"
              >
                Zurück
              </Button>
            </div>
          </div>
        )}

        {/* Abbrechen Button */}
        <Button onClick={onCancel} variant="ghost" className="w-full">
          Abbrechen
        </Button>
      </CardContent>
    </Card>
  )
}