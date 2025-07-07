"use client"

import { Profile } from "@/lib/supabase"

interface VerifiedBadgeProps {
  profile: Profile | null
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function VerifiedBadge({ 
  profile, 
  size = "md", 
  showText = false,
  className = "" 
}: VerifiedBadgeProps) {
  if (!profile?.is_verified) {
    return null
  }

  const sizeClasses = {
    sm: "h-4 w-4 text-xs px-1.5 py-0.5",
    md: "h-5 w-5 text-sm px-2 py-1",
    lg: "h-6 w-6 text-base px-3 py-1.5"
  }

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  }

  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        bg-blue-100 text-blue-800 border border-blue-200 rounded-full
        dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700
        ${sizeClasses[size]} 
        ${className}
      `}
      title={`Verifizierter Benutzer${profile.verification_reason ? ` - ${profile.verification_reason}` : ''}`}
    >
      🛡️
      {showText && <span>Verifiziert</span>}
    </span>
  )
}