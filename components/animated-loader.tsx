"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function BounceLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            y: [-10, 10, -10],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function PulseRings({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-12 h-12 ${className}`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-purple-400"
          animate={{
            scale: [0.8, 2, 0.8],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
    </div>
  )
}

export function WaveSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="w-1 h-8 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-full"
          animate={{
            scaleY: [0.5, 1.5, 0.5],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export function RotatingPlanet({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <motion.div
        className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-2 left-2 w-3 h-3 bg-yellow-400 rounded-full"
        animate={{ 
          rotate: -360,
          x: [0, 24, 0, -24, 0],
          y: [0, 12, 24, 12, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

export function AnimatedSkeleton({ 
  className = "",
  gradient = "from-purple-100 to-pink-100" 
}: { 
  className?: string
  gradient?: string
}) {
  return (
    <motion.div
      className={`bg-gradient-to-r ${gradient} rounded ${className}`}
      animate={{ 
        opacity: [0.5, 1, 0.5],
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ backgroundSize: "200% 200%" }}
    />
  )
}

export function PlayfulCardLoader({ delay = 0 }: { delay?: number }) {
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
    >
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <PulseRings className="w-8 h-8" />
            <div className="flex-1 space-y-2">
              <AnimatedSkeleton className="h-4 w-3/4" />
              <AnimatedSkeleton className="h-3 w-1/2" gradient="from-purple-200 to-pink-200" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatedSkeleton className="h-3 w-full" />
            <AnimatedSkeleton className="h-3 w-2/3" gradient="from-blue-100 to-cyan-100" />
            <div className="flex justify-center pt-2">
              <BounceLoader />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ShimmerEffect({ children, className = "" }: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["0%", "200%"] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }}
        />
      </div>
      {children}
    </div>
  )
}

export function FloatingElements({ children }: { children: React.ReactNode }) {
  const elements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 3,
    color: ['bg-purple-300', 'bg-pink-300', 'bg-blue-300', 'bg-cyan-300', 'bg-yellow-300'][Math.floor(Math.random() * 5)]
  }))

  return (
    <div className="relative">
      {/* Floating background elements */}
      {elements.map(element => (
        <motion.div
          key={element.id}
          className={`absolute ${element.color} rounded-full opacity-20`}
          style={{ 
            left: `${element.x}%`, 
            top: `${element.y}%`,
            width: element.size,
            height: element.size
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      {children}
    </div>
  )
}