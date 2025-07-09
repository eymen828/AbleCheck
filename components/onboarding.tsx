
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  MapPin, 
  Star, 
  Shield, 
  Users, 
  Eye,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Lightbulb,
  Target,
  Heart
} from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface OnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('ablecheck-onboarding-completed', false)

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Willkommen bei AbleCheck",
      description: "Ihre Plattform für Barrierefreiheit",
      icon: <CheckCircle className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Willkommen bei AbleCheck!</h2>
            <p className="text-muted-foreground text-lg">
              Die Community-Plattform, die dabei hilft, barrierefreie Orte zu finden und zu bewerten.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm">
              <Heart className="w-4 h-4 inline mr-2 text-red-500" />
              Gemeinsam machen wir die Welt zugänglicher für alle Menschen.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "mission",
      title: "Unsere Mission",
      description: "Barrierefreiheit für alle zugänglich machen",
      icon: <Target className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Target className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-3">Unsere Mission</h2>
          </div>
          <div className="grid gap-4">
            <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <Eye className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold">Transparenz schaffen</h3>
                <p className="text-sm text-muted-foreground">
                  Ehrliche und detaillierte Bewertungen zur Barrierefreiheit von Orten
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Community stärken</h3>
                <p className="text-sm text-muted-foreground">
                  Eine Gemeinschaft aufbauen, die sich gegenseitig unterstützt
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Zugänglichkeit verbessern</h3>
                <p className="text-sm text-muted-foreground">
                  Betreiber dabei helfen, ihre Orte barrierefreier zu gestalten
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "features",
      title: "Hauptfunktionen",
      description: "Entdecken Sie, was AbleCheck bietet",
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Star className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-3">Was können Sie tun?</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Orte finden & bewerten</h3>
                <p className="text-sm text-muted-foreground">
                  Durchsuchen Sie barrierefreie Orte in Ihrer Nähe und geben Sie detaillierte Bewertungen ab
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Check-In Bewertungen</h3>
                <p className="text-sm text-muted-foreground">
                  Verifizierte Bewertungen durch Standort-basierte Check-Ins für höchste Glaubwürdigkeit
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Community-getrieben</h3>
                <p className="text-sm text-muted-foreground">
                  Profitieren Sie von echten Erfahrungen anderer Menschen mit Behinderungen
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "checkin",
      title: "Check-In Bewertungen",
      description: "Verifizierte Standort-Bewertungen",
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h2 className="text-2xl font-bold mb-3">Check-In Bewertungen</h2>
            <Badge variant="secondary" className="mb-4">
              Verifiziert & Vertrauenswürdig
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Was macht Check-Ins besonders?
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Check-In Bewertungen sind standortverifiziert und daher besonders vertrauenswürdig.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Adresse des Ortes eingeben</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Physisch zum Ort begeben</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">2-Minuten Timer vor Ort starten</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">Verifizierte Bewertung abgeben</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "accessibility",
      title: "Barrierefreiheit",
      description: "Die App ist für alle zugänglich",
      icon: <Eye className="w-8 h-8 text-indigo-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Eye className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold mb-3">Barrierefreie Bedienung</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
              <p className="text-sm">
                AbleCheck wurde von Grund auf barrierefrei entwickelt und bietet umfassende Unterstützung für:
              </p>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Screenreader-Unterstützung</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Tastaturnavigation</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Hoher Kontrast & Dark Mode</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Anpassbare Schriftgrößen</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Sprachausgabe</span>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <p className="text-xs text-center">
                💡 Tipp: Nutzen Sie die Barrierefreiheits-Einstellungen in der oberen rechten Ecke
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "getstarted",
      title: "Loslegen",
      description: "Beginnen Sie Ihre Reise mit AbleCheck",
      icon: <ArrowRight className="w-8 h-8 text-green-600" />,
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Sie sind startklar!</h2>
            <p className="text-muted-foreground">
              Erkunden Sie jetzt barrierefreie Orte oder geben Sie Ihre erste Bewertung ab.
            </p>
          </div>
          <div className="grid gap-3 max-w-sm mx-auto">
            <Button size="lg" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Orte erkunden
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              <Star className="w-4 h-4 mr-2" />
              Erste Bewertung
            </Button>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <p className="text-sm">
              <Heart className="w-4 h-4 inline mr-2 text-red-500" />
              Vielen Dank, dass Sie Teil unserer Community werden!
            </p>
          </div>
        </div>
      )
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setHasCompletedOnboarding(true)
    onComplete()
  }

  const handleSkip = () => {
    setHasCompletedOnboarding(true)
    onSkip()
  }

  if (hasCompletedOnboarding) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steps[currentStep].icon}
              <div>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Schritt {currentStep + 1} von {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[400px]">
            {steps[currentStep].content}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={handleComplete} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Fertig
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Weiter
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
              Onboarding überspringen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
