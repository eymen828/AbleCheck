"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  CheckCircle, 
  MapPin, 
  Star, 
  Filter, 
  Plus, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  X,
  Eye,
  VolumeX,
  Accessibility,
  Smartphone,
  Heart
} from "lucide-react"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface OnboardingProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
  tips?: string[]
}

export function Onboarding({ isOpen, onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { handleAccessibleClick, announceAction } = useAccessibilityMode()

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Willkommen bei AbleCheck! 🎉",
      description: "Ihre App für barrierefreie Orte",
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-bold mb-2">AbleCheck</h3>
            <p className="text-muted-foreground">
              Bewerten Sie Orte auf ihre Barrierefreiheit und helfen Sie anderen Menschen mit Behinderungen, 
              zugängliche Plätze zu finden.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Was macht AbleCheck besonders?</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Bewertungen von echten Nutzern</li>
              <li>✅ Fokus auf Barrierefreiheit</li>
              <li>✅ Kategorien für bessere Suche</li>
              <li>✅ Vollständig barrierefrei bedienbar</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "rate-places",
      title: "Orte bewerten",
      description: "Teilen Sie Ihre Erfahrungen mit anderen",
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              So bewerten Sie einen Ort:
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Ort-Details eingeben</p>
                  <p className="text-sm text-muted-foreground">Name, Adresse und Kategorien auswählen</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Barrierefreiheit bewerten</p>
                  <p className="text-sm text-muted-foreground">5 wichtige Bereiche mit Sternen bewerten</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Kommentare & Fotos hinzufügen</p>
                  <p className="text-sm text-muted-foreground">Optional: Details und Bilder ergänzen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      tips: [
        "Seien Sie ehrlich in Ihren Bewertungen",
        "Fotos von Rampen, breiten Türen etc. sind sehr hilfreich",
        "Sie können anonym bewerten, wenn Sie möchten"
      ]
    },
    {
      id: "categories",
      title: "Kategorien-System",
      description: "Finden Sie schnell, was Sie suchen",
      icon: <Filter className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Verwenden Sie Kategorien, um gezielt nach bestimmten Arten von Orten zu suchen:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Badge className="w-full justify-start gap-2 py-2" style={{ backgroundColor: "#FF6B6B20", borderColor: "#FF6B6B" }}>
                🍽️ Restaurants
              </Badge>
              <Badge className="w-full justify-start gap-2 py-2" style={{ backgroundColor: "#4ECDC420", borderColor: "#4ECDC4" }}>
                🏥 Gesundheit
              </Badge>
              <Badge className="w-full justify-start gap-2 py-2" style={{ backgroundColor: "#45B7D120", borderColor: "#45B7D1" }}>
                🛍️ Einkaufen
              </Badge>
            </div>
            <div className="space-y-2">
              <Badge className="w-full justify-start gap-2 py-2" style={{ backgroundColor: "#FECA5720", borderColor: "#FECA57" }}>
                🚇 Transport
              </Badge>
              <Badge className="w-full justify-start gap-2 py-2" style={{ backgroundColor: "#96CEB420", borderColor: "#96CEB4" }}>
                📚 Bildung
              </Badge>
              <Badge className="w-full justify-start gap-2 py-2" style={{ backgroundColor: "#DDA0DD20", borderColor: "#DDA0DD" }}>
                🎭 Freizeit
              </Badge>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              💡 <strong>Tipp:</strong> Beim Bewerten können Sie mehrere Kategorien auswählen. 
              Beim Suchen filtern Sie gezielt nach Ihren Bedürfnissen.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "search-filter",
      title: "Suchen & Filtern",
      description: "Finden Sie die besten barrierefreien Orte",
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Textsuche
              </h4>
              <p className="text-sm text-muted-foreground">
                Suchen Sie nach Namen oder Adressen von Orten
              </p>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Erweiterte Filter
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Mindestbewertung:</strong> Nur gut bewertete Orte anzeigen</p>
                <p>• <strong>Kategorien:</strong> Nach Ortstyp filtern</p>
                <p>• <strong>Bewertungsanzahl:</strong> Nur häufig bewertete Orte</p>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sortierung
              </h4>
              <p className="text-sm text-muted-foreground">
                Nach Bewertung, Anzahl Reviews, Name oder Datum sortieren
              </p>
            </div>
          </div>
        </div>
      ),
      tips: [
        "Kombinieren Sie mehrere Filter für bessere Ergebnisse",
        "Nutzen Sie die Kategorienfilter für gezielte Suchen",
        "Sortieren Sie nach Bewertung für die besten Orte zuerst"
      ]
    },
    {
      id: "accessibility",
      title: "Barrierefreiheit",
      description: "Diese App ist für alle zugänglich",
      icon: <Accessibility className="w-8 h-8 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            AbleCheck wurde speziell für Menschen mit verschiedenen Behinderungen entwickelt:
          </p>
          
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Sehbehinderung</p>
                <p className="text-sm text-muted-foreground">
                  Screen Reader kompatibel, hohe Kontraste, große Buttons
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <VolumeX className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Hörbehinderung</p>
                <p className="text-sm text-muted-foreground">
                  Visuelle Hinweise, Untertitel für alle wichtigen Informationen
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Smartphone className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Motorische Einschränkungen</p>
                <p className="text-sm text-muted-foreground">
                  Große Touch-Targets, Tastaturnavigation, einfache Bedienung
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              ⚙️ <strong>Tipp:</strong> Nutzen Sie die Accessibility-Einstellungen für eine 
              optimale Erfahrung!
            </p>
          </div>
        </div>
      )
    },
    {
      id: "community",
      title: "Community-Power",
      description: "Gemeinsam für mehr Barrierefreiheit",
      icon: <Users className="w-8 h-8 text-pink-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-pink-600" />
            <h4 className="font-semibold mb-2">Stärker zusammen</h4>
            <p className="text-muted-foreground">
              Jede Bewertung hilft der Community, bessere Entscheidungen zu treffen.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Ehrliche Bewertungen</p>
                <p className="text-sm text-muted-foreground">Helfen anderen bei der Planung</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Neue Orte entdecken</p>
                <p className="text-sm text-muted-foreground">Erweitern die Datenbank für alle</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Inklusion fördern</p>
                <p className="text-sm text-muted-foreground">Mehr Bewusstsein für Barrierefreiheit</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ready",
      title: "Bereit loszulegen! 🚀",
      description: "Ihre Reise zu mehr Barrierefreiheit beginnt jetzt",
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold mb-2">Sie sind bereit!</h3>
            <p className="text-muted-foreground">
              Beginnen Sie damit, Orte zu bewerten oder nach barrierefreien Plätzen zu suchen.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Was möchten Sie als Erstes tun?</h4>
            <div className="space-y-2 text-sm">
              <p>🏁 <strong>Für Einsteiger:</strong> Schauen Sie sich die vorhandenen Bewertungen an</p>
              <p>⭐ <strong>Für Aktive:</strong> Bewerten Sie einen Ort, den Sie kennen</p>
              <p>🔍 <strong>Für Suchende:</strong> Filtern Sie nach Ihren Bedürfnissen</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Vielen Dank, dass Sie Teil der AbleCheck-Community werden! 💙
            </p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      announceAction(`Schritt ${currentStep + 2} von ${steps.length}: ${steps[currentStep + 1].title}`)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      announceAction(`Schritt ${currentStep} von ${steps.length}: ${steps[currentStep - 1].title}`)
    }
  }

  const handleSkip = () => {
    announceAction("Onboarding übersprungen")
    onSkip()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentStepData.icon}
              {currentStepData.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAccessibleClick(e.currentTarget, handleSkip, "Onboarding überspringen")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Überspringen
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>

          {/* Tips Section */}
          {currentStepData.tips && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                💡 Hilfreiche Tipps:
              </h4>
              <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={(e) => handleAccessibleClick(e.currentTarget, prevStep, "Vorheriger Schritt")}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={(e) => handleAccessibleClick(
                e.currentTarget, 
                nextStep, 
                currentStep === steps.length - 1 ? "Onboarding abschließen" : "Nächster Schritt"
              )}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Loslegen!
                </>
              ) : (
                <>
                  Weiter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}