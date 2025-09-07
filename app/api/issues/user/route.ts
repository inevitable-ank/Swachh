import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Issue from "@/models/Issue"
import Vote from "@/models/Vote"
import { auth } from "@/lib/auth"

// Get issues created by the current user
export async function GET(request: Request) {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const issues = await Issue.find({ createdBy: session.user.id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")

    // Get vote counts for each issue
    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
        const voteCount = await Vote.countDocuments({ issue: issue._id })

        return {
          id: issue._id,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          location: issue.location,
          imageUrl: issue.imageUrl,
          status: issue.status,
          createdBy: issue.createdBy,
          createdAt: issue.createdAt,
          votes: voteCount,
        }
      }),
    )

    return NextResponse.json(issuesWithVotes)
  } catch (error: any) {
    console.error("Get user issues error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
