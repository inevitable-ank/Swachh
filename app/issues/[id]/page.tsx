"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import type { IssueCategory, IssueStatus } from "@/models/Issue"
import { format } from "date-fns"
import { ArrowLeft, Calendar, MapPin, ThumbsUp, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet"



interface Issue {
  id: string
  title: string
  description: string
  category: IssueCategory
  location: string
  imageUrl?: string
  status: IssueStatus
  createdAt: string
  longitude?: number
  latitude?: number
  createdBy: {
    id: string
    name: string
    email: string
  }
  votes: number
  userHasVoted: boolean
}

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [voteLoading, setVoteLoading] = useState(false)

  useEffect(() => {
    if (params.id) fetchIssue()
  }, [params.id])

  const fetchIssue = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/issues/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Issue not found",
            description: "The requested issue could not be found.",
            variant: "destructive",
          })
          router.push("/issues")
          return
        }
        throw new Error("Failed to fetch issue")
      }

      const data = await response.json()
      setIssue(data)
    } catch (error) {
      console.error("Error fetching issue:", error)
      toast({
        title: "Error",
        description: "Failed to load issue details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on issues",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!issue) return
    setVoteLoading(true)

    try {
      const response = await fetch(`/api/issues/${issue.id}/vote`, {
        method: issue.userHasVoted ? "DELETE" : "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Vote failed",
          description: data.error || "An error occurred.",
          variant: "destructive",
        })
        return
      }

      setIssue((prev) =>
        prev
          ? {
            ...prev,
            votes: data.votes,
            userHasVoted: data.userHasVoted,
          }
          : prev
      )

      toast({
        title: issue.userHasVoted ? "Vote removed" : "Vote recorded",
        description: issue.userHasVoted
          ? "Your vote has been removed."
          : "Your vote has been successfully recorded.",
      })
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to process your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVoteLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500"
      case "In Progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-500"
      case "Resolved":
        return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-500"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to issues
        </Button>
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-lg mb-6" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!issue) return null

  return (
    <div className="container py-8">
      <Link href="/issues">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to issues
        </Button>
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-4">{issue.title}</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="secondary">{issue.category}</Badge>
        <Badge variant="outline" className={getStatusColor(issue.status)}>
          {issue.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {issue.imageUrl && (
            <Image
              src={issue.imageUrl}
              alt={issue.title}
              width={700}
              height={300}
              className="rounded-lg object-cover"
            />
          )}


          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{issue.description}</p>
          </div>
        </div>

        <div className="space-y-6 h-full w-full">
          <Card className="border border-muted">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{issue.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Reported {format(new Date(issue.createdAt), "PPP")}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Reported by {issue.createdBy.name}</span>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleVote}
                  disabled={voteLoading}
                  className="w-full"
                  variant={issue.userHasVoted ? "outline" : "default"}
                >
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  {issue.votes}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click again to {issue.userHasVoted ? "remove" : "cast"} your vote
                </p>
              </div>
            </CardContent>
          </Card>
          {issue.latitude && issue.longitude && (
            <div className="mt-6 h-[300px] w-full rounded-lg overflow-hidden border-muted border">
              <h2 className="text-xl font-semibold m-2 ml-2">Location on Map</h2>

              <MapContainer
                center={[issue.latitude, issue.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <CircleMarker
                  center={[issue.latitude, issue.longitude]}
                  radius={8}
                  pathOptions={{
                    color: "blue",
                    fillColor: "blue",
                    fillOpacity: 0.7,
                  }}
                >
                  <Popup>
                    <strong>{issue.title}</strong>
                    <br />
                    {issue.location}
                  </Popup>
                </CircleMarker>
              </MapContainer>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
