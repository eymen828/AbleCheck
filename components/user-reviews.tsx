
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  MessageSquare, 
  Trash2, 
  Edit, 
  MapPin, 
  Star,
  Shield,
  AlertCircle,
  Calendar
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Review } from "@/lib/supabase"
import Link from "next/link"

interface UserReviewsProps {
  user: any
}

interface ReviewWithPlace extends Review {
  place: {
    name: string
    address: string | null
  }
}

export function UserReviews({ user }: UserReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      loadUserReviews()
    }
  }, [user, isOpen])

  const loadUserReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          places(name, address)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
    } catch (error: any) {
      console.error('Fehler beim Laden der Bewertungen:', error)
      setError('Fehler beim Laden Ihrer Bewertungen')
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      setDeleting(reviewId)
      setError(null)

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id) // Sicherheit: nur eigene Bewertungen löschen

      if (error) throw error

      // Entferne aus der lokalen Liste
      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (error: any) {
      console.error('Fehler beim Löschen der Bewertung:', error)
      setError('Fehler beim Löschen der Bewertung')
    } finally {
      setDeleting(null)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Meine Bewertungen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Meine Bewertungen
          </DialogTitle>
          <DialogDescription>
            Verwalten Sie Ihre abgegebenen Bewertungen.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Lade Bewertungen...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Bewertungen</h3>
            <p className="text-muted-foreground">Sie haben noch keine Bewertungen abgegeben.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        <Link 
                          href={`/place/${review.place_id}`}
                          className="hover:underline"
                          onClick={() => setIsOpen(false)}
                        >
                          {review.place.name}
                        </Link>
                      </CardTitle>
                      {review.place.address && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {review.place.address}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {review.check_in_verified && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Check-In
                        </Badge>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={deleting === review.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bewertung löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie diese Bewertung löschen möchten? 
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteReview(review.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">
                        {calculateOverallRating(review).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.created_at)}
                    </div>
                  </div>

                  {/* Rating Details */}
                  <div className="grid grid-cols-5 gap-2 mb-3 text-xs">
                    {[
                      { label: 'Rollstuhl', value: review.wheelchair_access },
                      { label: 'Eingang', value: review.entrance_access },
                      { label: 'WC', value: review.bathroom_access },
                      { label: 'Tische', value: review.table_height },
                      { label: 'Personal', value: review.staff_helpfulness },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <p className="text-muted-foreground">{item.label}</p>
                        <p className="font-medium">
                          {item.value > 0 ? item.value.toFixed(1) : 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Comments */}
                  {review.comments && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{review.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
