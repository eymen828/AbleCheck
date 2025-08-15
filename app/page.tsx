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
import { JoyMode } from "@/components/joy-mode"
import { 
  PixelCard,
  PixelButton,
  PixelBadge,
  PixelSearchBar,
  GoogleWaveLoader,
  MaterialRipple,
  FloatingActionButton,
  pixelColors
} from "@/components/pixel-ui"
import { InteractiveMap } from "@/components/interactive-map"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative">
        {/* Google Pixel style background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.1) 0%, transparent 50%)`
          }} />
        </div>

        <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MaterialRipple className="rounded-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                </MaterialRipple>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AbleCheck</h1>
                  <p className="text-sm text-gray-600">Barrierefreiheit bewerten</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <PixelButton 
                    onClick={() => setShowReviewTypeSelector(true)} 
                    size="medium" 
                    color="primary"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">Bewertung</span>
                  </PixelButton>
                )}

                                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <PixelButton 
                        variant="outlined" 
                        size="medium"
                        color="secondary"
                      >
                        Einstellungen
                      </PixelButton>
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
                      <div className="px-2 py-1.5">
                        <ProfileSettings user={user} onProfileUpdate={checkUser} />
                      </div>
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

          <main className="relative z-10 container mx-auto px-6 py-8">
            {/* Statistiken im Google Pixel Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <PixelCard variant="elevated" color="primary">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{places.length}</div>
                      <p className="text-sm text-gray-600 font-medium">Bewertete Orte</p>
                      <div className="mt-2">
                        <PixelBadge color="primary" size="small">Aktiv</PixelBadge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </PixelCard>

              <PixelCard variant="elevated" color="success">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {places.reduce((sum, place) => sum + place.review_count, 0)}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Bewertungen</p>
                      <div className="mt-2">
                        <PixelBadge color="success" size="small">Community</PixelBadge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </PixelCard>

              <PixelCard variant="elevated" color="warning">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {places.reduce((sum, place) => sum + place.checkin_review_count, 0)}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Check-In Bewertungen</p>
                      <div className="mt-2">
                        <PixelBadge color="warning" size="small">Verifiziert</PixelBadge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </PixelCard>
            </div>

                    {/* Joy Mode */}
            <JoyMode />

            {/* Interactive Map */}
            <div className="mb-8">
              <InteractiveMap />
            </div>

            {/* Suche und Filter */}
            <PixelCard variant="elevated" className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <PixelSearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder="Nach Orten suchen... 🔍"
                    />
                  </div>
                  <SearchFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    totalResults={places.length}
                    filteredResults={filteredPlaces.length}
                  />
                </div>
              </CardContent>
            </PixelCard>

            {/* Navigation */}
            <div className="flex gap-3 mb-6">
              <PixelButton 
                variant="filled"
                color="primary"
                icon={<MapPin className="w-4 h-4" />}
              >
                Alle Orte
              </PixelButton>
              <PixelButton 
                variant="outlined"
                color="secondary"
              >
                <Link href="/check-in-reviews" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Check-In Bewertungen
                </Link>
              </PixelButton>
            </div>

                        {/* Orte Liste */}
              {loading ? (
                <PixelCard variant="elevated" className="p-8 text-center">
                  <div className="space-y-4">
                    <GoogleWaveLoader className="mx-auto" />
                    <p className="text-gray-600">Lade Orte...</p>
                  </div>
                </PixelCard>
                        ) : sortedPlaces.length === 0 ? (
                <PixelCard variant="elevated" color="warning">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Keine Orte gefunden
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm ? 'Versuche andere Suchbegriffe. 🔍' : 'Noch keine Orte bewertet. ✨'}
                    </p>
                    {user && (
                      <PixelButton 
                        onClick={handleAddReview}
                        color="warning"
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Erste Bewertung hinzufügen
                      </PixelButton>
                    )}
                  </CardContent>
                </PixelCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedPlaces.map((place, index) => (
                  <PixelCard 
                    key={place.id} 
                    variant="elevated"
                    color={['primary', 'secondary', 'success', 'warning', 'tertiary', 'primary'][index % 5] as any}
                  >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <Link href={`/place/${place.id}`} className="hover:underline flex-1">
                      {place.name}
                    </Link>
                        {place.checkin_review_count > 0 && (
                          <PixelBadge 
                            variant="filled"
                            color="success"
                            size="small"
                            className="ml-2"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Verifiziert ✓
                          </PixelBadge>
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
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="text-lg font-bold text-gray-900">
                            {place.avg_overall_rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {place.review_count} Bewertungen
                          </span>
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
                          ].map((item, i) => (
                            <div key={i} className="text-center">
                              <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                              <p className="text-sm font-bold text-gray-900">
                                {item.value?.toFixed(1) || 'N/A'}
                              </p>
                            </div>
                          ))}
                    </div>
                  )}

                      <PixelButton 
                        variant="outlined" 
                        size="medium" 
                        color="primary"
                        className="w-full"
                      >
                        <Link href={`/place/${place.id}`} className="flex items-center justify-center gap-2">
                          Details ansehen
                        </Link>
                      </PixelButton>
                    </CardContent>
                  </PixelCard>
              ))}
            </div>
        )}

            {/* Call to Action für nicht angemeldete Benutzer */}
            {!user && (
              <PixelCard 
                className="mt-8" 
                variant="elevated"
                color="primary"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Bewertungen hinzufügen
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Melde dich an, um Orte zu bewerten und anderen zu helfen! 🌟
                  </p>
                  <PixelButton 
                    onClick={() => setShowAuth(true)}
                    color="primary"
                    size="large"
                  >
                    Anmelden / Registrieren
                  </PixelButton>
                </CardContent>
              </PixelCard>
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

          {/* Floating Action Button */}
          {user && (
            <FloatingActionButton 
              onClick={() => setShowReviewTypeSelector(true)}
              color="primary"
            >
              <Plus className="w-6 h-6" />
            </FloatingActionButton>
          )}
        </div>
      </div>
  )
}