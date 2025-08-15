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
  AnimatedCard, 
  AnimatedButton, 
  AnimatedBadge,
  FloatingIcon,
  SparkleBackground,
  GradientText,
  RainbowBorder,
  PulsingDot,
  CounterAnimation
} from "@/components/animated-ui"
import { PlayfulCardLoader, FloatingElements } from "@/components/animated-loader"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <FloatingElements>
        <SparkleBackground>
        <header className="border-b bg-gradient-to-r from-white/80 to-purple-50/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RainbowBorder>
                  <FloatingIcon delay={0}>
                    <CheckCircle className="w-10 h-10 text-purple-600 p-2" />
                  </FloatingIcon>
                </RainbowBorder>
                <div>
                  <GradientText className="text-3xl font-bold">
                    AbleCheck
                  </GradientText>
                  <p className="text-sm text-purple-600/70">
                    Barrierefreiheit spielerisch bewerten ✨
                  </p>
                </div>
              </div>
            <div className="flex items-center gap-3">
              {user && (
                <AnimatedButton 
                  onClick={() => setShowReviewTypeSelector(true)} 
                  size="sm" 
                  gradient="from-green-500 to-blue-500"
                  icon={<Plus className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Bewertung</span>
                </AnimatedButton>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton 
                    variant="outline" 
                    size="sm"
                    className="border-purple-200 hover:border-purple-400"
                  >
                    Einstellungen
                  </AnimatedButton>
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

        <main className="container mx-auto px-4 py-8">
          {/* Statistiken */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedCard 
              delay={0.1}
              gradient="bg-gradient-to-br from-blue-50 to-cyan-100"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FloatingIcon delay={0.5}>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </FloatingIcon>
                  <div>
                    <CounterAnimation 
                      value={places.length}
                      className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                    />
                    <p className="text-sm text-blue-600/70 font-medium">Bewertete Orte</p>
                    <PulsingDot color="bg-blue-500" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard 
              delay={0.2}
              gradient="bg-gradient-to-br from-green-50 to-emerald-100"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FloatingIcon delay={0.7}>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </FloatingIcon>
                  <div>
                    <CounterAnimation 
                      value={places.reduce((sum, place) => sum + place.review_count, 0)}
                      className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    />
                    <p className="text-sm text-green-600/70 font-medium">Bewertungen</p>
                    <PulsingDot color="bg-green-500" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard 
              delay={0.3}
              gradient="bg-gradient-to-br from-purple-50 to-pink-100"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FloatingIcon delay={0.9}>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </FloatingIcon>
                  <div>
                    <CounterAnimation 
                      value={places.reduce((sum, place) => sum + place.checkin_review_count, 0)}
                      className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                    />
                    <p className="text-sm text-purple-600/70 font-medium">Check-In Bewertungen</p>
                    <PulsingDot color="bg-purple-500" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </div>

        {/* Joy Mode */}
        <JoyMode />

          {/* Suche und Filter */}
          <AnimatedCard delay={0.4} className="mb-6" gradient="bg-gradient-to-r from-white to-blue-50/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <FloatingIcon delay={1.2}>
                    <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                  </FloatingIcon>
                  <Input
                    placeholder="Nach Orten suchen... 🔍"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-300"
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
          </AnimatedCard>

          {/* Navigation */}
          <div className="flex gap-3 mb-6">
            <AnimatedButton 
              variant="default"
              gradient="from-purple-600 to-blue-600"
              icon={<MapPin className="w-4 h-4" />}
            >
              Alle Orte
            </AnimatedButton>
            <AnimatedButton 
              variant="outline"
              className="border-purple-200 hover:border-purple-400"
            >
              <Link href="/check-in-reviews" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Check-In Bewertungen
              </Link>
            </AnimatedButton>
          </div>

          {/* Orte Liste */}
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <PlayfulCardLoader key={i} delay={i * 0.1} />
                ))}
              </div>
          ) : sortedPlaces.length === 0 ? (
            <AnimatedCard gradient="bg-gradient-to-br from-orange-50 to-yellow-100">
              <CardContent className="p-8 text-center">
                <FloatingIcon>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                </FloatingIcon>
                <GradientText className="text-xl font-bold mb-2" gradient="from-orange-600 to-yellow-600">
                  Keine Orte gefunden
                </GradientText>
                <p className="text-orange-600/70 mb-4">
                  {searchTerm ? 'Versuche andere Suchbegriffe. 🔍' : 'Noch keine Orte bewertet. ✨'}
                </p>
                {user && (
                  <AnimatedButton 
                    onClick={handleAddReview}
                    gradient="from-orange-500 to-yellow-500"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Erste Bewertung hinzufügen
                  </AnimatedButton>
                )}
              </CardContent>
            </AnimatedCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedPlaces.map((place, index) => (
                <AnimatedCard 
                  key={place.id} 
                  delay={index * 0.1}
                  gradient={`bg-gradient-to-br ${
                    ['from-rose-50 to-pink-100', 'from-blue-50 to-indigo-100', 'from-green-50 to-emerald-100', 
                     'from-purple-50 to-violet-100', 'from-yellow-50 to-orange-100', 'from-cyan-50 to-blue-100'][index % 6]
                  }`}
                >
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <Link href={`/place/${place.id}`} className="hover:underline flex-1">
                      {place.name}
                    </Link>
                      {place.checkin_review_count > 0 && (
                        <AnimatedBadge 
                          variant="default"
                          gradient="from-green-500 to-emerald-500"
                          className="ml-2"
                          pulse={true}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Verifiziert ✓
                        </AnimatedBadge>
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
                        <FloatingIcon delay={index * 0.1 + 1}>
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        </FloatingIcon>
                        <CounterAnimation 
                          value={Math.round((place.avg_overall_rating || 0) * 10) / 10}
                          className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <FloatingIcon delay={index * 0.1 + 1.2}>
                          <Users className="w-4 h-4 text-purple-500" />
                        </FloatingIcon>
                        <span className="text-sm font-medium text-purple-600">
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
                            <p className="text-xs text-purple-600/60 font-medium">{item.label}</p>
                            <CounterAnimation 
                              value={Math.round((item.value || 0) * 10) / 10}
                              className="text-sm font-bold text-purple-700"
                            />
                          </div>
                        ))}
                    </div>
                  )}

                    <AnimatedButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-purple-200 hover:border-purple-400"
                    >
                      <Link href={`/place/${place.id}`} className="flex items-center justify-center gap-2">
                        Details ansehen ✨
                      </Link>
                    </AnimatedButton>
                  </CardContent>
                </AnimatedCard>
              ))}
            </div>
        )}

          {/* Call to Action für nicht angemeldete Benutzer */}
          {!user && (
            <AnimatedCard 
              className="mt-8" 
              gradient="bg-gradient-to-br from-indigo-50 to-purple-100"
              delay={0.5}
            >
              <CardContent className="p-8 text-center">
                <FloatingIcon>
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </FloatingIcon>
                <GradientText className="text-2xl font-bold mb-2" gradient="from-indigo-600 to-purple-600">
                  Bewertungen hinzufügen
                </GradientText>
                <p className="text-indigo-600/70 mb-6">
                  Melde dich an, um Orte zu bewerten und anderen zu helfen! 🌟
                </p>
                <AnimatedButton 
                  onClick={() => setShowAuth(true)}
                  gradient="from-indigo-500 to-purple-500"
                  size="lg"
                >
                  Anmelden / Registrieren 🚀
                </AnimatedButton>
              </CardContent>
            </AnimatedCard>
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
        </SparkleBackground>
      </FloatingElements>
    </div>
  )
}