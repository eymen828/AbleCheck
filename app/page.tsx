"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Star,
  MapPin,
  Plus,
  ArrowLeft,
  Trash2,
  Camera,
  Loader2,
  AlertCircle,
  LogOut,
  Users,
  CheckCircle,
  EyeOff,
  Search,
  Settings,
  Save,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react"
import { upload } from "@vercel/blob/client"
import { supabase, type PlaceRating, type Review, type Profile } from "@/lib/supabase"
import { Auth } from "@/components/auth"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { ThemeToggle, MobileThemeToggle } from "@/components/theme-toggle"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/search-filters"
import { AccessibilitySettings } from "@/components/accessibility-settings"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"
import { moderateContent, shouldBlockContent, getContentWarning } from "@/lib/content-filter"
import { AccessibleButton } from "@/components/accessible-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  label: string
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

function StarRating({ rating, onRatingChange, label, readonly = false, size = "md" }: StarRatingProps) {
  const starSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6"
  const buttonPadding = size === "sm" ? "p-0.5" : "p-1"
  const { handleAccessibleClick, settings, announceAction } = useAccessibilityMode()

  const handleStarClick = (star: number) => {
    onRatingChange(star)
    announceAction(`${star} von 5 Sternen ausgewählt für ${label}`)
  }

  return (
    <div className="space-y-2">
      <Label className={`text-sm font-medium ${size === "sm" ? "text-xs" : ""}`}>{label}</Label>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === rating}
            onClick={(e) => {
              if (readonly) return
              if (settings.isBlindModeEnabled) {
                handleAccessibleClick(
                  e.currentTarget,
                  () => handleStarClick(star),
                  `${star} von 5 Sternen für ${label}`,
                )
              } else {
                handleStarClick(star)
              }
            }}
            className={`${buttonPadding} ${
              !readonly ? "hover:scale-110 transition-transform cursor-pointer active:scale-95" : "cursor-default"
            } touch-manipulation rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={readonly}
            aria-label={`${star} von 5 Sternen für ${label}`}
          >
            <Star className={`${starSize} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
        <span className={`ml-2 text-muted-foreground ${size === "sm" ? "text-xs" : "text-sm"}`} aria-live="polite">
          {rating === 0 ? "Nicht bewertet" : `${rating} von 5 Sternen`}
        </span>
      </div>
    </div>
  )
}

