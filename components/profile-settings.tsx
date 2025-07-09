
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/supabase"

interface ProfileSettingsProps {
  user: any
  onProfileUpdate?: () => void
}

export function ProfileSettings({ user, onProfileUpdate }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    avatar_url: ""
  })

  useEffect(() => {
    if (user && isOpen) {
      loadProfile()
    }
  }, [user, isOpen])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || ""
        })
      } else {
        // Erstelle Profil wenn es nicht existiert
        setFormData({
          username: "",
          full_name: "",
          avatar_url: ""
        })
      }
    } catch (error: any) {
      console.error('Fehler beim Laden des Profils:', error)
      setError('Fehler beim Laden des Profils')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validierung
      if (formData.username && formData.username.length < 3) {
        setError('Benutzername muss mindestens 3 Zeichen lang sein')
        return
      }

      const profileData = {
        id: user.id,
        username: formData.username || null,
        full_name: formData.full_name || null,
        avatar_url: formData.avatar_url || null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (error) throw error

      setSuccess(true)
      onProfileUpdate?.()
      
      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
      }, 2000)

    } catch (error: any) {
      console.error('Fehler beim Speichern:', error)
      setError('Fehler beim Speichern des Profils')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || ""
      })
    }
    setError(null)
    setSuccess(false)
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          Profil bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Profil bearbeiten
          </DialogTitle>
          <DialogDescription>
            Passen Sie Ihre Profil-Informationen an.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Lade Profil...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback>
                  {formData.full_name ? formData.full_name.substring(0, 2).toUpperCase() : 
                   formData.username ? formData.username.substring(0, 2).toUpperCase() : 
                   user.email ? user.email.substring(0, 2).toUpperCase() : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                />
              </div>
            </div>

            {/* Benutzername */}
            <div>
              <Label htmlFor="username">Benutzername (optional)</Label>
              <Input
                id="username"
                placeholder="Ihr Benutzername"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            {/* Vollständiger Name */}
            <div>
              <Label htmlFor="full_name">Vollständiger Name (optional)</Label>
              <Input
                id="full_name"
                placeholder="Ihr vollständiger Name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Profil erfolgreich gespeichert!</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={saveProfile} 
                disabled={saving}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Speichern...' : 'Speichern'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
