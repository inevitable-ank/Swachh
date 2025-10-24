"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { 
  Star, 
  Trophy, 
  Target, 
  ThumbsUp, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react"
import { motion } from "framer-motion"

interface UserStats {
  totalIssues: number
  totalVotes: number
  points: number
  badges: string[]
  rank?: number
  issuesResolved: number
  recentActivity: {
    type: string
    description: string
    points: number
    date: string
  }[]
}

const badgeConfig = {
  "First Issue": { 
    icon: "🎯", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Reported your first issue"
  },
  "Community Helper": { 
    icon: "🤝", 
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    description: "Voted on 10+ issues"
  },
  "Issue Hunter": { 
    icon: "🔍", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    description: "Reported 5+ issues"
  },
  "Resolution Champion": { 
    icon: "🏆", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    description: "Had 3+ issues resolved"
  },
  "Voting Master": { 
    icon: "🗳️", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    description: "Voted on 25+ issues"
  },
  "Local Hero": { 
    icon: "🦸", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    description: "Earned 100+ points"
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching user stats:", error)
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
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
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
          My Profile
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track your civic engagement and community impact
        </p>
      </motion.div>


      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{user?.name}</CardTitle>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-3xl font-bold text-yellow-600">
                  <Star className="h-8 w-8" />
                  {stats?.points || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Issues Reported
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIssues || 0}</div>
            <p className="text-xs text-muted-foreground">Community contributions</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Votes Cast
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <ThumbsUp className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVotes || 0}</div>
            <p className="text-xs text-muted-foreground">Democratic participation</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Issues Resolved
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.issuesResolved || 0}</div>
            <p className="text-xs text-muted-foreground">Positive impact</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Achievements & Badges
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Earn badges by contributing to your community
            </p>
          </CardHeader>
          <CardContent>
            {stats?.badges && (stats.badges || []).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(stats.badges || []).map((badge, index) => {
                  const config = badgeConfig[badge as keyof typeof badgeConfig]
                  return (
                    <motion.div
                      key={badge}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-card/50"
                    >
                      <div className="text-2xl">{config?.icon || "🏆"}</div>
                      <div className="flex-1">
                        <div className="font-medium">{badge}</div>
                        <div className="text-sm text-muted-foreground">
                          {config?.description || "Community achievement"}
                        </div>
                      </div>
                      <Badge className={config?.color || "bg-gray-100 text-gray-800"}>
                        Earned
                      </Badge>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No badges yet</h3>
                <p className="text-muted-foreground">
                  Start contributing to earn your first badge!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your latest contributions to the community
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Star className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+{activity.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
