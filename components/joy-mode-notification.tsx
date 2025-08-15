"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Star, 
  Zap, 
  Award, 
  Sparkles,
  CheckCircle,
  X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: string
  type: 'points' | 'achievement' | 'level-up'
  title: string
  description: string
  points?: number
  icon: React.ReactNode
  duration?: number
}

interface JoyModeNotificationProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function JoyModeNotification({ notifications, onDismiss }: JoyModeNotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              duration: 0.6
            }}
          >
            <Card className={`
              border-2 shadow-lg
              ${notification.type === 'achievement' ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
              ${notification.type === 'level-up' ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50' : ''}
              ${notification.type === 'points' ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50' : ''}
            `}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <motion.div 
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${notification.type === 'achievement' ? 'bg-yellow-100' : ''}
                      ${notification.type === 'level-up' ? 'bg-purple-100' : ''}
                      ${notification.type === 'points' ? 'bg-blue-100' : ''}
                    `}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  >
                    {notification.icon}
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <motion.h4 
                      className="font-semibold text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {notification.title}
                    </motion.h4>
                    <motion.p 
                      className="text-xs text-muted-foreground mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {notification.description}
                    </motion.p>
                    {notification.points && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="mt-2"
                      >
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gradient-to-r from-yellow-200 to-orange-200"
                        >
                          +{notification.points} Punkte
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                    onClick={() => onDismiss(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Confetti animation component
export function ConfettiEffect({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  useEffect(() => {
    if (show && onComplete) {
      const timeout = setTimeout(onComplete, 3000)
      return () => clearTimeout(timeout)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 6],
            left: `${Math.random() * 100}%`,
            top: '-10px'
          }}
          initial={{ y: -10, rotate: 0 }}
          animate={{ 
            y: window.innerHeight + 10,
            rotate: 360,
            x: Math.random() * 200 - 100
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

// Hook to manage notifications
export function useJoyModeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto-dismiss after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      dismissNotification(id)
    }, duration)

    // Show confetti for achievements and level ups
    if (notification.type === 'achievement' || notification.type === 'level-up') {
      setShowConfetti(true)
    }
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showPointsNotification = (points: number, type: 'review' | 'checkin') => {
    addNotification({
      type: 'points',
      title: '🎉 Punkte erhalten!',
      description: type === 'checkin' 
        ? 'Danke für deine Check-In Bewertung!' 
        : 'Danke für deine Bewertung!',
      points,
      icon: <Zap className="h-5 w-5 text-blue-600" />
    })
  }

  const showAchievementNotification = (title: string, description: string, points: number) => {
    addNotification({
      type: 'achievement',
      title: `🏆 ${title} freigeschaltet!`,
      description,
      points,
      icon: <Trophy className="h-5 w-5 text-yellow-600" />,
      duration: 7000
    })
  }

  const showLevelUpNotification = (newLevel: number) => {
    addNotification({
      type: 'level-up',
      title: `🚀 Level ${newLevel} erreicht!`,
      description: 'Du wirst immer besser!',
      icon: <Star className="h-5 w-5 text-purple-600" />,
      duration: 6000
    })
  }

  return {
    notifications,
    dismissNotification,
    showPointsNotification,
    showAchievementNotification,
    showLevelUpNotification,
    showConfetti,
    setShowConfetti,
    ConfettiComponent: () => (
      <ConfettiEffect 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    )
  }
}