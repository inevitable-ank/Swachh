"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useAuth } from "@/hooks/use-auth"
import { Edit, Plus, ThumbsUp, Trash } from "lucide-react"
import { format } from "date-fns"
import type { IssueStatus } from "@/models/Issue"
import { toast } from "sonner"

interface Issue {
  id: string
  title: string
  description: string
  category: string
  location: string
  imageUrl?: string
  status: IssueStatus
  votes: number
  createdAt: string
}

export default function MyIssuesPage() {
  const { user } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchMyIssues()
  }, [user])

  const fetchMyIssues = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/issues/user")

      if (!response.ok) {
        throw new Error("Failed to fetch issues")
      }

      const data = await response.json()
      setIssues(data)
    } catch (error) {
      console.error("Error fetching issues:", error)
      toast.error("Failed to load your issues. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete issue")
      }

      setIssues(issues.filter((issue) => issue.id !== issueId))

      toast.success("Your issue has been successfully deleted")
    } catch (error: any) {
      // console.error("Error deleting issue:", error)
      toast(error.message || "Failed to delete issue. Please try again.")
    } finally {
      setIssueToDelete(null)
    }
  }

  // Status badge color mapping
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

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reported Issues</h1>
          <p className="text-muted-foreground mt-1">Manage and track the issues you have reported</p>
        </div>
        <Link href="/issues/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Report New Issue
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : issues.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No issues reported yet</CardTitle>
            <p className="text-muted-foreground mt-2">
              You haven&apos;t reported any civic issues yet. Click the button below to report your first issue.
            </p>
            <div className="mt-6">
              <Link href="/issues/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Report an Issue
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <Card key={issue.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{issue.title}</h3>
                      <Badge variant="outline" className={`md:hidden ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="secondary">{issue.category}</Badge>
                      <Badge variant="outline" className={`hidden md:inline-flex ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        {issue.votes} votes
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported on {format(new Date(issue.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {issue.status === "Pending" && (
                      <>
                        <Link href={`/issues/edit/${issue.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                        </Link>
                        <AlertDialog
                          open={issueToDelete === issue.id}
                          onOpenChange={(open) => !open && setIssueToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setIssueToDelete(issue.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your reported issue.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(issue.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    <Link href={`/issues/${issue.id}`}>
                      <Button variant="default" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
