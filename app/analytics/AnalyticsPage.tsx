"use client"

import { BarChart, DonutChart, LineChart } from "@/components/charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BarChart2, CheckCircle, ListTodo, ThumbsUp } from "lucide-react"
import { useEffect, useState } from "react"

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
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Civic Issue Analytics</h1>
        <p className="text-muted-foreground mt-1">Visualize and analyze civic issue data and trends</p>
      </div>

      {loading ? (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="w-full h-full bg-muted/30 rounded-md flex items-center justify-center">
                  <BarChart2 className="h-16 w-16 text-muted" />
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="w-full h-full bg-muted/30 rounded-md flex items-center justify-center">
                  <BarChart2 className="h-16 w-16 text-muted" />
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="w-full h-full bg-muted/30 rounded-md flex items-center justify-center">
                <BarChart2 className="h-16 w-16 text-muted" />
              </div>
            </CardContent>
          </Card>
        </>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalIssues}</div>
                <p className="text-xs text-muted-foreground">Across all categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalVotes}</div>
                <p className="text-xs text-muted-foreground">Community engagement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Open Reports</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.openIssues}</div>
                <p className="text-xs text-muted-foreground">Pending and in progress</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Issues by Category</CardTitle>
                    <CardDescription>Distribution of reported issues</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <DonutChart data={data.issuesByCategory} />
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Daily Issue Reports</CardTitle>
                    <CardDescription>Issues reported in the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <LineChart data={data.last7Days} />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Most Voted Issues</CardTitle>
                  <CardDescription>Top issues by community votes</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={data.topVotedIssues} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Detailed analysis of issues by category</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <DonutChart data={data.issuesByCategory} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reporting Trends</CardTitle>
                  <CardDescription>Issue reporting patterns over time</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <LineChart data={data.last7Days} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No data available</h3>
          <p className="text-muted-foreground mt-1">There was a problem loading the analytics data.</p>
        </div>
      )}
    </div>
  )
}
