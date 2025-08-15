"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award, 
  Gift,
  Heart,
  Sparkles,
  CheckCircle,
  MapPin,
  Users
} from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { JoyModeNotification, useJoyModeNotifications } from "@/components/joy-mode-notification"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  points: number
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface JoyModeStats {
  totalPoints: number
  totalReviews: number
  totalCheckIns: number
  level: number
  achievements: Achievement[]
}

export function JoyMode() {
  const [isJoyModeActive, setIsJoyModeActive] = useLocalStorage('ablecheck-joy-mode', false)
  const [stats, setStats] = useLocalStorage<JoyModeStats>('ablecheck-joy-stats', {
    totalPoints: 0,
    totalReviews: 0,
    totalCheckIns: 0,
    level: 1,
    achievements: []
  })
  
  const {
    notifications,
    dismissNotification,
    showAchievementNotification,
    showLevelUpNotification,
    ConfettiComponent
  } = useJoyModeNotifications()

  const achievements: Achievement[] = [
    {
      id: 'first-review',
      title: 'Erste Bewertung',
      description: 'Deine erste Bewertung für die Barrierefreiheit',
      icon: <Star className="h-4 w-4" />,
      points: 10,
      unlocked: stats.totalReviews >= 1
    },
    {
      id: 'helpful-helper',
      title: 'Hilfreicher Helfer',
      description: '5 Bewertungen abgegeben',
      icon: <Heart className="h-4 w-4" />,
      points: 50,
      unlocked: stats.totalReviews >= 5,
      progress: Math.min(stats.totalReviews, 5),
      maxProgress: 5
    },
    {
      id: 'accessibility-champion',
      title: 'Barrierefreiheits-Champion',
      description: '10 Bewertungen abgegeben',
      icon: <Trophy className="h-4 w-4" />,
      points: 100,
      unlocked: stats.totalReviews >= 10,
      progress: Math.min(stats.totalReviews, 10),
      maxProgress: 10
    },
    {
      id: 'check-in-master',
      title: 'Check-In Meister',
      description: '5 Check-In Bewertungen',
      icon: <MapPin className="h-4 w-4" />,
      points: 75,
      unlocked: stats.totalCheckIns >= 5,
      progress: Math.min(stats.totalCheckIns, 5),
      maxProgress: 5
    },
    {
      id: 'community-builder',
      title: 'Community-Builder',
      description: '25 Bewertungen abgegeben',
      icon: <Users className="h-4 w-4" />,
      points: 250,
      unlocked: stats.totalReviews >= 25,
      progress: Math.min(stats.totalReviews, 25),
      maxProgress: 25
    }
  ]

  const calculateLevel = (points: number): number => {
    return Math.floor(points / 100) + 1
  }

  const getPointsForNextLevel = (currentLevel: number): number => {
    return currentLevel * 100
  }

  const addPoints = (points: number, type: 'review' | 'checkin') => {
    if (!isJoyModeActive) return

    setStats(prev => {
      const newStats = {
        ...prev,
        totalPoints: prev.totalPoints + points,
        totalReviews: type === 'review' ? prev.totalReviews + 1 : prev.totalReviews,
        totalCheckIns: type === 'checkin' ? prev.totalCheckIns + 1 : prev.totalCheckIns
      }
      newStats.level = calculateLevel(newStats.totalPoints)
      return newStats
    })
  }

  const resetStats = () => {
    setStats({
      totalPoints: 0,
      totalReviews: 0,
      totalCheckIns: 0,
      level: 1,
      achievements: []
    })
  }

  if (!isJoyModeActive) {
    return (
      <Card className="mb-6 border-2 border-dashed border-muted-foreground/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Joy Mode aktivieren</CardTitle>
          <CardDescription>
            Verwandle deine Bewertungen in ein spielerisches Erlebnis! 
            Sammle Punkte, schalte Achievements frei und steige im Level auf.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Switch
              id="joy-mode"
              checked={isJoyModeActive}
              onCheckedChange={setIsJoyModeActive}
            />
            <Label htmlFor="joy-mode" className="font-medium">
              Joy Mode aktivieren
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Hilf anderen und hab Spaß dabei! 🎮✨
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <JoyModeNotification notifications={notifications} onDismiss={dismissNotification} />
      <ConfettiComponent />
      
      <div className="space-y-6">
        {/* Header with Toggle */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Joy Mode</CardTitle>
                <CardDescription>Gamification für Barrierefreiheit</CardDescription>
              </div>
            </div>
            <Switch
              checked={isJoyModeActive}
              onCheckedChange={setIsJoyModeActive}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mx-auto mb-2">
              <Zap className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
            <div className="text-xs text-muted-foreground">Punkte</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <Star className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.totalReviews}</div>
            <div className="text-xs text-muted-foreground">Bewertungen</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCheckIns}</div>
            <div className="text-xs text-muted-foreground">Check-Ins</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Level {stats.level}</span>
          </CardTitle>
          <CardDescription>
            {getPointsForNextLevel(stats.level + 1) - stats.totalPoints} Punkte bis Level {stats.level + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, ((stats.totalPoints % 100) / 100) * 100)}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-orange-500" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>
            {achievements.filter(a => a.unlocked).length} von {achievements.length} freigeschaltet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  achievement.unlocked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {achievement.unlocked ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    achievement.icon
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{achievement.title}</div>
                  <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  {achievement.maxProgress && !achievement.unlocked && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {achievement.progress || 0} / {achievement.maxProgress}
                      </div>
                    </div>
                  )}
                </div>
                <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                  {achievement.points} Punkte
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-pink-500" />
            <span>Punkte sammeln</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Standard-Bewertung</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Bewerte die Barrierefreiheit eines Ortes
              </p>
              <Badge variant="secondary">+20 Punkte</Badge>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Check-In Bewertung</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Bewerte vor Ort mit Standortverifikation
              </p>
              <Badge variant="secondary">+50 Punkte</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Controls (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Debug Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addPoints(20, 'review')}
              className="mr-2"
            >
              +20 Punkte (Review)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addPoints(50, 'checkin')}
              className="mr-2"
            >
              +50 Punkte (Check-In)
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={resetStats}
            >
              Stats zurücksetzen
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  )
}

