"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PixelCard, PixelButton, PixelBadge, pixelColors } from "@/components/pixel-ui"
import { MapPin, Star, Zap, Gift, Navigation, Target } from "lucide-react"
import { useJoyMode } from "@/components/joy-mode"

interface CollectiblePoint {
  id: string
  x: number
  y: number
  value: number
  type: "common" | "rare" | "legendary"
  collected: boolean
  spawnTime: number
}

interface UserPosition {
  x: number
  y: number
  accuracy: number
}

export function InteractiveMap() {
  const { isJoyModeActive, addPoints } = useJoyMode()
  const [collectiblePoints, setCollectiblePoints] = useState<CollectiblePoint[]>([])
  const [userPosition, setUserPosition] = useState<UserPosition>({ x: 50, y: 50, accuracy: 10 })
  const [mapZoom, setMapZoom] = useState(1)
  const [totalCollected, setTotalCollected] = useState(0)
  const mapRef = useRef<HTMLDivElement>(null)

  const pointTypes = {
    common: { color: "#4CAF50", value: 5, chance: 0.7, icon: "⭐" },
    rare: { color: "#2196F3", value: 15, chance: 0.25, icon: "💎" },
    legendary: { color: "#FF9800", value: 50, chance: 0.05, icon: "👑" }
  }

  // Simulate user position updates (in real app, this would use GPS)
  useEffect(() => {
    if (!isJoyModeActive) return

    const interval = setInterval(() => {
      setUserPosition(prev => ({
        x: Math.max(5, Math.min(95, prev.x + (Math.random() - 0.5) * 2)),
        y: Math.max(5, Math.min(95, prev.y + (Math.random() - 0.5) * 2)),
        accuracy: Math.random() * 10 + 5
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isJoyModeActive])

  // Spawn collectible points randomly
  useEffect(() => {
    if (!isJoyModeActive) return

    const spawnInterval = setInterval(() => {
      if (collectiblePoints.length < 8) {
        const rand = Math.random()
        let type: "common" | "rare" | "legendary" = "common"
        
        if (rand < pointTypes.legendary.chance) type = "legendary"
        else if (rand < pointTypes.rare.chance + pointTypes.legendary.chance) type = "rare"

        const newPoint: CollectiblePoint = {
          id: `point-${Date.now()}-${Math.random()}`,
          x: Math.random() * 90 + 5,
          y: Math.random() * 90 + 5,
          value: pointTypes[type].value,
          type,
          collected: false,
          spawnTime: Date.now()
        }

        setCollectiblePoints(prev => [...prev, newPoint])
      }
    }, 3000)

    return () => clearInterval(spawnInterval)
  }, [isJoyModeActive, collectiblePoints.length])

  // Remove old uncollected points
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setCollectiblePoints(prev => 
        prev.filter(point => Date.now() - point.spawnTime < 60000) // Remove after 1 minute
      )
    }, 10000)

    return () => clearInterval(cleanupInterval)
  }, [])

  const collectPoint = (pointId: string) => {
    const point = collectiblePoints.find(p => p.id === pointId)
    if (!point || point.collected) return

    const distance = Math.sqrt(
      Math.pow(userPosition.x - point.x, 2) + Math.pow(userPosition.y - point.y, 2)
    )

    if (distance <= 5) { // Collection radius
      setCollectiblePoints(prev => 
        prev.map(p => p.id === pointId ? { ...p, collected: true } : p)
      )
      
      addPoints(point.value, 'review')
      setTotalCollected(prev => prev + 1)

      // Remove collected point after animation
      setTimeout(() => {
        setCollectiblePoints(prev => prev.filter(p => p.id !== pointId))
      }, 1000)
    }
  }

  const simulateMovement = (direction: "up" | "down" | "left" | "right") => {
    setUserPosition(prev => {
      const step = 3
      switch (direction) {
        case "up": return { ...prev, y: Math.max(5, prev.y - step) }
        case "down": return { ...prev, y: Math.min(95, prev.y + step) }
        case "left": return { ...prev, x: Math.max(5, prev.x - step) }
        case "right": return { ...prev, x: Math.min(95, prev.x + step) }
        default: return prev
      }
    })
  }

  if (!isJoyModeActive) {
    return (
      <PixelCard variant="outlined" color="secondary" className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600">Karte nicht verfügbar</h3>
          <p className="text-sm text-gray-500">
            Aktiviere den Joy Mode, um sammelbare Punkte auf der Karte zu finden! 🗺️✨
          </p>
        </div>
      </PixelCard>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Punkt-Sammler Karte</h3>
        </div>
        <div className="flex items-center space-x-2">
          <PixelBadge color="success" size="small">
            {totalCollected} gesammelt
          </PixelBadge>
          <PixelBadge color="primary" size="small">
            {collectiblePoints.filter(p => !p.collected).length} verfügbar
          </PixelBadge>
        </div>
      </div>

      {/* Interactive Map */}
      <PixelCard variant="elevated" className="relative overflow-hidden">
        <div 
          ref={mapRef}
          className="relative w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl overflow-hidden"
          style={{ transform: `scale(${mapZoom})` }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-gray-300" style={{ top: `${i * 10}%` }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-gray-300" style={{ left: `${i * 10}%` }} />
            ))}
          </div>

          {/* Collectible Points */}
          <AnimatePresence>
            {collectiblePoints.map(point => (
              <motion.div
                key={point.id}
                className="absolute cursor-pointer"
                style={{ 
                  left: `${point.x}%`, 
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: point.collected ? 0 : 1, 
                  opacity: point.collected ? 0 : 1,
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                onClick={() => collectPoint(point.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ backgroundColor: pointTypes[point.type].color }}
                >
                  {pointTypes[point.type].icon}
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* User Position */}
          <motion.div
            className="absolute"
            style={{ 
              left: `${userPosition.x}%`, 
              top: `${userPosition.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Collection Radius Indicator */}
          <motion.div
            className="absolute border-2 border-blue-300 rounded-full opacity-30"
            style={{ 
              left: `${userPosition.x}%`, 
              top: `${userPosition.y}%`,
              width: '10%',
              height: '10%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <PixelButton size="small" variant="fab" color="secondary" onClick={() => setMapZoom(prev => Math.min(2, prev + 0.2))}>
            +
          </PixelButton>
          <PixelButton size="small" variant="fab" color="secondary" onClick={() => setMapZoom(prev => Math.max(0.5, prev - 0.2))}>
            -
          </PixelButton>
        </div>

        {/* Movement Controls */}
        <div className="absolute bottom-4 right-4">
          <div className="grid grid-cols-3 gap-1">
            <div></div>
            <PixelButton size="small" variant="fab" color="primary" onClick={() => simulateMovement("up")}>
              ↑
            </PixelButton>
            <div></div>
            <PixelButton size="small" variant="fab" color="primary" onClick={() => simulateMovement("left")}>
              ←
            </PixelButton>
            <div className="w-8 h-8 bg-blue-600/20 rounded-full"></div>
            <PixelButton size="small" variant="fab" color="primary" onClick={() => simulateMovement("right")}>
              →
            </PixelButton>
            <div></div>
            <PixelButton size="small" variant="fab" color="primary" onClick={() => simulateMovement("down")}>
              ↓
            </PixelButton>
            <div></div>
          </div>
        </div>
      </PixelCard>

      {/* Point Legend */}
      <PixelCard variant="outlined" color="secondary">
        <div className="p-4">
          <h4 className="font-semibold mb-3 text-sm">Punkt-Typen</h4>
          <div className="grid grid-cols-3 gap-4 text-xs">
            {Object.entries(pointTypes).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: config.color }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-medium capitalize">{type}</div>
                  <div className="text-gray-500">+{config.value} Punkte</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PixelCard>

      {/* Instructions */}
      <PixelCard variant="filled" color="primary">
        <div className="p-4 text-center">
          <p className="text-sm opacity-90">
            💡 Bewege dich zu den farbigen Punkten, um sie zu sammeln! 
            Neue Punkte erscheinen alle paar Sekunden.
          </p>
        </div>
      </PixelCard>
    </div>
  )
}