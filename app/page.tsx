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
    <div className="min-h-screen bg-background font-sans">
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary tracking-tight">AbleCheck</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Button onClick={() => setShowReviewTypeSelector(true)} className="rounded-full gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-5 h-5" />
                <span>Bewertung</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-12 h-12">
                  <User className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg">
                <DropdownMenuLabel className="font-heading text-lg px-4 py-2">
                  {user ? `Hallo, ${user.email}` : 'Menü'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-3 px-4 py-2 text-base" onClick={() => setShowAppInfo(true)}>
                  <Info className="w-5 h-5 text-accent" />
                  <span>App-Infos</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 px-4 py-2 text-base" onClick={() => setShowCheckInHelp(true)}>
                  <HelpCircle className="w-5 h-5 text-accent" />
                  <span>Check-In Hilfe</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 px-4 py-2 text-base" onClick={() => setShowOnboarding(true)}>
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span>Onboarding wiederholen</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="px-4 py-2">
                  <AccessibilitySettings />
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2">
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user && (
                  <div className="px-4 py-2">
                    <ProfileSettings user={user} onProfileUpdate={checkUser} />
                  </div>
                )}
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem className="flex items-center gap-3 px-4 py-2 text-base" onClick={() => supabase.auth.signOut()}>
                    <User className="w-5 h-5" />
                    <span>Abmelden</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="flex items-center gap-3 px-4 py-2 text-base" onClick={() => setShowAuth(true)}>
                    <User className="w-5 h-5" />
                    <span>Anmelden / Registrieren</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Suche und Filter */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  placeholder="Finde barrierefreie Orte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14 pr-4 py-6 rounded-full text-lg border-2 focus:border-primary transition-colors"
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
        </Card>

        {/* Statistiken */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Card className="rounded-2xl bg-primary/10 border-0">
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-primary">{places.length}</p>
              <p className="text-sm font-heading text-primary/80">Orte</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-secondary/10 border-0">
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-secondary">{places.reduce((sum, place) => sum + place.review_count, 0)}</p>
              <p className="text-sm font-heading text-secondary/80">Bewertungen</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-accent/10 border-0">
            <CardContent className="p-6">
              <p className="text-4xl font-bold text-accent">{places.reduce((sum, place) => sum + place.checkin_review_count, 0)}</p>
              <p className="text-sm font-heading text-accent/80">Check-Ins</p>
            </CardContent>
          </Card>
           <Button asChild variant="outline" className="h-full rounded-2xl text-lg border-2">
            <Link href="/check-in-reviews">
              <Shield className="w-6 h-6 mr-3" />
              Alle Check-Ins
            </Link>
          </Button>
        </div>

        {/* Orte Liste */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-2xl overflow-hidden border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-1/3 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedPlaces.length === 0 ? (
          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-12 text-center flex flex-col items-center">
              <MapPin className="w-20 h-20 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-3xl font-heading mb-4">Keine Orte gefunden</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md">
                {searchTerm ? 'Deine Suche ergab leider keine Treffer. Probier es doch mit anderen Begriffen!' : 'Sei der Erste, der einen Ort bewertet und der Community hilft!'}
              </p>
              {user && (
                <Button onClick={handleAddReview} size="lg" className="rounded-full gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="w-5 h-5" />
                  Ersten Ort bewerten
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedPlaces.map((place) => (
              <Card key={place.id} className="rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <CardHeader className="p-6">
                   <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl font-heading group-hover:text-primary transition-colors">
                      <Link href={`/place/${place.id}`}>{place.name}</Link>
                    </CardTitle>
                    {place.checkin_review_count > 0 && (
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm ml-2 flex-shrink-0">
                        <Shield className="w-4 h-4 mr-1.5" />
                        Verifiziert
                      </Badge>
                    )}
                  </div>
                  {place.address && (
                    <CardDescription className="flex items-center gap-2 pt-2 text-base">
                      <MapPin className="w-4 h-4" />
                      {place.address}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold">
                        {place.avg_overall_rating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        ({place.review_count} Reviews)
                      </span>
                    </div>
                    <Button asChild size="sm" className="rounded-full">
                      <Link href={`/place/${place.id}`}>Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action für nicht angemeldete Benutzer */}
        {!user && (
          <Card className="mt-12 rounded-3xl shadow-xl border-0 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <CardContent className="p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="max-w-2xl">
                <h3 className="text-4xl font-heading mb-2">Werde Teil der Community!</h3>
                <p className="text-lg opacity-90">
                  Melde dich an, um Orte zu bewerten, neue Orte hinzuzufügen und dabei zu helfen, die Welt für alle zugänglicher zu machen.
                </p>
              </div>
              <Button onClick={() => setShowAuth(true)} size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 flex-shrink-0 px-8 py-6 text-lg shadow-lg">
                Anmelden / Registrieren
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <CheckInHelpDialog 
        open={showCheckInHelp} 
        onOpenChange={handleCheckInHelpClose}
      />

      <AppInfoDialog 
        open={showAppInfo} 
        onOpenChange={setShowAppInfo} 
      />
    </div>
  )
}