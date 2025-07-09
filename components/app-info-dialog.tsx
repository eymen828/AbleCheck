
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
  Info, 
  School, 
  MessageCircle,
  ExternalLink,
  CheckCircle,
  Users,
  Heart
} from "lucide-react"

interface AppInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AppInfoDialog({ open, onOpenChange }: AppInfoDialogProps) {
  const handleWhatsAppClick = () => {
    // WhatsApp-Kanal Link hier einfügen
    window.open("https://whatsapp.com/channel/0029VbB9KEH1Hspy6e949l10", "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Über AbleCheck
          </DialogTitle>
          <DialogDescription>
            Barrierefreiheit für alle zugänglich machen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Projekt-Ursprung */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              Projekt-Ursprung
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              AbleCheck begann als Schulprojekt mit dem Ziel, die Barrierefreiheit von öffentlichen Orten 
              transparenter und zugänglicher zu machen. Was als Lernprojekt startete, entwickelte sich zu 
              einer echten Hilfe für Menschen mit Behinderungen und deren Angehörige.
            </p>
            <Badge variant="outline" className="gap-1">
              <School className="w-3 h-3" />
              Schulprojekt 2024
            </Badge>
          </div>

          {/* Mission */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              Unsere Mission
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Transparenz schaffen</p>
                  <p className="text-sm text-muted-foreground">
                    Ehrliche und detaillierte Bewertungen zur Barrierefreiheit von Orten
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Community aufbauen</p>
                  <p className="text-sm text-muted-foreground">
                    Eine Gemeinschaft, die sich gegenseitig unterstützt und informiert
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Inklusion fördern</p>
                  <p className="text-sm text-muted-foreground">
                    Betreiber dabei helfen, ihre Orte barrierefreier zu gestalten
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-3">Hauptfunktionen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Standard-Bewertungen</h4>
                <p className="text-xs text-muted-foreground">
                  Bewerten Sie Orte nach verschiedenen Barrierefreiheits-Kriterien
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Check-In Bewertungen</h4>
                <p className="text-xs text-muted-foreground">
                  Verifizierte Bewertungen durch Standort-Bestätigung
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Suchfilter</h4>
                <p className="text-xs text-muted-foreground">
                  Finden Sie Orte nach Ihren spezifischen Bedürfnissen
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Community</h4>
                <p className="text-xs text-muted-foreground">
                  Tauschen Sie sich mit anderen Nutzern aus
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Community */}
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              WhatsApp Community
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Treten Sie unserem WhatsApp-Kanal bei für Updates, Tipps und den Austausch 
              mit anderen Mitgliedern der AbleCheck-Community.
            </p>
            <Button 
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              size="sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp-Kanal beitreten
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>

          {/* Entwicklung */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Entwickelt mit ❤️ für eine barrierefreie Welt
            </p>
            <p className="text-xs text-muted-foreground">
              Ein Projekt, das zeigt, wie Technologie zur Inklusion beitragen kann
            </p>
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Verstanden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
