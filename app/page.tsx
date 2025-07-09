"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/search-filters"
import { ReviewTypeSelector } from "@/components/review-type-selector"
import { CheckInAddressInput } from "@/components/check-in-address-input"
import { CheckInTimer, type CheckInData } from "@/components/check-in-timer"
import { CheckInHelpDialog } from "@/components/check-in-help-dialog"
import { AppInfoDialog } from "@/components/app-info-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilitySettings } from "@/components/accessibility-settings"
import { Auth } from "@/components/auth"
import { 
  CheckCircle, 
  Plus, 
  MapPin, 
  Star, 
  Users, 
  Search,
  Shield,
  TrendingUp,
  HelpCircle,
  User,
  Info
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { PlaceRating } from "@/lib/supabase"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useGeolocation } from "@/hooks/use-geolocation"
import { PlaceSelector } from "@/components/place-selector"
import { Onboarding } from "@/components/onboarding"
import { ProfileSettings } from "@/components/profile-settings"
import { UserReviews } from "@/components/user-reviews"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HomePage() {
  const [places, setPlaces] = useState<PlaceRating[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showReviewTypeSelector, setShowReviewTypeSelector] = useState(false)
  const [showCheckInAddressInput, setShowCheckInAddressInput] = useState(false)
  const [showCheckInTimer, setShowCheckInTimer] = useState(false)
  const [showCheckInHelp, setShowCheckInHelp] = useState(false)
  const [showAppInfo, setShowAppInfo] = useState(false)
  const [showPlaceSelector, setShowPlaceSelector] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceRating | null>(null)
  const [checkInAddress, setCheckInAddress] = useState("")
  const [checkInCoordinates, setCheckInCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const [hasSeenCheckInIntro, setHasSeenCheckInIntro] = useLocalStorage('ablecheck-checkin-intro-seen', false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('ablecheck-onboarding-completed', false)

  const { position, getCurrentPosition } = useGeolocation()

  const [filters, setFilters] = useState<SearchFiltersType>({
    minRating: 0,
    minReviews: 0,
    sortBy: "rating",
    sortOrder: "desc",
  })

  useEffect(() => {
    checkUser()
    loadPlaces()
  }, [])

  useEffect(() => {
    // Show onboarding for new users after component is mounted
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [hasCompletedOnboarding])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('place_ratings')
        .select('*')
        .order('avg_overall_rating', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Orte:', error)
        // Fallback: Lade direkt aus places Tabelle
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('places')
          .select('*')
          .order('created_at', { ascending: false })

        if (fallbackError) throw fallbackError

        // Konvertiere zu PlaceRating Format
        const convertedData = fallbackData?.map(place => ({
          ...place,
          review_count: 0,
          checkin_review_count: 0,
          avg_wheelchair_access: null,
          avg_entrance_access: null,
          avg_bathroom_access: null,
          avg_table_height: null,
          avg_staff_helpfulness: null,
          avg_overall_rating: null,
          weighted_avg_rating: null,
        })) || []

        setPlaces(convertedData)
      } else {
        setPlaces(data || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Orte:', error)
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddReview = () => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setShowReviewTypeSelector(true)
  }

  const handleSelectStandardReview = () => {
    setShowReviewTypeSelector(false)

    // Zeige Ort-Auswahl für Standard-Bewertung
    setShowPlaceSelector(true)
  }

  const handleCreateNewPlace = async (name: string, address: string) => {
    try {
      // Erstelle neuen Ort in der Datenbank
      const { data: newPlace, error } = await supabase
        .from('places')
        .insert({ name, address })
        .select()
        .single()

      if (error) throw error

      // Leite zur Bewertungsseite weiter
      window.location.href = `/place/${newPlace.id}?review=true`
    } catch (error) {
      console.error('Fehler beim Erstellen des Ortes:', error)
      alert('Fehler beim Erstellen des Ortes. Bitte versuchen Sie es erneut.')
    }
  }

  const handleSelectCheckInReview = () => {
    setShowReviewTypeSelector(false)

    if (!hasSeenCheckInIntro) {
      setShowCheckInHelp(true)
      setHasSeenCheckInIntro(true)
    } else {
      setShowCheckInAddressInput(true)
    }
  }

  const handleAddressConfirmed = (address: string, coordinates?: { latitude: number; longitude: number }) => {
    setCheckInAddress(address)
    setCheckInCoordinates(coordinates || null)
    setShowCheckInAddressInput(false)
    setShowCheckInTimer(true)
  }

  const handleCheckInComplete = (checkInData: CheckInData) => {
    setShowCheckInTimer(false)
    // Hier würde die Check-In Bewertung erstellt werden
    console.log('Check-In abgeschlossen:', checkInData)

    // Für jetzt leiten wir zur ersten verfügbaren Stelle weiter
    if (places.length > 0) {
      window.location.href = `/place/${places[0].id}?review=true&checkin=true`
    }
  }

  const handleCheckInHelpClose = () => {
    setShowCheckInHelp(false)
    setShowCheckInAddressInput(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setHasCompletedOnboarding(true)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    setHasCompletedOnboarding(true)
  }

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (place.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesRating = (place.avg_overall_rating || 0) >= filters.minRating
    const matchesReviews = place.review_count >= filters.minReviews

    return matchesSearch && matchesRating && matchesReviews
  })

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    let aValue: number, bValue: number

    switch (filters.sortBy) {
      case "rating":
        aValue = a.avg_overall_rating || 0
        bValue = b.avg_overall_rating || 0
        break
      case "reviews":
        aValue = a.review_count
        bValue = b.review_count
        break
      case "name":
        return filters.sortOrder === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      case "date":
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        return 0
    }

    return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue
  })

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
  }

  if (showAuth) {
    return <Auth onAuthSuccess={() => { setShowAuth(false); checkUser() }} />
  }

  if (showPlaceSelector) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PlaceSelector
          places={places}
          onCancel={() => setShowPlaceSelector(false)}
          onCreateNew={handleCreateNewPlace}
        />
      </div>
    )
  }

  if (showReviewTypeSelector) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ReviewTypeSelector
          onSelectStandard={handleSelectStandardReview}
          onSelectCheckIn={handleSelectCheckInReview}
          onCancel={() => setShowReviewTypeSelector(false)}
        />
      </div>
    )
  }

  if (showCheckInAddressInput) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <CheckInAddressInput
          onAddressConfirmed={handleAddressConfirmed}
          onCancel={() => setShowCheckInAddressInput(false)}
          onShowHelp={() => setShowCheckInHelp(true)}
        />
      </div>
    )
  }

  if (showCheckInTimer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <CheckInTimer
          address={checkInAddress}
          targetLocation={checkInCoordinates || undefined}
          onCheckInComplete={handleCheckInComplete}
          onCancel={() => {
            setShowCheckInTimer(false)
            setCheckInAddress("")
            setCheckInCoordinates(null)
          }}
          onShowHelp={() => setShowCheckInHelp(true)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">AbleCheck</h1>
                <p className="text-sm text-muted-foreground">Barrierefreiheit bewerten</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button onClick={() => setShowReviewTypeSelector(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Bewertung</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Einstellungen
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Optionen</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setShowAppInfo(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    App-Infos
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setShowCheckInHelp(true)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Check-In Hilfe
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setShowOnboarding(true)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Onboarding wiederholen
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <AccessibilitySettings />
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <ThemeToggle />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {user && (
                    <>
                      <DropdownMenuItem asChild>
                        <div className="w-full">
                          <ProfileSettings user={user} onProfileUpdate={checkUser} />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {user ? (
                    <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                      <User className="mr-2 h-4 w-4" />
                      Abmelden
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setShowAuth(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Anmelden
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">


        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{places.length}</p>
                  <p className="text-sm text-muted-foreground">Bewertete Orte</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {places.reduce((sum, place) => sum + place.review_count, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Bewertungen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {places.reduce((sum, place) => sum + place.checkin_review_count, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Check-In Bewertungen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suche und Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nach Orten suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={places.length}
            filteredResults={filteredPlaces.length}
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Button variant="default">
            <MapPin className="w-4 h-4 mr-2" />
            Alle Orte
          </Button>
          <Button asChild variant="outline">
            <Link href="/check-in-reviews">
              <Shield className="w-4 h-4 mr-2" />
              Check-In Bewertungen
            </Link>
          </Button>
        </div>

        {/* Orte Liste */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedPlaces.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Orte gefunden</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Versuchen Sie andere Suchbegriffe.' : 'Noch keine Orte bewertet.'}
              </p>
              {user && (
                <Button onClick={handleAddReview}>
                  <Plus className="w-4 h-4 mr-2" />
                  Erste Bewertung hinzufügen
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlaces.map((place) => (
              <Card key={place.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <Link href={`/place/${place.id}`} className="hover:underline flex-1">
                      {place.name}
                    </Link>
                    {place.checkin_review_count > 0 && (
                      <Badge variant="outline" className="ml-2">
                        <Shield className="w-3 h-3 mr-1" />
                        Verifiziert
                      </Badge>
                    )}
                  </CardTitle>
                  {place.address && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.address}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">
                        {place.avg_overall_rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {place.review_count} Bewertungen
                    </div>
                  </div>

                  {place.review_count > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-4 text-xs">
                      {[
                        { label: 'Rollstuhl', value: place.avg_wheelchair_access },
                        { label: 'Eingang', value: place.avg_entrance_access },
                        { label: 'WC', value: place.avg_bathroom_access },
                        { label: 'Tische', value: place.avg_table_height },
                        { label: 'Personal', value: place.avg_staff_helpfulness },
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <p className="text-muted-foreground">{item.label}</p>
                          <p className="font-medium">{item.value?.toFixed(1) || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/place/${place.id}`}>
                      Details ansehen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action für nicht angemeldete Benutzer */}
        {!user && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bewertungen hinzufügen</h3>
              <p className="text-muted-foreground mb-4">
                Melden Sie sich an, um Orte zu bewerten und anderen zu helfen.
              </p>
              <Button onClick={() => setShowAuth(true)}>
                Anmelden / Registrieren
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Check-In Help Dialog */}
      <CheckInHelpDialog 
        open={showCheckInHelp} 
        onOpenChange={(open) => {
          setShowCheckInHelp(open)
          if (!open && !hasSeenCheckInIntro) {
            startCheckInProcess()
          }
        }} 
      />

      {/* App Info Dialog */}
      <AppInfoDialog 
        open={showAppInfo} 
        onOpenChange={setShowAppInfo} 
      />
    </div>
  )
}