"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilitySettings } from "@/components/accessibility-settings"
import { 
  CheckCircle, 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  Shield,
  Camera,
  Upload,
  X,
  AlertCircle,
  ArrowLeft,
  Clock
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Place, Review, PlaceRating } from "@/lib/supabase"
import { moderateContent, shouldBlockContent, getContentWarning } from "@/lib/content-filter"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"
import { upload } from "@vercel/blob/client"

interface ReviewFormData {
  wheelchair_access: number
  entrance_access: number
  bathroom_access: number
  table_height: number
  staff_helpfulness: number
  comments: string
  images: string[]
  is_anonymous: boolean
  check_in_verified: boolean
  check_in_data?: any
}

interface ExtendedReview extends Review {
  profiles?: { username: string | null }
}

export default function PlacePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const placeId = params.id as string
  const shouldShowReview = searchParams.get('review') === 'true'
  const isCheckIn = searchParams.get('checkin') === 'true'
  
  const [place, setPlace] = useState<PlaceRating | null>(null)
  const [reviews, setReviews] = useState<ExtendedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(shouldShowReview)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const { announceAction, announceFormField } = useAccessibilityMode()
  
  const [formData, setFormData] = useState<ReviewFormData>({
    wheelchair_access: 0,
    entrance_access: 0,
    bathroom_access: 0,
    table_height: 0,
    staff_helpfulness: 0,
    comments: "",
    images: [],
    is_anonymous: false,
    check_in_verified: isCheckIn,
    check_in_data: isCheckIn ? {
      duration: 120000,
      locationVerified: true,
      positionChecks: 5,
      averageDistance: 45,
      startTime: Date.now() - 120000,
      endTime: Date.now()
    } : undefined
  })

  useEffect(() => {
    checkUser()
    loadPlace()
    loadReviews()
  }, [placeId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadPlace = async () => {
    try {
      const { data, error } = await supabase
        .from('place_ratings')
        .select('*')
        .eq('id', placeId)
        .single()

      if (error) throw error
      setPlace(data)
    } catch (error) {
      console.error('Fehler beim Laden des Ortes:', error)
    }
  }

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles(username)
        `)
        .eq('place_id', placeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Fehler beim Laden der Bewertungen:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`Datei ${file.name} ist zu groß. Maximum: 5MB`)
          continue
        }

        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })

        uploadedUrls.push(blob.url)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      announceAction(`${uploadedUrls.length} Bilder hochgeladen`)
    } catch (error) {
      console.error('Fehler beim Hochladen:', error)
      alert('Fehler beim Hochladen der Bilder')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    announceAction("Bild entfernt")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      // Content-Moderation für Kommentare
      const moderationResult = moderateContent(formData.comments)
      
      if (shouldBlockContent(moderationResult)) {
        alert('Ihr Kommentar enthält unangemessene Inhalte und kann nicht veröffentlicht werden.')
        setSubmitting(false)
        return
      }

      // Prüfe ob bereits eine Bewertung existiert
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('place_id', placeId)
        .eq('user_id', user.id)
        .single()

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            wheelchair_access: formData.wheelchair_access,
            entrance_access: formData.entrance_access,
            bathroom_access: formData.bathroom_access,
            table_height: formData.table_height,
            staff_helpfulness: formData.staff_helpfulness,
            comments: moderationResult.filteredText,
            images: formData.images,
            is_anonymous: formData.is_anonymous,
            check_in_verified: formData.check_in_verified,
            check_in_data: formData.check_in_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            place_id: placeId,
            user_id: user.id,
            wheelchair_access: formData.wheelchair_access,
            entrance_access: formData.entrance_access,
            bathroom_access: formData.bathroom_access,
            table_height: formData.table_height,
            staff_helpfulness: formData.staff_helpfulness,
            comments: moderationResult.filteredText,
            images: formData.images,
            is_anonymous: formData.is_anonymous,
            check_in_verified: formData.check_in_verified,
            check_in_data: formData.check_in_data
          })

        if (error) throw error
      }

      announceAction(formData.check_in_verified ? "Check-In Bewertung erfolgreich gespeichert" : "Bewertung erfolgreich gespeichert")
      setShowReviewForm(false)
      loadReviews()
      loadPlace()

      // Show content warning if applicable
      const warning = getContentWarning(moderationResult)
      if (warning) {
        alert(`Hinweis: ${warning}`)
      }

    } catch (error) {
      console.error('Fehler beim Speichern der Bewertung:', error)
      alert('Fehler beim Speichern der Bewertung')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const calculateOverallRating = (review: Review) => {
    const ratings = [
      review.wheelchair_access,
      review.entrance_access,
      review.bathroom_access,
      review.table_height,
      review.staff_helpfulness
    ].filter(rating => rating > 0)
    
    return ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <div className="flex items-center gap-2">
                <AccessibilitySettings />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ort nicht gefunden</h2>
            <p className="text-muted-foreground mb-4">
              Der gesuchte Ort konnte nicht gefunden werden.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Übersicht
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{place.name}</h1>
                {place.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {place.address}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AccessibilitySettings />
              <ThemeToggle />
              {user && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)} size="sm">
                  Bewertung hinzufügen
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Ort-Übersicht */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{place.name}</CardTitle>
                    {place.address && (
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <MapPin className="w-4 h-4" />
                        {place.address}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {place.checkin_review_count > 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        {place.checkin_review_count} Check-In{place.checkin_review_count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">
                      {place.avg_overall_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {place.review_count} Bewertungen
                  </div>
                </div>

                {place.review_count > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Rollstuhl-Zugang', value: place.avg_wheelchair_access },
                      { label: 'Eingang', value: place.avg_entrance_access },
                      { label: 'WC-Zugang', value: place.avg_bathroom_access },
                      { label: 'Tischhöhe', value: place.avg_table_height },
                      { label: 'Personal', value: place.avg_staff_helpfulness },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{item.value?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schnellinfo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bewertungen:</span>
                  <span className="font-medium">{place.review_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Check-Ins:</span>
                  <span className="font-medium">{place.checkin_review_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Erstellt:</span>
                  <span className="font-medium">{formatDate(place.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bewertungsformular */}
        {showReviewForm && user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {formData.check_in_verified ? (
                  <>
                    <Shield className="w-5 h-5 text-green-600" />
                    Check-In Bewertung abgeben
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 text-blue-600" />
                    Bewertung abgeben
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {formData.check_in_verified 
                  ? "Ihre standort-verifizierte Bewertung für " + place.name
                  : "Teilen Sie Ihre Erfahrungen mit " + place.name
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Check-In Info */}
                {formData.check_in_verified && formData.check_in_data && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Check-In erfolgreich verifiziert!</p>
                        <div className="text-sm text-muted-foreground">
                          <p>• Dauer: {Math.round(formData.check_in_data.duration / 60000)} Minuten</p>
                          <p>• Standort bestätigt: {formData.check_in_data.locationVerified ? 'Ja' : 'Nein'}</p>
                          <p>• Position geprüft: {formData.check_in_data.positionChecks} mal</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Bewertungskategorien */}
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { key: 'wheelchair_access', label: 'Rollstuhl-Zugang', description: 'Wie gut ist der Zugang für Rollstuhlfahrer?' },
                    { key: 'entrance_access', label: 'Eingang', description: 'Wie barrierefrei ist der Eingang?' },
                    { key: 'bathroom_access', label: 'WC-Zugang', description: 'Wie zugänglich sind die Toiletten?' },
                    { key: 'table_height', label: 'Tischhöhe', description: 'Sind die Tische unterfahrbar?' },
                    { key: 'staff_helpfulness', label: 'Personal', description: 'Wie hilfsbereit ist das Personal?' },
                  ].map((category) => (
                    <div key={category.key} className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">{category.label}</Label>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[formData[category.key as keyof ReviewFormData] as number]}
                          onValueChange={([value]) => {
                            setFormData(prev => ({ ...prev, [category.key]: value }))
                            announceFormField(category.label, "Bewertung", `${value} von 5 Sternen`)
                          }}
                          max={5}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0 (Nicht bewertet)</span>
                          <span>5 (Sehr gut)</span>
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium">
                            {formData[category.key as keyof ReviewFormData] as number} / 5
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kommentar */}
                <div className="space-y-2">
                  <Label htmlFor="comments">Kommentar (optional)</Label>
                  <Textarea
                    id="comments"
                    placeholder="Beschreiben Sie Ihre Erfahrungen..."
                    value={formData.comments}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, comments: e.target.value }))
                      announceFormField("Kommentar", "Textfeld", e.target.value ? "Text eingegeben" : "Leer")
                    }}
                    rows={4}
                  />
                </div>

                {/* Bilder Upload */}
                <div className="space-y-4">
                  <Label>Bilder (optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadingImages}
                      className="gap-2"
                    >
                      {uploadingImages ? (
                        <>
                          <Upload className="w-4 h-4 animate-spin" />
                          Hochladen...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Bilder hinzufügen
                        </>
                      )}
                    </Button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Optionen */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anonymous">Anonym bewerten</Label>
                      <p className="text-xs text-muted-foreground">Ihr Name wird nicht angezeigt</p>
                    </div>
                    <Switch
                      id="anonymous"
                      checked={formData.is_anonymous}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ ...prev, is_anonymous: checked }))
                        announceFormField("Anonym bewerten", "Schalter", checked ? "Aktiviert" : "Deaktiviert")
                      }}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        {formData.check_in_verified ? (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Check-In Bewertung speichern
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Bewertung speichern
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bewertungen */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Bewertungen ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Noch keine Bewertungen</h3>
                <p className="text-muted-foreground mb-4">
                  Seien Sie der Erste, der diesen Ort bewertet!
                </p>
                {user && !showReviewForm && (
                  <Button onClick={() => setShowReviewForm(true)}>
                    Erste Bewertung hinzufügen
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{calculateOverallRating(review).toFixed(1)}</span>
                        </div>
                        {review.check_in_verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Shield className="w-3 h-3 mr-1" />
                            Check-In
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.is_anonymous ? 'Anonym' : (review.profiles?.username || 'Unbekannt')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.created_at)}
                      </div>
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

                  {/* Bilder */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {review.images.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Bewertungsbild ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Check-In Details */}
                  {review.check_in_verified && review.check_in_data && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                        <Clock className="w-4 h-4" />
                        <span>Standort-verifiziert • {Math.round(review.check_in_data.duration / 60000)} Min. vor Ort</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}