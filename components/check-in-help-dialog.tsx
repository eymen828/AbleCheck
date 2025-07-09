"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  Shield, 
  Star,
  AlertTriangle
} from "lucide-react"

interface CheckInHelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckInHelpDialog({ open, onOpenChange }: CheckInHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Check-In Bewertungen
          </DialogTitle>
          <DialogDescription>
            Verifizierte Bewertungen durch Standort-Bestätigung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Was sind Check-In Bewertungen */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Was sind Check-In Bewertungen?
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Check-In Bewertungen sind verifizierte Bewertungen, die bestätigen, dass Sie tatsächlich vor Ort waren. 
              Diese Bewertungen erhalten eine spezielle <Badge variant="outline" className="mx-1">Check-In</Badge> Kennzeichnung 
              und haben höhere Glaubwürdigkeit.
            </p>
          </div>

          {/* Wie funktioniert es */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              So funktioniert's
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">Adresse eingeben</p>
                  <p className="text-sm text-muted-foreground">Geben Sie die genaue Adresse des Ortes ein</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">Zum Ort begeben</p>
                  <p className="text-sm text-muted-foreground">Gehen Sie physisch zu der angegebenen Adresse</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium">Timer starten</p>
                  <p className="text-sm text-muted-foreground">Starten Sie den 2-Minuten Timer vor Ort</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p className="font-medium">Am Ort bleiben</p>
                  <p className="text-sm text-muted-foreground">Bleiben Sie mindestens 2 Minuten vor Ort (maximal 100 Meter Entfernung)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold">5</div>
                <div>
                  <p className="font-medium">Bewertung abgeben</p>
                  <p className="text-sm text-muted-foreground">Nach erfolgreicher Verifikation können Sie Ihre Check-In Bewertung abgeben</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vorteile */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              Vorteile von Check-In Bewertungen
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Höhere Glaubwürdigkeit durch Standort-Verifikation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Spezielle "Check-In" Kennzeichnung in der Bewertung</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Bessere Sichtbarkeit in den Bewertungen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Hilft anderen Nutzern bei der Entscheidung</span>
              </li>
            </ul>
          </div>

          {/* Datenschutz */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Datenschutz & Sicherheit
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Ihr genauer Standort wird nicht gespeichert</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Nur die Verifikation wird dokumentiert</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Standort-Zugriff nur während des Check-Ins</span>
              </li>
            </ul>
          </div>

          {/* Wichtige Hinweise */}
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              Wichtige Hinweise
            </h3>
            <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>• Geben Sie die korrekte Adresse des Ortes ein</li>
              <li>• Sie müssen sich physisch zum Ort begeben</li>
              <li>• GPS-Signal kann in Gebäuden schwächer sein</li>
              <li>• Stellen Sie sicher, dass Standort-Services aktiviert sind</li>
              <li>• Bei Problemen können Sie zur Standard-Bewertung wechseln</li>
              <li>• Check-In Bewertungen können nicht nachträglich erstellt werden</li>
            </ul>
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Verstanden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}