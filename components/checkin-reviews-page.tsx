"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Timer, 
  ArrowLeft, 
  MapPin, 
  Users, 
  Star, 
  Search,
  CheckCircle,
  EyeOff,
  Trash2
} from "lucide-react"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"
import { supabase, type Review, type Profile, type PlaceRating } from "@/lib/supabase"

interface CheckInReviewsPageProps {
  onBack: () => void
  user: any
  onViewPlaceDetails: (place: PlaceRating) => void
}

export function CheckInReviewsPage({ onBack, user, onViewPlaceDetails }: CheckInReviewsPageProps) {
  const { handleAccessibleClick, announceFormField } = useAccessibilityMode()
  const [checkInReviews, setCheckInReviews] = useState<(Review & { profiles: Profile | null; place_name: string; place_address?: string })[]>([])
  const [filteredReviews, setFilteredReviews] = useState<(Review & { profiles: Profile | null; place_name: string; place_address?: string })[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load check-in reviews
  const loadCheckInReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all check-in reviews with place information
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          *,
          place_ratings!inner(name, address)
        `)
        .eq("is_checkin", true)
        .order("created_at", { ascending: false })

      if (reviewsError) {
        console.error("Error loading check-in reviews:", reviewsError)
        setError("Fehler beim Laden der Check-In-Bewertungen")
        return
      }

      // Get user profiles for the reviews
      const userIds = reviewsData?.map((review) => review.user_id).filter(Boolean) || []
      let profilesData: Profile[] = []

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds)
        
        if (!profilesError) {
          profilesData = profiles || []
        }
      }

      // Combine reviews with profiles and place information
      const reviewsWithProfiles = reviewsData?.map((review: any) => ({
        ...review,
        profiles: profilesData.find((profile) => profile.id === review.user_id) || null,
        place_name: review.place_ratings?.name || "Unbekannter Ort",
        place_address: review.place_ratings?.address
      })) || []

      setCheckInReviews(reviewsWithProfiles)
      setFilteredReviews(reviewsWithProfiles)
    } catch (error) {
      console.error("Error loading check-in reviews:", error)
      setError("Unerwarteter Fehler beim Laden der Check-In-Bewertungen")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCheckInReviews()
  }, [])

  // Filter reviews based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReviews(checkInReviews)
    } else {
      const filtered = checkInReviews.filter(
        (review) =>
          review.place_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (review.place_address && review.place_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (review.comments && review.comments.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredReviews(filtered)
    }
  }, [searchQuery, checkInReviews])

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId)
      if (error) {
        console.error("Error deleting review:", error)
        return
      }
      
      // Reload reviews after deletion
      await loadCheckInReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  const getDisplayName = (review: Review & { profiles: Profile | null }) => {
    if (review.is_anonymous) return "Anonymer Nutzer"
    if (review.profiles?.full_name) return review.profiles.full_name
    if (review.profiles?.username) return review.profiles.username
    return "Unbekannter Nutzer"
  }

  const getDisplayAvatar = (review: Review & { profiles: Profile | null }) => {
    if (review.is_anonymous) return ""
    return review.profiles?.avatar_url || ""
  }

  const getDisplayInitial = (review: Review & { profiles: Profile | null }) => {
    if (review.is_anonymous) return ""
    if (review.profiles?.full_name) return review.profiles.full_name.charAt(0).toUpperCase()
    if (review.profiles?.username) return review.profiles.username.charAt(0).toUpperCase()
    return "?"
  }

  const calculateOverallRating = (review: Review): number => {
    const ratings = [
      review.wheelchair_access,
      review.entrance_access,
      review.bathroom_access,
      review.table_height,
      review.staff_helpfulness
    ].filter(rating => rating > 0)
    
    if (ratings.length === 0) return 0
    return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Timer className="w-8 h-8 animate-pulse mx-auto mb-4 text-orange-600" />
          <p className="text-muted-foreground">Check-In-Bewertungen werden geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAccessibleClick(e.currentTarget, onBack, "Zurück zur Hauptseite")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Check-In-Bewertungen</h1>
          </div>
        </div>
        <div className="p-4">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadCheckInReviews}>Erneut versuchen</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleAccessibleClick(e.currentTarget, onBack, "Zurück zur Hauptseite")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-orange-600" />
            <h1 className="text-lg font-bold">Check-In-Bewertungen</h1>
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
              Verifiziert
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Timer className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm text-orange-900 dark:text-orange-100">
                  Verifizierte Check-In-Bewertungen
                </h3>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Diese Bewertungen wurden direkt vor Ort abgegeben und durch GPS-Verifikation und Mindestaufenthalt bestätigt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Check-In-Bewertungen durchsuchen..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              announceFormField("Suche", "Suchfeld", e.target.value)
            }}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{checkInReviews.length}</div>
                <div className="text-sm text-muted-foreground">Check-In-Bewertungen</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(checkInReviews.map(r => r.place_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Bewertete Orte</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {checkInReviews.filter(r => r.user_id === user?.id).length}
                </div>
                <div className="text-sm text-muted-foreground">Meine Check-Ins</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredReviews.length} von {checkInReviews.length} Check-In-Bewertungen gefunden
          </p>
        )}

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Timer className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "Keine Check-In-Bewertungen gefunden" : "Noch keine Check-In-Bewertungen"}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchQuery
                  ? `Keine Check-In-Bewertungen entsprechen der Suche "${searchQuery}"`
                  : "Beginnen Sie damit, Check-In-Bewertungen direkt vor Ort abzugeben"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="border-orange-100 dark:border-orange-900">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={getDisplayAvatar(review) || ""} />
                        <AvatarFallback className={review.is_anonymous ? "bg-gray-200 dark:bg-gray-700" : ""}>
                          {review.is_anonymous && <EyeOff className="w-4 h-4" />}
                          {!review.is_anonymous && getDisplayInitial(review)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium flex items-center gap-2 truncate">
                            {getDisplayName(review)}
                            {review.is_anonymous && <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                          </p>
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 flex-shrink-0">
                            <Timer className="w-3 h-3 mr-1" />
                            Check In
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("de-DE")} • {new Date(review.created_at).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        ⭐ {calculateOverallRating(review)}/5
                      </Badge>
                      {review.user_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) =>
                            handleAccessibleClick(
                              e.currentTarget,
                              () => deleteReview(review.id),
                              "Eigene Check-In-Bewertung löschen",
                            )
                          }
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Place Info */}
                  <div 
                    className="cursor-pointer hover:bg-muted/50 p-3 -m-3 rounded-lg transition-colors"
                    onClick={(e) => {
                      // This would need place data to work properly
                      // handleAccessibleClick(e.currentTarget, () => onViewPlaceDetails(place), `Details für ${review.place_name} anzeigen`)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{review.place_name}</p>
                        {review.place_address && (
                          <p className="text-xs text-muted-foreground">{review.place_address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ratings Grid */}
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Rollstuhl-Zugänglichkeit", value: review.wheelchair_access },
                      { label: "Eingang barrierefrei", value: review.entrance_access },
                      { label: "Toiletten zugänglich", value: review.bathroom_access },
                      { label: "Tischhöhe angemessen", value: review.table_height },
                      { label: "Personal hilfsbereit", value: review.staff_helpfulness },
                    ]
                      .filter((item) => item.value > 0)
                      .map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1">
                          <span className="truncate pr-2">{item.label}:</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{item.value}/5</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Comments */}
                  {review.comments && (
                    <div className="border-t pt-3">
                      <p className="text-sm leading-relaxed">{review.comments}</p>
                    </div>
                  )}

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="grid grid-cols-3 gap-2">
                        {review.images.slice(0, 6).map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={`Check-In Foto ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            {index === 5 && review.images!.length > 6 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center text-white text-sm font-medium">
                                +{review.images!.length - 6}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}