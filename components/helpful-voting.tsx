"use client"

import { useState } from "react"
import { supabase, type ReviewVote, type ExtendedReview } from "@/lib/supabase"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface HelpfulVotingProps {
  review: ExtendedReview
  currentUserId?: string
  onVoteChange?: (helpful_count: number, not_helpful_count: number) => void
}

export function HelpfulVoting({ review, currentUserId, onVoteChange }: HelpfulVotingProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState<boolean | null>(review.user_vote || null)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0)
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.not_helpful_count || 0)
  const { handleAccessibleClick, announceAction } = useAccessibilityMode()

  if (!currentUserId || currentUserId === review.user_id || review.is_anonymous) {
    // Don't show voting for anonymous reviews, own reviews, or when not logged in
    if (helpfulCount > 0 || notHelpfulCount > 0) {
      return (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {helpfulCount > 0 && (
            <span className="flex items-center gap-1">
              👍 {helpfulCount}
            </span>
          )}
          {notHelpfulCount > 0 && (
            <span className="flex items-center gap-1">
              👎 {notHelpfulCount}
            </span>
          )}
        </div>
      )
    }
    return null
  }

  const handleVote = async (isHelpful: boolean) => {
    if (isVoting) return
    
    setIsVoting(true)
    
    try {
      // If user already voted the same way, remove the vote
      if (userVote === isHelpful) {
        const { error } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', currentUserId)

        if (error) throw error

        setUserVote(null)
        if (isHelpful) {
          setHelpfulCount(prev => Math.max(0, prev - 1))
        } else {
          setNotHelpfulCount(prev => Math.max(0, prev - 1))
        }
        
        if (announceAction) {
          announceAction(`Bewertung entfernt`)
        }
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from('review_votes')
          .upsert({
            review_id: review.id,
            user_id: currentUserId,
            is_helpful: isHelpful
          })

        if (error) throw error

        // Update counts based on previous vote
        if (userVote !== null) {
          // User changed their vote
          if (userVote) {
            setHelpfulCount(prev => Math.max(0, prev - 1))
            setNotHelpfulCount(prev => prev + 1)
          } else {
            setNotHelpfulCount(prev => Math.max(0, prev - 1))
            setHelpfulCount(prev => prev + 1)
          }
        } else {
          // New vote
          if (isHelpful) {
            setHelpfulCount(prev => prev + 1)
          } else {
            setNotHelpfulCount(prev => prev + 1)
          }
        }

        setUserVote(isHelpful)
        
        if (announceAction) {
          announceAction(`Als ${isHelpful ? 'hilfreich' : 'nicht hilfreich'} bewertet`)
        }
      }

      // Notify parent component
      if (onVoteChange) {
        onVoteChange(helpfulCount, notHelpfulCount)
      }

    } catch (error) {
      console.error('Error voting on review:', error)
      if (announceAction) {
        announceAction('Fehler beim Bewerten. Bitte versuchen Sie es erneut.')
      }
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">War diese Bewertung hilfreich?</span>
      
      <div className="flex items-center gap-2">
        {/* Helpful Button */}
        <button
          onClick={(e) => handleAccessibleClick(
            e.currentTarget,
            () => handleVote(true),
            `Als hilfreich bewerten${userVote === true ? ' - bereits bewertet' : ''}`
          )}
          disabled={isVoting}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md border transition-colors
            ${userVote === true 
              ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200' 
              : 'bg-background border-border hover:bg-accent text-muted-foreground hover:text-foreground'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={`Als hilfreich bewerten${userVote === true ? ' - bereits bewertet' : ''}`}
        >
          👍 {helpfulCount}
        </button>

        {/* Not Helpful Button */}
        <button
          onClick={(e) => handleAccessibleClick(
            e.currentTarget,
            () => handleVote(false),
            `Als nicht hilfreich bewerten${userVote === false ? ' - bereits bewertet' : ''}`
          )}
          disabled={isVoting}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md border transition-colors
            ${userVote === false 
              ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200' 
              : 'bg-background border-border hover:bg-accent text-muted-foreground hover:text-foreground'
            }
            ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={`Als nicht hilfreich bewerten${userVote === false ? ' - bereits bewertet' : ''}`}
        >
          👎 {notHelpfulCount}
        </button>
      </div>
    </div>
  )
}