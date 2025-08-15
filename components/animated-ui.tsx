"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  gradient?: string
}

export function AnimatedCard({ children, className = "", delay = 0, hover = true, gradient }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      } : undefined}
      className={className}
    >
      <Card className={`
        ${gradient || 'bg-gradient-to-br from-white to-gray-50'}
        border-2 hover:border-purple-300 transition-all duration-300
        hover:shadow-lg hover:shadow-purple-200/50
        ${className}
      `}>
        {children}
      </Card>
    </motion.div>
  )
}

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "sm" | "default" | "lg"
  className?: string
  gradient?: string
  icon?: ReactNode
}

export function AnimatedButton({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default",
  className = "",
  gradient = "from-purple-500 to-pink-500",
  icon
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button
        onClick={onClick}
        variant={variant}
        size={size}
        className={`
          ${variant === "default" ? `bg-gradient-to-r ${gradient} hover:shadow-lg hover:shadow-purple-300/50` : ""}
          transition-all duration-300 transform
          ${className}
        `}
      >
        {icon && (
          <motion.div
            className="mr-2"
            animate={{ rotate: [0, 10, -10, 0] }}
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

interface AnimatedBadgeProps {
  children: ReactNode
  variant?: "default" | "secondary" | "outline"
  className?: string
  gradient?: string
  pulse?: boolean
}

export function AnimatedBadge({ 
  children, 
  variant = "default", 
  className = "",
  gradient = "from-blue-500 to-cyan-500",
  pulse = false
}: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
    >
      <Badge
        variant={variant}
        className={`
          ${variant === "default" ? `bg-gradient-to-r ${gradient} border-0` : ""}
          ${pulse ? "animate-pulse" : ""}
          transition-all duration-300
          ${className}
        `}
      >
        {children}
      </Badge>
    </motion.div>
  )
}

export function FloatingIcon({ children, delay = 0, amplitude = 10 }: { 
  children: ReactNode
  delay?: number
  amplitude?: number
}) {
  return (
    <motion.div
      animate={{ 
        y: [-amplitude, amplitude, -amplitude],
        rotate: [-5, 5, -5]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

export function SparkleBackground({ children }: { children: ReactNode }) {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2
  }))

  return (
    <div className="relative overflow-hidden">
      {/* Sparkles */}
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      {children}
    </div>
  )
}

export function GradientText({ 
  children, 
  gradient = "from-purple-600 via-pink-600 to-blue-600",
  className = ""
}: { 
  children: ReactNode
  gradient?: string
  className?: string
}) {
  return (
    <motion.span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}
      animate={{ 
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{ backgroundSize: "200% 200%" }}
    >
      {children}
    </motion.span>
  )
}

export function RainbowBorder({ children, className = "" }: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={`relative p-1 rounded-lg ${className}`}
      style={{
        background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd, #ff6b6b)",
        backgroundSize: "400% 400%"
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div className="bg-white rounded-lg">
        {children}
      </div>
    </motion.div>
  )
}

export function PulsingDot({ 
  color = "bg-green-500", 
  size = "w-2 h-2",
  className = ""
}: { 
  color?: string
  size?: string
  className?: string
}) {
  return (
    <motion.div
      className={`${size} ${color} rounded-full ${className}`}
      animate={{ 
        scale: [1, 1.5, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export function WaveLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="w-2 h-6 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function CounterAnimation({ 
  value, 
  duration = 1,
  className = ""
}: { 
  value: number
  duration?: number
  className?: string
}) {
  return (
    <motion.span
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
      key={value}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {value}
      </motion.span>
    </motion.span>
  )
}