// Mobile Image Gallery Component
function MobileImageGallery({ images, onClose }: { images: string[]; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { handleAccessibleClick } = useAccessibilityMode()

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleAccessibleClick(e.currentTarget, onClose, "Bildergalerie schließen")}
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleAccessibleClick(e.currentTarget, prevImage, "Vorheriges Bild")}
          className="absolute left-4 z-10 text-white hover:bg-white/20"
          disabled={images.length <= 1}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Bild ${currentIndex + 1} von ${images.length}`}
          className="max-w-full max-h-full object-contain"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleAccessibleClick(e.currentTarget, nextImage, "Nächstes Bild")}
          className="absolute right-4 z-10 text-white hover:bg-white/20"
          disabled={images.length <= 1}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}

// Mobile Menu Component
function MobileMenu({
  user,
  userProfile,
  onProfileClick,
  onSignOut,
  getUserDisplayName,
  getUserInitial,
}: {
  user: SupabaseUser
  userProfile: Profile | null
  onProfileClick: () => void
  onSignOut: () => void
  getUserDisplayName: () => string
  getUserInitial: () => string
}) {
  const { handleAccessibleClick } = useAccessibilityMode()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 pb-6 border-b">
            <Avatar className="w-12 h-12">
              <AvatarImage src={userProfile?.avatar_url || ""} />
              <AvatarFallback>{getUserInitial()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{getUserDisplayName()}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex-1 py-6 space-y-4">
            <Button
              variant="ghost"
              onClick={(e) => handleAccessibleClick(e.currentTarget, onProfileClick, "Profil bearbeiten")}
              className="w-full justify-start gap-3"
            >
              <Settings className="w-5 h-5" />
              Profil bearbeiten
            </Button>
            <MobileThemeToggle />
          </div>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              onClick={(e) => handleAccessibleClick(e.currentTarget, onSignOut, "Abmelden")}
              className="w-full justify-start gap-3 text-red-600"
            >
              <LogOut className="w-5 h-5" />
              Abmelden
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function AbleCheckApp() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "form" | "place-detail" | "profile" | "checkin-form" | "checkin-list">("list")
  const [places, setPlaces] = useState<PlaceRating[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceRating[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    minRating: 0,
    minReviews: 0,
    categories: [],
    sortBy: "rating",
    sortOrder: "desc",
  })
  const [selectedPlace, setSelectedPlace] = useState<PlaceRating | null>(null)
  const [placeReviews, setPlaceReviews] = useState<(Review & { profiles: Profile | null })[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    placeName: "",
    address: "",
    ratings: {
      wheelchairAccess: 0,
      entranceAccess: 0,
      bathroomAccess: 0,
      tableHeight: 0,
      staffHelpfulness: 0,
    },
    comments: "",
    images: [] as string[],
    isAnonymous: false,
  })
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    avatarUrl: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [contentWarning, setContentWarning] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [showReviewTypeDialog, setShowReviewTypeDialog] = useState(false)
  const [reviewType, setReviewType] = useState<null | "standard" | "checkin">(null)
  const [showCheckInIntro, setShowCheckInIntro] = useState(false)
  const [showCheckInHelp, setShowCheckInHelp] = useState(false)
  const [checkInTimer, setCheckInTimer] = useState(0)
  const [checkInActive, setCheckInActive] = useState(false)
  const [checkInLocation, setCheckInLocation] = useState<GeolocationPosition | null>(null)
  const [checkInError, setCheckInError] = useState<string | null>(null)
  const [showCheckInForm, setShowCheckInForm] = useState(false)
  const [checkInAllowed, setCheckInAllowed] = useState(false)
  const [checkInIntroSeen, setCheckInIntroSeen] = useLocalStorage<boolean>("checkin_intro_seen", false)

  const { handleAccessibleClick, announcePageChange, announceFormField } = useAccessibilityMode()

  // Hydration-Check
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Apply search and filters
  const processedPlaces = useMemo(() => {
    let filtered = places

    // Text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply filters
    if (searchFilters.minRating > 0) {
      filtered = filtered.filter((place) => (place.avg_overall_rating || 0) >= searchFilters.minRating)
    }

    if (searchFilters.minReviews > 0) {
      filtered = filtered.filter((place) => place.review_count >= searchFilters.minReviews)
    }

    // Category filtering would need to be implemented with place categories
    // For now, we'll skip this as it requires database schema changes

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (searchFilters.sortBy) {
        case "rating":
          aValue = a.avg_overall_rating || 0
          bValue = b.avg_overall_rating || 0
          break
        case "reviews":
          aValue = a.review_count
          bValue = b.review_count
          break
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "date":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (searchFilters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [places, searchQuery, searchFilters])

  useEffect(() => {
    setFilteredPlaces(processedPlaces)
  }, [processedPlaces])

  // Check authentication status and load profile
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      }

      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Service Worker Registration für PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }
  }, [])

  // Announce page changes for accessibility
  useEffect(() => {
    const pageNames = {
      list: "Ortsliste",
      form: "Bewertungsformular",
      "place-detail": "Ortsdetails",
      profile: "Profil bearbeiten",
    }
    announcePageChange(pageNames[view])
  }, [view, announcePageChange])

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
        return
      }

      if (data) {
        setUserProfile(data)
        setProfileData({
          username: data.username || "",
          fullName: data.full_name || "",
          avatarUrl: data.avatar_url || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  // Load places from Supabase
  const loadPlaces = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("place_ratings").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading places:", error)
        setError(`Fehler beim Laden der Orte: ${error.message}`)
        return
      }

      setPlaces(data || [])
    } catch (error) {
      console.error("Error loading places:", error)
      setError("Unerwarteter Fehler beim Laden der Orte")
    } finally {
      setLoading(false)
    }
  }

  // Load reviews for a specific place
  const loadPlaceReviews = async (placeId: string) => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("place_id", placeId)
        .order("created_at", { ascending: false })

      if (reviewsError) {
        console.error("Error loading reviews:", reviewsError)
        return
      }

      const userIds = reviewsData?.map((review) => review.user_id).filter(Boolean) || []
      let profilesData: Profile[] = []

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("id", userIds)
        if (!profilesError) {
          profilesData = profiles || []
        }
      }

      const reviewsWithProfiles =
        reviewsData?.map((review) => ({
          ...review,
          profiles: profilesData.find((profile) => profile.id === review.user_id) || null,
        })) || []

      setPlaceReviews(reviewsWithProfiles)

      if (user) {
        const existingReview = reviewsWithProfiles.find((review) => review.user_id === user.id)
        setUserReview(existingReview || null)
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    }
  }

  useEffect(() => {
    if (user) {
      loadPlaces()
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Datei ${file.name} ist zu groß und wird übersprungen`)
          continue
        }

        if (!file.type.startsWith("image/")) {
          console.warn(`Datei ${file.name} ist kein Bild und wird übersprungen`)
          continue
        }

        try {
          const blob = await upload(`review-${user?.id}-${Date.now()}-${file.name}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          })
          uploadedUrls.push(blob.url)
        } catch (uploadError: any) {
          console.error(`Fehler beim Hochladen von ${file.name}:`, uploadError)
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }))
      }

      if (uploadedUrls.length === 0) {
        throw new Error("Keine Bilder konnten hochgeladen werden")
      }
    } catch (error: any) {
      console.error("Upload failed:", error)

      if (error.message.includes("client token")) {
        alert("Upload-Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.")
      } else {
        alert(`Fehler beim Hochladen der Bilder: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const file = files[0]

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Datei ist zu groß. Maximale Größe: 5MB")
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Bitte wählen Sie eine Bilddatei aus")
      }

      const blob = await upload(`avatar-${user?.id}-${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      })

      setProfileData((prev) => ({
        ...prev,
        avatarUrl: blob.url,
      }))
    } catch (error: any) {
      console.error("Avatar upload failed:", error)

      if (error.message.includes("client token")) {
        alert("Upload-Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.")
      } else if (error.message.includes("zu groß")) {
        alert("Die Datei ist zu groß. Bitte wählen Sie ein kleineres Bild (max. 5MB).")
      } else if (error.message.includes("Bilddatei")) {
        alert("Bitte wählen Sie eine gültige Bilddatei aus.")
      } else {
        alert(`Fehler beim Hochladen des Profilbilds: ${error.message}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarUrlInput = () => {
    const url = prompt("Geben Sie eine Bild-URL ein (falls der Upload nicht funktioniert):")
    if (url && url.trim()) {
      setProfileData((prev) => ({
        ...prev,
        avatarUrl: url.trim(),
      }))
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }))
  }

  // Handle comment changes with content moderation
  const handleCommentsChange = (value: string) => {
    const moderation = moderateContent(value)

    if (shouldBlockContent(moderation)) {
      setContentWarning("Ihr Kommentar enthält unangemessene Inhalte und kann nicht gespeichert werden.")
      return
    }

    const warning = getContentWarning(moderation)
    setContentWarning(warning)

    setFormData((prev) => ({
      ...prev,
      comments: moderation.filteredText,
    }))
  }

  const handleSubmit = async (e: React.FormEvent, isCheckIn = false) => {
    e.preventDefault()
    if (!formData.placeName.trim() || !user) return

    // Final content check
    const moderation = moderateContent(formData.comments)
    if (shouldBlockContent(moderation)) {
      alert("Ihr Kommentar enthält unangemessene Inhalte und kann nicht gespeichert werden.")
      return
    }

    setIsSubmitting(true)

    try {
      let placeId: string

      const { data: existingPlace } = await supabase
        .from("places")
        .select("id")
        .eq("name", formData.placeName)
        .eq("address", formData.address || "")
        .single()

      if (existingPlace) {
        placeId = existingPlace.id
      } else {
        const { data: newPlace, error: placeError } = await supabase
          .from("places")
          .insert({
            name: formData.placeName,
            address: formData.address || null,
          })
          .select("id")
          .single()

        if (placeError) throw placeError
        placeId = newPlace.id
      }

      const reviewData = {
        place_id: placeId,
        user_id: user.id,
        wheelchair_access: formData.ratings.wheelchairAccess,
        entrance_access: formData.ratings.entranceAccess,
        bathroom_access: formData.ratings.bathroomAccess,
        table_height: formData.ratings.tableHeight,
        staff_helpfulness: formData.ratings.staffHelpfulness,
        comments: moderation.filteredText || null,
        images: formData.images.length > 0 ? formData.images : null,
        is_anonymous: formData.isAnonymous,
        is_checkin: isCheckIn,
      }

      const { error } = await supabase.from("reviews").upsert(reviewData)

      if (error) throw error

      setFormData({
        placeName: "",
        address: "",
        ratings: {
          wheelchairAccess: 0,
          entranceAccess: 0,
          bathroomAccess: 0,
          tableHeight: 0,
          staffHelpfulness: 0,
        },
        comments: "",
        images: [],
        isAnonymous: false,
      })
      setContentWarning(null)

      await loadPlaces()
      setView("list")
    } catch (error: any) {
      console.error("Error saving review:", error)
      alert(`Fehler beim Speichern der Bewertung: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSavingProfile(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: profileData.username || null,
        full_name: profileData.fullName || null,
        avatar_url: profileData.avatarUrl || null,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      await loadUserProfile(user.id)
      setView("list")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      alert(`Fehler beim Speichern des Profils: ${error.message}`)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const getRatingColor = (rating: number | null) => {
    if (!rating) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    if (rating >= 4) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (rating >= 3) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    if (rating >= 2) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Möchten Sie Ihre Bewertung wirklich löschen?")) return

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

      if (error) throw error

      await loadPlaces()
      if (selectedPlace) {
        await loadPlaceReviews(selectedPlace.id)
      }
    } catch (error: any) {
      console.error("Error deleting review:", error)
      alert(`Fehler beim Löschen der Bewertung: ${error.message}`)
    }
  }

  const viewPlaceDetails = (place: PlaceRating) => {
    setSelectedPlace(place)
    loadPlaceReviews(place.id)
    setView("place-detail")
  }

  const openImageGallery = (images: string[]) => {
    setGalleryImages(images)
    setShowImageGallery(true)
  }

  const getDisplayName = (review: Review & { profiles: Profile | null }) => {
    if (review.is_anonymous) {
      return "Anonymer Nutzer"
    }
    return review.profiles?.full_name || review.profiles?.username || "Unbekannter Nutzer"
  }

  const getDisplayAvatar = (review: Review & { profiles: Profile | null }) => {
    if (review.is_anonymous) {
      return null
    }
    return review.profiles?.avatar_url
  }

  const getDisplayInitial = (review: Review & { profiles: Profile | null }) => {
    if (review.is_anonymous) {
      return "?"
    }
    return review.profiles?.full_name?.charAt(0) || review.profiles?.username?.charAt(0) || "?"
  }

  const getUserDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name
    if (userProfile?.username) return userProfile.username
    return user?.email || "Benutzer"
  }

  const getUserInitial = () => {
    if (userProfile?.full_name) return userProfile.full_name.charAt(0).toUpperCase()
    if (userProfile?.username) return userProfile.username.charAt(0).toUpperCase()
    return user?.email?.charAt(0).toUpperCase() || "B"
  }

  // Check-In-Logik
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (checkInActive) {
      setCheckInTimer(0)
      setCheckInAllowed(false)
      setCheckInError(null)
      // Start timer
      timer = setInterval(() => {
        setCheckInTimer((prev) => prev + 1)
      }, 1000)
      // Start GPS
      const geoId = navigator.geolocation.watchPosition(
        (pos) => {
          setCheckInLocation(pos)
          setCheckInError(null)
        },
        (err) => {
          setCheckInError("GPS konnte nicht abgerufen werden. Bitte Standortfreigabe erlauben.")
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      )
      return () => {
        clearInterval(timer)
        navigator.geolocation.clearWatch(geoId)
      }
    }
  }, [checkInActive])

  useEffect(() => {
    if (checkInTimer >= 120 && checkInLocation) {
      setCheckInAllowed(true)
    }
  }, [checkInTimer, checkInLocation])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">AbleCheck wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Datenbank-Fehler:</strong> {error}
              <br />
              <br />
              Bitte führen Sie das SQL-Script "complete-setup.sql" aus, um die Datenbank zu initialisieren.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={loadPlaces} variant="outline" className="w-full sm:w-auto">
              Erneut versuchen
            </Button>
            <Button
              onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
              className="w-full sm:w-auto"
            >
              Supabase Dashboard öffnen
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Profile Edit View - Mobile Optimized
  if (view === "profile") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAccessibleClick(e.currentTarget, () => setView("list"), "Zurück zur Ortsliste")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-bold">Profil bearbeiten</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Persönliche Informationen</CardTitle>
              <CardDescription className="text-sm">
                Bearbeiten Sie Ihre Profildaten, die bei Bewertungen angezeigt werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Upload - Mobile Optimized */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileData.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">{getUserInitial()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <Label>Profilbild</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          if (handleAccessibleClick) {
                            handleAccessibleClick(
                              e.currentTarget,
                              () => document.getElementById("avatar")?.click(),
                              "Profilbild hochladen",
                            )
                          } else {
                            document.getElementById("avatar")?.click()
                          }
                        }}
                        disabled={isUploading}
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Camera className="w-4 h-4" />
                        {isUploading ? "Hochladen..." : "Hochladen"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) =>
                          handleAccessibleClick(e.currentTarget, handleAvatarUrlInput, "Bild-URL eingeben")
                        }
                        className="gap-2 w-full sm:w-auto"
                      >
                        URL eingeben
                      </Button>
                      {profileData.avatarUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) =>
                            handleAccessibleClick(
                              e.currentTarget,
                              () => setProfileData((prev) => ({ ...prev, avatarUrl: "" })),
                              "Profilbild entfernen",
                            )
                          }
                          className="w-full sm:w-auto"
                        >
                          Entfernen
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unterstützte Formate: JPEG, PNG, GIF, WebP (max. 5MB)
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Vollständiger Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => {
                        setProfileData((prev) => ({ ...prev, fullName: e.target.value }))
                        announceFormField("Vollständiger Name", "Eingabefeld", e.target.value)
                      }}
                      placeholder="Max Mustermann"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Wird als Hauptname bei Bewertungen angezeigt</p>
                  </div>

                  <div>
                    <Label htmlFor="username">Benutzername</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => {
                        setProfileData((prev) => ({ ...prev, username: e.target.value }))
                        announceFormField("Benutzername", "Eingabefeld", e.target.value)
                      }}
                      placeholder="maxmustermann"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Wird angezeigt, wenn kein vollständiger Name vorhanden ist
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input id="email" value={user.email || ""} disabled className="bg-muted mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">E-Mail-Adresse kann nicht geändert werden</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="gap-2 w-full sm:w-auto"
                    onClick={(e) => {
                      if (!isSavingProfile) {
                        handleAccessibleClick(e.currentTarget, () => {}, "Profil speichern")
                      }
                    }}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Profil speichern
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) =>
                      handleAccessibleClick(e.currentTarget, () => setView("list"), "Abbrechen und zurück")
                    }
                    className="w-full sm:w-auto"
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Place Detail View - Mobile Optimized
  if (view === "place-detail" && selectedPlace) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAccessibleClick(e.currentTarget, () => setView("list"), "Zurück zur Ortsliste")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold flex items-center gap-2 truncate">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                {selectedPlace.name}
              </h1>
              {selectedPlace.address && (
                <p className="text-sm text-muted-foreground truncate">{selectedPlace.address}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={getRatingColor(selectedPlace.avg_overall_rating)} className="text-sm px-2 py-1">
                ⭐ {selectedPlace.avg_overall_rating?.toFixed(1) || "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Bewertungen</CardTitle>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedPlace.review_count}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: "Rollstuhl", value: selectedPlace.avg_wheelchair_access },
                  { label: "Eingang", value: selectedPlace.avg_entrance_access },
                  { label: "Toiletten", value: selectedPlace.avg_bathroom_access },
                  { label: "Tische", value: selectedPlace.avg_table_height },
                  { label: "Personal", value: selectedPlace.avg_staff_helpfulness },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="text-sm font-medium">{item.label}:</span>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={Math.round(item.value || 0)}
                        onRatingChange={() => {}}
                        label=""
                        readonly
                        size="sm"
                      />
                      <span className="text-sm font-medium min-w-[3rem] text-right">
                        {item.value?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Review Button */}
          {!userReview && (
            <Button
              onClick={(e) => {
                setShowReviewTypeDialog(true)
                setSelectedPlace(selectedPlace)
              }}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Bewertung hinzufügen
            </Button>
          )}

          {/* Individual Reviews */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Einzelne Bewertungen</h2>
            {placeReviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Noch keine Bewertungen für diesen Ort.</p>
                </CardContent>
              </Card>
            ) : (
              placeReviews.map((review) => (
                <Card key={review.id}>
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
                          <p className="font-medium flex items-center gap-2 truncate">
                            {getDisplayName(review)}
                            {review.is_anonymous && <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                      {review.user_id === user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) =>
                            handleAccessibleClick(
                              e.currentTarget,
                              () => deleteReview(review.id),
                              "Eigene Bewertung löschen",
                            )
                          }
                          className="text-red-500 hover:text-red-700 p-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                                alt={`Foto ${index + 1}`}
                                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) =>
                                  handleAccessibleClick(
                                    e.currentTarget,
                                    () => openImageGallery(review.images!),
                                    `Bildergalerie öffnen, ${review.images!.length} Bilder`,
                                  )
                                }
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
              ))
            )}
          </div>
        </div>

        {/* Image Gallery Modal */}
        {showImageGallery && <MobileImageGallery images={galleryImages} onClose={() => setShowImageGallery(false)} />}
      </div>
    )
  }

  // Form View - Mobile Optimized
  if (view === "form") {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-card border-b z-10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAccessibleClick(e.currentTarget, () => setView("list"), "Zurück zur Ortsliste")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-bold">Ort bewerten</h1>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Barrierefreiheit bewerten</CardTitle>
              <CardDescription className="text-sm">
                Bewerten Sie die Zugänglichkeit dieses Ortes für Menschen mit Behinderungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="placeName">Name des Ortes *</Label>
                    <Input
                      id="placeName"
                      value={formData.placeName}
                      onChange={(e) => {
                        setFormData({ ...formData, placeName: e.target.value })
                        announceFormField("Name des Ortes", "Eingabefeld", e.target.value)
                      }}
                      placeholder="z.B. Café Zentral"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={(value) => {
                        setFormData({ ...formData, address: value })
                        announceFormField("Adresse", "Adress-Eingabefeld", value)
                      }}
                      onSelect={(suggestion) => {
                        setFormData({ ...formData, address: suggestion.display_name })
                        announceFormField("Adresse", "Adresse ausgewählt", suggestion.display_name)
                      }}
                      placeholder="z.B. Hauptstraße 123, 10115 Berlin"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Rating Criteria */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Bewertungskriterien</h3>

                  <StarRating
                    rating={formData.ratings.wheelchairAccess}
                    onRatingChange={(rating) =>
                      setFormData({
                        ...formData,
                        ratings: { ...formData.ratings, wheelchairAccess: rating },
                      })
                    }
                    label="Können Rollstuhlfahrer hier ohne Probleme sich fortbewegen?"
                  />

                  <StarRating
                    rating={formData.ratings.entranceAccess}
                    onRatingChange={(rating) =>
                      setFormData({
                        ...formData,
                        ratings: { ...formData.ratings, entranceAccess: rating },
                      })
                    }
                    label="Ist der Eingang barrierefrei zugänglich?"
                  />

                  <StarRating
                    rating={formData.ratings.bathroomAccess}
                    onRatingChange={(rating) =>
                      setFormData({
                        ...formData,
                        ratings: { ...formData.ratings, bathroomAccess: rating },
                      })
                    }
                    label="Sind die Toiletten rollstuhlgerecht?"
                  />

                  <StarRating
                    rating={formData.ratings.tableHeight}
                    onRatingChange={(rating) =>
                      setFormData({
                        ...formData,
                        ratings: { ...formData.ratings, tableHeight: rating },
                      })
                    }
                    label="Sind Tische und Theken in angemessener Höhe?"
                  />

                  <StarRating
                    rating={formData.ratings.staffHelpfulness}
                    onRatingChange={(rating) =>
                      setFormData({
                        ...formData,
                        ratings: { ...formData.ratings, staffHelpfulness: rating },
                      })
                    }
                    label="Wie hilfsbereit ist das Personal bei besonderen Bedürfnissen?"
                  />
                </div>

                {/* Comments */}
                <div>
                  <Label htmlFor="comments">Zusätzliche Kommentare</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => {
                      handleCommentsChange(e.target.value)
                      announceFormField("Kommentare", "Textbereich", e.target.value)
                    }}
                    placeholder="Weitere Details zur Barrierefreiheit..."
                    rows={4}
                    className="mt-1 resize-none"
                  />
                  {contentWarning && (
                    <Alert className="mt-2">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-sm">{contentWarning}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="images">Fotos hochladen</Label>
                  <div className="space-y-4 mt-2">
                    <div className="flex flex-col gap-3">
                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) =>
                          handleAccessibleClick(
                            e.currentTarget,
                            () => document.getElementById("images")?.click(),
                            "Fotos für die Bewertung auswählen",
                          )
                        }
                        disabled={isUploading}
                        className="gap-2 w-full"
                        size="lg"
                      >
                        <Camera className="w-5 h-5" />
                        {isUploading ? "Hochladen..." : "Fotos hinzufügen"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Zeigen Sie Barrierefreiheits-Features wie Rampen, breite Türen, etc.
                      </p>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={(e) =>
                                handleAccessibleClick(
                                  e.currentTarget,
                                  () => removeImage(index),
                                  `Foto ${index + 1} entfernen`,
                                )
                              }
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-start space-x-3 p-4 bg-primary/10 rounded-lg border">
                  <Checkbox
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, isAnonymous: checked as boolean })
                      announceFormField("Anonym bewerten", "Checkbox", checked ? "aktiviert" : "deaktiviert")
                    }}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none flex-1">
                    <Label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <EyeOff className="w-4 h-4" />
                      Anonym bewerten
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Ihre Bewertung wird ohne Ihren Namen oder Profilbild angezeigt
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  size="lg"
                  onClick={(e) => {
                    if (!isSubmitting) {
                      handleAccessibleClick(e.currentTarget, () => {}, "Bewertung speichern")
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    "Bewertung speichern"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main List View - Mobile Optimized
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-card border-b z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-blue-600">AbleCheck</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Bewerten Sie Orte auf ihre Zugänglichkeit</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Check-In-Hilfe" onClick={() => setShowCheckInIntro(true)}>
            <HelpCircle className="w-5 h-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userProfile?.avatar_url || ""} />
              <AvatarFallback>{getUserInitial()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{getUserDisplayName()}</span>
            <AccessibilitySettings />
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => setView("profile")}> <Settings className="w-4 h-4 mr-2" /> Profil </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}> <LogOut className="w-4 h-4 mr-2" /> Abmelden </Button>
          </div>
          <MobileMenu
            user={user}
            userProfile={userProfile}
            onProfileClick={() => setView("profile")}
            onSignOut={handleSignOut}
            getUserDisplayName={getUserDisplayName}
            getUserInitial={getUserInitial}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Bar and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Orte durchsuchen..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                announceFormField("Suche", "Suchfeld", e.target.value)
              }}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <SearchFilters
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              totalResults={places.length}
              filteredResults={filteredPlaces.length}
            />
            <AccessibilitySettings />
          </div>
        </div>

        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            {filteredPlaces.length} von {places.length} Orten gefunden
          </p>
        )}

        {/* Add Review Button */}
        <AccessibleButton
          onAccessibleClick={() => setShowReviewTypeDialog(true)}
          description="Neuen Ort bewerten - öffnet die Bewertungsart-Auswahl"
          className="w-full gap-2"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Ort bewerten
        </AccessibleButton>

        {/* Dialog für Bewertungsart-Auswahl */}
        <Dialog open={showReviewTypeDialog} onOpenChange={setShowReviewTypeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bewertungsart wählen</DialogTitle>
              <DialogDescription>
                Möchtest du eine Standard-Bewertung oder eine Check-In-Bewertung abgeben?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <Button
                variant="default"
                onClick={() => {
                  setShowReviewTypeDialog(false)
                  setReviewType("standard")
                  if (selectedPlace) {
                    setFormData({ ...formData, placeName: selectedPlace.name, address: selectedPlace.address || "" })
                  }
                  setView("form")
                }}
                className="w-full"
              >
                Standard-Bewertung
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewTypeDialog(false)
                  setReviewType("checkin")
                  if (!checkInIntroSeen) {
                    setShowCheckInIntro(true)
                  } else {
                    setCheckInActive(true)
                  }
                  if (selectedPlace) {
                    setFormData({ ...formData, placeName: selectedPlace.name, address: selectedPlace.address || "" })
                  }
                }}
                className="w-full"
              >
                Check-In-Bewertung
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowReviewTypeDialog(false)} className="w-full">Abbrechen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check-In Einführung Dialog */}
        <Dialog open={showCheckInIntro} onOpenChange={setShowCheckInIntro}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Was ist eine Check-In-Bewertung?</DialogTitle>
              <DialogDescription>
                Bei einer Check-In-Bewertung bestätigst du durch deinen Aufenthalt (mind. 2 Minuten, geprüft per GPS), dass du wirklich vor Ort bist. <br /><br />
                <b>Wichtig:</b> Dafür werden deine GPS-Daten genutzt. Diese werden <b>nicht verkauft oder anderweitig genutzt</b>, sondern nur zur Überprüfung deines Aufenthalts verwendet.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-sm text-muted-foreground">
              Nach Ablauf der Zeit kannst du eine Check-In-Bewertung abgeben. Diese wird besonders hervorgehoben.
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setCheckInIntroSeen(true)
                  setShowCheckInIntro(false)
                  setCheckInActive(true)
                }}
                className="w-full"
              >
                Verstanden & Starten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check-In Hilfe Dialog */}
        <Dialog open={showCheckInHelp} onOpenChange={setShowCheckInHelp}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check-In-Bewertung Hilfe</DialogTitle>
              <DialogDescription>
                Bei einer Check-In-Bewertung bestätigst du durch deinen Aufenthalt (mind. 2 Minuten, geprüft per GPS), dass du wirklich vor Ort bist. <br /><br />
                <b>Wichtig:</b> Dafür werden deine GPS-Daten genutzt. Diese werden <b>nicht verkauft oder anderweitig genutzt</b>, sondern nur zur Überprüfung deines Aufenthalts verwendet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowCheckInHelp(false)} className="w-full">Schließen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Check-In Stoppuhr & GPS */}
        {checkInActive && (
          <Dialog open={checkInActive} onOpenChange={(open) => { if (!open) setCheckInActive(false) }}>
            <DialogContent>
              <div className="flex justify-between items-center mb-2">
                <DialogTitle>Check-In läuft...</DialogTitle>
                <Button onClick={() => setShowCheckInHelp(true)} variant="ghost" size="icon" className="ml-2" title="Hilfe">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>
              <DialogDescription>
                Bitte bleibe für mindestens 2 Minuten am Ort. Deine Anwesenheit wird per GPS geprüft.
              </DialogDescription>
              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="text-4xl font-mono">{Math.floor(checkInTimer/60).toString().padStart(2,"0")}:{(checkInTimer%60).toString().padStart(2,"0")}</div>
                <div className="text-sm text-muted-foreground">
                  {checkInLocation ? "GPS-Signal erkannt" : "Warte auf GPS..."}
                </div>
                {checkInError && <Alert variant="destructive"><AlertDescription>{checkInError}</AlertDescription></Alert>}
                <Button
                  onClick={() => {
                    setCheckInActive(false)
                    setShowCheckInForm(true)
                    setView("checkin-form")
                  }}
                  className="w-full"
                  disabled={!checkInAllowed}
                >
                  {checkInAllowed ? "Check-In-Bewertung abgeben" : "Mindestens 2 Minuten warten..."}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Places List */}
        {filteredPlaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "Keine Orte gefunden" : "Noch keine Orte bewertet"}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchQuery
                  ? `Keine Orte entsprechen der Suche "${searchQuery}"`
                  : "Beginnen Sie damit, Orte auf ihre Barrierefreiheit zu bewerten"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={(e) => handleAccessibleClick(e.currentTarget, () => setView("form"), "Ersten Ort bewerten")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ersten Ort bewerten
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPlaces.map((place) => (
              <Card key={place.id} className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                <CardHeader
                  onClick={(e) =>
                    handleAccessibleClick(
                      e.currentTarget,
                      () => viewPlaceDetails(place),
                      `${place.name}, ${place.review_count} Bewertungen, Durchschnitt ${place.avg_overall_rating?.toFixed(1) || "keine"} Sterne`,
                    )
                  }
                  className="pb-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{place.name}</span>
                      </CardTitle>
                      {place.address && <CardDescription className="truncate">{place.address}</CardDescription>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                      <Badge className={getRatingColor(place.avg_overall_rating)}>
                        ⭐ {place.avg_overall_rating?.toFixed(1) || "N/A"}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {place.review_count}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  onClick={(e) =>
                    handleAccessibleClick(
                      e.currentTarget,
                      () => viewPlaceDetails(place),
                      `Details für ${place.name} anzeigen`,
                    )
                  }
                  className="pt-0"
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: "Rollstuhl", value: place.avg_wheelchair_access },
                      { label: "Eingang", value: place.avg_entrance_access },
                      { label: "Toiletten", value: place.avg_bathroom_access },
                      { label: "Tische", value: place.avg_table_height },
                      { label: "Personal", value: place.avg_staff_helpfulness },
                    ]
                      .filter((item) => item.value)
                      .slice(0, 4)
                      .map((item, index) => (
                        <div key={index} className="text-center">
                          <p className="text-muted-foreground text-xs">{item.label}</p>
                          <p className="font-medium">{item.value?.toFixed(1) || "N/A"}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
