"use client"

import type React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface AccessibleButtonProps extends ButtonProps {
  description?: string
  onAccessibleClick?: () => void
  children: React.ReactNode
}

export function AccessibleButton({
  description,
  onAccessibleClick,
  onClick,
  children,
  ...props
}: AccessibleButtonProps) {
  const { handleAccessibleClick } = useAccessibilityMode()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = onAccessibleClick || (() => onClick?.(e))
    handleAccessibleClick(e.currentTarget, action, description)
  }

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  )
}
