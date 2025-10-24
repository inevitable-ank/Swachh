"use client"

import { StatCard, ModernAreaChart, ModernBarChart, ModernPieChart, ModernLineChart } from "@/components/modern-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart2, CheckCircle, ListTodo, ThumbsUp, TrendingUp, Users, AlertTriangle, Clock, Activity, Target } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnalyticsData {
  issuesByCategory: { name: string; value: number }[]
  last7Days: { date: string; count: number }[]
  topVotedIssues: { id: string; title: string; category: string; votes: number }[]
  totalIssues: number
  totalVotes: number
  openIssues: number
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics")

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }

      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          Civic Issue Analytics
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive insights into community engagement and issue resolution
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-8">
          {/* Loading Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Loading Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="h-80">
                  <Skeleton className="w-full h-full rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Issues"
              value={data.totalIssues}
              change="+12% from last month"
              icon={ListTodo}
              trend="up"
              delay={0}
            />
            <StatCard
              title="Community Votes"
              value={data.totalVotes}
              change="+8% engagement"
              icon={ThumbsUp}
              trend="up"
              delay={0.1}
            />
            <StatCard
              title="Open Reports"
              value={data.openIssues}
              change="Active issues"
              icon={AlertTriangle}
              trend="neutral"
              delay={0.2}
            />
            <StatCard
              title="Resolution Rate"
              value={`${Math.round(((data.totalIssues - data.openIssues) / data.totalIssues) * 100)}%`}
              change="+5% this week"
              icon={Target}
              trend="up"
              delay={0.3}
            />
          </div>

          {/* Main Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ModernPieChart
                  data={data.issuesByCategory}
                  title="Issues by Category"
                  description="Distribution of reported issues across different categories"
                />
                <ModernAreaChart
                  data={data.last7Days}
                  title="Daily Issue Reports"
                  description="Issue reporting trends over the last 7 days"
                />
              </div>
              
              <ModernBarChart
                data={data.topVotedIssues}
                title="Most Voted Issues"
                description="Top issues ranked by community votes and engagement"
              />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ModernPieChart
                  data={data.issuesByCategory}
                  title="Category Distribution"
                  description="Detailed breakdown of issues by category with percentages"
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-info" />
                      Category Insights
                    </CardTitle>
                    <CardDescription>Key metrics for each issue category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.issuesByCategory.map((category, index) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{category.value}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((category.value / data.totalIssues) * 100)}% of total
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid gap-6">
                <ModernLineChart
                  data={data.last7Days}
                  title="Reporting Trends"
                  description="Issue reporting patterns and trends over time"
                />
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-success" />
                        Growth Metrics
                      </CardTitle>
                      <CardDescription>Community engagement growth indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Issue Reports</span>
                        <span className="font-semibold text-success">+12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Community Votes</span>
                        <span className="font-semibold text-success">+8%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Resolution Rate</span>
                        <span className="font-semibold text-success">+5%</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-warning" />
                        Response Times
                      </CardTitle>
                      <CardDescription>Average time to resolution</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Road Issues</span>
                        <span className="font-semibold">2.3 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Water Issues</span>
                        <span className="font-semibold">1.8 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sanitation</span>
                        <span className="font-semibold">3.1 days</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground">There was a problem loading the analytics data.</p>
        </motion.div>
      )}
    </div>
  )
}
