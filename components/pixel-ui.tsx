"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Google Pixel Material Design 3 Color Palette
export const pixelColors = {
  primary: {
    main: "#6750A4",
    container: "#EADDFF",
    onContainer: "#21005D",
    surface: "#FEF7FF",
  },
  secondary: {
    main: "#625B71",
    container: "#E8DEF8", 
    onContainer: "#1D192B",
  },
  tertiary: {
    main: "#7D5260",
    container: "#FFD8E4",
    onContainer: "#31111D",
  },
  success: {
    main: "#006C4C",
    container: "#89F8C7",
    onContainer: "#002114",
  },
  warning: {
    main: "#8C5000",
    container: "#FFDCC2",
    onContainer: "#2D1600",
  },
  error: {
    main: "#BA1A1A",
    container: "#FFDAD6",
    onContainer: "#410002",
  }
}

interface PixelCardProps {
  children: ReactNode
  className?: string
  variant?: "filled" | "elevated" | "outlined"
  color?: keyof typeof pixelColors
  animate?: boolean
}

export function PixelCard({ 
  children, 
  className = "", 
  variant = "filled",
  color = "primary",
  animate = true 
}: PixelCardProps) {
  const colorScheme = pixelColors[color]
  
  const variantStyles = {
    filled: `bg-[${colorScheme.container}] text-[${colorScheme.onContainer}] border-0`,
    elevated: "bg-white shadow-lg shadow-black/10 border-0",
    outlined: `border-2 border-[${colorScheme.main}]/20 bg-white`
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={animate ? { opacity: 1, y: 0, scale: 1 } : false}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] // Google's easing curve
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        "rounded-3xl", // Google's rounded corners
        variantStyles[variant],
        className
      )}>
        {children}
      </Card>
    </motion.div>
  )
}

interface PixelButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "filled" | "outlined" | "text" | "fab"
  color?: keyof typeof pixelColors
  size?: "small" | "medium" | "large"
  icon?: ReactNode
  className?: string
  disabled?: boolean
}

export function PixelButton({
  children,
  onClick,
  variant = "filled",
  color = "primary",
  size = "medium",
  icon,
  className = "",
  disabled = false
}: PixelButtonProps) {
  const colorScheme = pixelColors[color]
  
  const sizeStyles = {
    small: "px-4 py-2 text-sm min-h-[40px]",
    medium: "px-6 py-3 text-base min-h-[48px]",
    large: "px-8 py-4 text-lg min-h-[56px]"
  }
  
  const variantStyles = {
    filled: `bg-[${colorScheme.main}] text-white hover:shadow-lg`,
    outlined: `border-2 border-[${colorScheme.main}] text-[${colorScheme.main}] bg-transparent hover:bg-[${colorScheme.main}]/5`,
    text: `text-[${colorScheme.main}] bg-transparent hover:bg-[${colorScheme.main}]/5`,
    fab: `bg-[${colorScheme.container}] text-[${colorScheme.onContainer}] rounded-full shadow-lg`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "rounded-full font-medium transition-all duration-200",
          "active:scale-95 disabled:opacity-50",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
      >
        {icon && (
          <motion.div
            className="mr-2"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {icon}
          </motion.div>
        )}
        {children}
      </Button>
    </motion.div>
  )
}

interface PixelBadgeProps {
  children: ReactNode
  variant?: "filled" | "outlined"
  color?: keyof typeof pixelColors
  size?: "small" | "medium" | "large"
  animate?: boolean
  className?: string
}

export function PixelBadge({
  children,
  variant = "filled",
  color = "primary",
  size = "medium",
  animate = true,
  className = ""
}: PixelBadgeProps) {
  const colorScheme = pixelColors[color]
  
  const sizeStyles = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1.5 text-sm", 
    large: "px-4 py-2 text-base"
  }
  
  const variantStyles = {
    filled: `bg-[${colorScheme.main}] text-white`,
    outlined: `border-2 border-[${colorScheme.main}] text-[${colorScheme.main}] bg-transparent`
  }

  return (
    <motion.div
      initial={animate ? { scale: 0, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 25,
        delay: 0.1
      }}
    >
      <Badge className={cn(
        "rounded-full font-medium",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}>
        {children}
      </Badge>
    </motion.div>
  )
}

export function GoogleWaveLoader({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="w-1 h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"
          animate={{
            scaleY: [0.5, 1.2, 0.5],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      ))}
    </div>
  )
}

export function MaterialRipple({ children, className = "" }: { 
  children: ReactNode
  className?: string
}) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const addRipple = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const newRipple = { id: Date.now(), x, y }
    
    setRipples(prev => [...prev, newRipple])
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      onMouseDown={addRipple}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute bg-white/20 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 50, height: 50, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export function PixelProgressBar({ 
  progress, 
  color = "primary",
  className = ""
}: { 
  progress: number
  color?: keyof typeof pixelColors
  className?: string
}) {
  const colorScheme = pixelColors[color]
  
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <motion.div
        className={`h-2 rounded-full bg-[${colorScheme.main}]`}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ 
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      />
    </div>
  )
}

export function FloatingActionButton({ 
  children, 
  onClick,
  color = "primary",
  className = ""
}: {
  children: ReactNode
  onClick?: () => void
  color?: keyof typeof pixelColors
  className?: string
}) {
  const colorScheme = pixelColors[color]
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg",
        `bg-[${colorScheme.main}] text-white`,
        "flex items-center justify-center z-50",
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ 
        y: [0, -10, 0],
        boxShadow: [
          "0 4px 20px rgba(0,0,0,0.1)",
          "0 8px 30px rgba(0,0,0,0.2)", 
          "0 4px 20px rgba(0,0,0,0.1)"
        ]
      }}
      transition={{ 
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {children}
    </motion.button>
  )
}

export function PixelSearchBar({ 
  value, 
  onChange,
  placeholder = "Search...",
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [focused, setFocused] = useState(false)
  
  return (
    <motion.div
      className={cn(
        "relative rounded-full bg-white border-2 transition-all duration-200",
        focused ? "border-blue-600 shadow-lg" : "border-gray-200",
        className
      )}
      animate={{ 
        scale: focused ? 1.02 : 1,
        boxShadow: focused ? "0 8px 30px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.05)"
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-6 py-4 bg-transparent rounded-full outline-none text-gray-800 placeholder:text-gray-500"
      />
      <motion.div
        className="absolute right-4 top-1/2 transform -translate-y-1/2"
        animate={{ rotate: focused ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        🔍
      </motion.div>
    </motion.div>
  )
}