"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchFilters } from "@/components/search-filters"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilitySettings } from "@/components/accessibility-settings"
import { 
  CheckCircle, 
  MapPin, 
  Star, 
  Clock, 
  Search,
  Filter,
  TrendingUp,
  Shield,
  Users
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { PlaceRating } from "@/lib/supabase"

interface CheckInReview {
  id: string
  place_id: string
  place_name: string
  place_address: string | null
  user_id: string
  username: string | null
  is_anonymous: boolean
  wheelchair_access: number
  entrance_access: number
  bathroom_access: number
  table_height: number
  staff_helpfulness: number
  comments: string | null
  created_at: string
  check_in_verified: boolean
}

export default function CheckInReviewsPage() {
  const [reviews, setReviews] = useState<CheckInReview[]>([])
  const [places, setPlaces] = useState<PlaceRating[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    minRating: 0,
    minReviews: 0,
    sortBy: "date" as const,
    sortOrder: "desc" as const,
  })

  useEffect(() => {
    loadCheckInReviews()
    loadPlacesWithCheckIns()
  }, [])

  const loadCheckInReviews = async () => {
    try {
      // Lade Check-In Bewertungen mit Platz- und Benutzerinformationen
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          place_id,
          user_id,
          wheelchair_access,
          entrance_access,
          bathroom_access,
          table_height,
          staff_helpfulness,
          comments,
          created_at,
          is_anonymous,
          places!inner(name, address),
          profiles(username)
        `)
        .eq('check_in_verified', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const formattedReviews = data?.map(review => ({
        id: review.id,
        place_id: review.place_id,
        place_name: (review.places as any)?.name || 'Unbekannter Ort',
        place_address: (review.places as any)?.address || null,
        user_id: review.user_id,
        username: review.is_anonymous ? null : (review.profiles as any)?.username,
        is_anonymous: review.is_anonymous,
        wheelchair_access: review.wheelchair_access,
        entrance_access: review.entrance_access,
        bathroom_access: review.bathroom_access,
        table_height: review.table_height,
        staff_helpfulness: review.staff_helpfulness,
        comments: review.comments,
        created_at: review.created_at,
        check_in_verified: true,
      })) || []

      setReviews(formattedReviews)
    } catch (error) {
      console.error('Fehler beim Laden der Check-In Bewertungen:', error)
    }
  }

  const loadPlacesWithCheckIns = async () => {
    try {
      // Lade Orte mit Check-In Bewertungen
      const { data, error } = await supabase
        .from('place_ratings')
        .select('*')
        .gte('review_count', 1)
        .order('avg_overall_rating', { ascending: false })

      if (error) throw error
      setPlaces(data || [])
    } catch (error) {
      console.error('Fehler beim Laden der Orte:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallRating = (review: CheckInReview) => {
    const ratings = [
      review.wheelchair_access,
      review.entrance_access,
      review.bathroom_access,
      review.table_height,
      review.staff_helpfulness
    ].filter(rating => rating > 0)
    
    return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (review.place_address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const overallRating = calculateOverallRating(review)
    const matchesRating = overallRating >= filters.minRating
    
    return matchesSearch && matchesRating
  })

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (place.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchesRating = (place.avg_overall_rating || 0) >= filters.minRating
    const matchesReviews = place.review_count >= filters.minReviews
    
    return matchesSearch && matchesRating && matchesReviews
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">Check-In Bewertungen</h1>
                  <p className="text-sm text-muted-foreground">Verifizierte Standort-Bewertungen</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AccessibilitySettings />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Check-In Bewertungen</h1>
                <p className="text-sm text-muted-foreground">Verifizierte Standort-Bewertungen</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AccessibilitySettings />
              <ThemeToggle />
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
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground">Check-In Bewertungen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{places.length}</p>
                  <p className="text-sm text-muted-foreground">Verifizierte Orte</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {places.length > 0 ? (places.reduce((sum, place) => sum + (place.avg_overall_rating || 0), 0) / places.length).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Ø Bewertung</p>
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
            totalResults={reviews.length}
            filteredResults={filteredReviews.length}
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Button asChild variant="outline">
            <Link href="/">
              <MapPin className="w-4 h-4 mr-2" />
              Alle Orte
            </Link>
          </Button>
          <Button variant="default">
            <Shield className="w-4 h-4 mr-2" />
            Check-In Bewertungen
          </Button>
        </div>

        {/* Check-In Bewertungen */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Neueste Check-In Bewertungen
          </h2>

          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Check-In Bewertungen gefunden</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Versuchen Sie andere Suchbegriffe.' : 'Noch keine verifizierten Bewertungen vorhanden.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Link 
                          href={`/place/${review.place_id}`}
                          className="hover:underline"
                        >
                          {review.place_name}
                        </Link>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Check-In
                        </Badge>
                      </CardTitle>
                      {review.place_address && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {review.place_address}
                        </CardDescription>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{calculateOverallRating(review).toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {review.is_anonymous ? 'Anonym' : (review.username || 'Unbekannt')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Bewertungsdetails */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {[
                      { label: 'Rollstuhl', value: review.wheelchair_access },
                      { label: 'Eingang', value: review.entrance_access },
                      { label: 'WC', value: review.bathroom_access },
                      { label: 'Tische', value: review.table_height },
                      { label: 'Personal', value: review.staff_helpfulness },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Kommentar */}
                  {review.comments && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <p className="text-sm">{review.comments}</p>
                    </div>
                  )}

                  {/* Zeitstempel */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(review.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-600" />
                      Standort verifiziert
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Top bewertete Orte mit Check-Ins */}
        <div className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top bewertete Orte mit Check-Ins
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.slice(0, 6).map((place) => (
              <Card key={place.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/place/${place.id}`} className="hover:underline">
                      {place.name}
                    </Link>
                  </CardTitle>
                  {place.address && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.address}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{place.avg_overall_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {place.review_count} Bewertungen
                    </div>
                  </div>
                  
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/place/${place.id}`}>
                      Details ansehen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}