// Hook for other components to use Joy Mode functionality
export function useJoyMode() {
  const [isJoyModeActive] = useLocalStorage('ablecheck-joy-mode', false)
  const [stats, setStats] = useLocalStorage<JoyModeStats>('ablecheck-joy-stats', {
    totalPoints: 0,
    totalReviews: 0,
    totalCheckIns: 0,
    level: 1,
    achievements: []
  })

  const {
    showPointsNotification,
    showAchievementNotification,
    showLevelUpNotification
  } = useJoyModeNotifications()

  const achievements: Achievement[] = [
    {
      id: 'first-review',
      title: 'Erste Bewertung',
      description: 'Deine erste Bewertung für die Barrierefreiheit',
      icon: <Star className="h-4 w-4" />,
      points: 10,
      unlocked: stats.totalReviews >= 1
    },
    {
      id: 'helpful-helper',
      title: 'Hilfreicher Helfer',
      description: '5 Bewertungen abgegeben',
      icon: <Heart className="h-4 w-4" />,
      points: 50,
      unlocked: stats.totalReviews >= 5
    },
    {
      id: 'accessibility-champion',
      title: 'Barrierefreiheits-Champion',
      description: '10 Bewertungen abgegeben',
      icon: <Trophy className="h-4 w-4" />,
      points: 100,
      unlocked: stats.totalReviews >= 10
    },
    {
      id: 'check-in-master',
      title: 'Check-In Meister',
      description: '5 Check-In Bewertungen',
      icon: <MapPin className="h-4 w-4" />,
      points: 75,
      unlocked: stats.totalCheckIns >= 5
    },
    {
      id: 'community-builder',
      title: 'Community-Builder',
      description: '25 Bewertungen abgegeben',
      icon: <Users className="h-4 w-4" />,
      points: 250,
      unlocked: stats.totalReviews >= 25
    }
  ]

  const addPoints = (points: number, type: 'review' | 'checkin') => {
    if (!isJoyModeActive) return

    const oldStats = stats
    const oldLevel = oldStats.level
    const oldAchievements = achievements.filter(a => a.unlocked).map(a => a.id)

    setStats(prev => {
      const newStats = {
        ...prev,
        totalPoints: prev.totalPoints + points,
        totalReviews: type === 'review' ? prev.totalReviews + 1 : prev.totalReviews,
        totalCheckIns: type === 'checkin' ? prev.totalCheckIns + 1 : prev.totalCheckIns
      }
      newStats.level = Math.floor(newStats.totalPoints / 100) + 1
      return newStats
    })

    // Show points notification
    showPointsNotification(points, type)

    // Check for level up (use setTimeout to ensure state has updated)
    setTimeout(() => {
      const newLevel = Math.floor((oldStats.totalPoints + points) / 100) + 1
      if (newLevel > oldLevel) {
        showLevelUpNotification(newLevel)
      }

      // Check for new achievements
      const newTotalReviews = type === 'review' ? oldStats.totalReviews + 1 : oldStats.totalReviews
      const newTotalCheckIns = type === 'checkin' ? oldStats.totalCheckIns + 1 : oldStats.totalCheckIns
      
      const currentAchievements = achievements.map(achievement => ({
        ...achievement,
        unlocked: achievement.id === 'first-review' ? newTotalReviews >= 1 :
                  achievement.id === 'helpful-helper' ? newTotalReviews >= 5 :
                  achievement.id === 'accessibility-champion' ? newTotalReviews >= 10 :
                  achievement.id === 'check-in-master' ? newTotalCheckIns >= 5 :
                  achievement.id === 'community-builder' ? newTotalReviews >= 25 :
                  false
      }))

      const newlyUnlocked = currentAchievements.filter(a => 
        a.unlocked && !oldAchievements.includes(a.id)
      )

      newlyUnlocked.forEach(achievement => {
        showAchievementNotification(achievement.title, achievement.description, achievement.points)
      })
    }, 100)
  }

  return {
    isJoyModeActive,
    stats,
    addPoints
  }
}