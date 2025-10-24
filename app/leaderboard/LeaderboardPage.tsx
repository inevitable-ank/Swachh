"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown,
  Target,
  ThumbsUp,
  Users,
  TrendingUp
} from "lucide-react"
import { motion } from "framer-motion"

interface LeaderboardUser {
  id: string
  name: string
  email: string
  points: number
  badges: string[]
  totalIssues: number
  totalVotes: number
  rank: number
}

const rankIcons = {
  1: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  2: { icon: Trophy, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-900/20" },
  3: { icon: Medal, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" }
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/leaderboard")
      if (!response.ok) throw new Error("Failed to fetch leaderboard")
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Community Leaderboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Top contributors making a difference in your community
        </p>
      </motion.div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          {/* 2nd Place */}
          {leaderboard[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="order-2 md:order-1"
            >
              <Card className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                <div className="absolute top-0 right-4 text-6xl opacity-20">🥈</div>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                    <Trophy className="h-8 w-8 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">2nd Place</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <h3 className="font-semibold text-lg">{leaderboard[1].name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{leaderboard[1].points}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    {(leaderboard[1].badges || []).slice(0, 3).map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="order-1 md:order-2"
            >
              <Card className="relative overflow-hidden border-2 border-yellow-300 dark:border-yellow-600 bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                <div className="absolute top-0 right-4 text-6xl opacity-30">👑</div>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                    <Crown className="h-10 w-10 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl text-yellow-700 dark:text-yellow-300">1st Place</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <h3 className="font-bold text-xl text-yellow-800 dark:text-yellow-200">{leaderboard[0].name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-3xl font-bold text-yellow-600">{leaderboard[0].points}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    {(leaderboard[0].badges || []).slice(0, 3).map((badge, index) => (
                      <Badge key={index} className="text-xs bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="order-3"
            >
              <Card className="relative overflow-hidden border-2 border-orange-200 dark:border-orange-700">
                <div className="absolute top-0 right-4 text-6xl opacity-20">🥉</div>
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                    <Medal className="h-8 w-8 text-orange-500" />
                  </div>
                  <CardTitle className="text-lg">3rd Place</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <h3 className="font-semibold text-lg">{leaderboard[2].name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{leaderboard[2].points}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    {(leaderboard[2].badges || []).slice(0, 3).map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Complete Rankings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              All community contributors ranked by points
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {leaderboard.map((user, index) => {
                const isCurrentUser = user.id === user?.id
                const rankConfig = rankIcons[user.rank as keyof typeof rankIcons]
                const RankIcon = rankConfig?.icon || TrendingUp
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                      isCurrentUser 
                        ? "bg-primary/10 border-2 border-primary/20" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        rankConfig?.bg || "bg-muted"
                      }`}>
                        {user.rank <= 3 ? (
                          <RankIcon className={`h-5 w-5 ${rankConfig?.color || "text-muted-foreground"}`} />
                        ) : (
                          <span className="font-bold text-muted-foreground">#{user.rank}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          {isCurrentUser && (
                            <Badge variant="default" className="text-xs">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {user.totalIssues} issues
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {user.totalVotes} votes
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-xl font-bold">{user.points}</span>
                        <span className="text-sm text-muted-foreground">pts</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {(user.badges || []).slice(0, 2).map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        {(user.badges || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(user.badges || []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
