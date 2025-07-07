"use client"

import { useState } from "react"
import { supabase, type ReportReason, type ContentType } from "@/lib/supabase"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface ReportButtonProps {
  contentType: ContentType
  contentId: string
  reportedUserId?: string
  currentUserId?: string
  className?: string
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'inappropriate_content',
    label: 'Unangemessener Inhalt',
    description: 'Enthält anstößige oder unpassende Inhalte'
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Wiederholte oder unerwünschte Inhalte'
  },
  {
    value: 'harassment',
    label: 'Belästigung',
    description: 'Belästigt oder bedroht andere Nutzer'
  },
  {
    value: 'false_information',
    label: 'Falsche Informationen',
    description: 'Enthält falsche oder irreführende Informationen'
  },
  {
    value: 'hate_speech',
    label: 'Hassrede',
    description: 'Diskriminierende oder hasserfüllte Sprache'
  },
  {
    value: 'other',
    label: 'Sonstiges',
    description: 'Anderer Grund (bitte beschreiben)'
  }
]

export function ReportButton({ 
  contentType, 
  contentId, 
  reportedUserId, 
  currentUserId,
  className = ""
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { handleAccessibleClick, announceAction } = useAccessibilityMode()

  if (!currentUserId || currentUserId === reportedUserId) {
    return null
  }

  const handleSubmit = async () => {
    if (!selectedReason || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reported_content_type: contentType,
          reported_content_id: contentId,
          reporter_user_id: currentUserId,
          reported_user_id: reportedUserId || null,
          reason: selectedReason,
          description: description.trim() || null
        })

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - already reported
          throw new Error('Sie haben diesen Inhalt bereits gemeldet.')
        }
        throw error
      }

      setIsSubmitted(true)
      if (announceAction) {
        announceAction('Meldung erfolgreich eingereicht. Vielen Dank für Ihr Feedback.')
      }

    } catch (error: any) {
      console.error('Error submitting report:', error)
      if (announceAction) {
        announceAction(error.message || 'Fehler beim Senden der Meldung. Bitte versuchen Sie es erneut.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-sm text-green-600 dark:text-green-400">
        ✅ Gemeldet
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={(e) => handleAccessibleClick(
          e.currentTarget,
          () => setIsOpen(true),
          "Inhalt melden"
        )}
        className={`text-xs text-muted-foreground hover:text-red-600 transition-colors ${className}`}
        aria-label="Inhalt melden"
      >
        📢 Melden
      </button>
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Inhalt melden</h3>
        <button
          onClick={(e) => handleAccessibleClick(
            e.currentTarget,
            () => setIsOpen(false),
            "Schließen"
          )}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Grund der Meldung:</label>
          <div className="space-y-2 mt-2">
            {REPORT_REASONS.map((reason) => (
              <label key={reason.value} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-medium">{reason.label}</div>
                  <div className="text-xs text-muted-foreground">{reason.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedReason === 'other' && (
          <div>
            <label className="text-sm font-medium">Beschreibung:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bitte beschreiben Sie den Grund für die Meldung..."
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={(e) => handleAccessibleClick(
              e.currentTarget,
              handleSubmit,
              "Meldung senden"
            )}
            disabled={!selectedReason || isSubmitting}
            className={`
              px-4 py-2 text-sm rounded-md transition-colors
              ${!selectedReason || isSubmitting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
              }
            `}
          >
            {isSubmitting ? 'Senden...' : 'Melden'}
          </button>
          
          <button
            onClick={(e) => handleAccessibleClick(
              e.currentTarget,
              () => setIsOpen(false),
              "Abbrechen"
            )}
            className="px-4 py-2 text-sm border rounded-md hover:bg-accent"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}