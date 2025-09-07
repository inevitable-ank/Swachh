import { auth } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Issue from "@/models/Issue"
import Vote from "@/models/Vote"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const issuesByCategory = await Issue.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0,
        },
      },
    ])

    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await Issue.countDocuments({
        createdAt: {
          $gte: date,
          $lt: nextDate,
        },
      })

      last7Days.push({
        date: date.toISOString().split("T")[0],
        count,
      })
    }

    // Get top voted issues
    const issues = await Issue.find().sort({ createdAt: -1 }).limit(50)

    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
        const voteCount = await Vote.countDocuments({ issue: issue._id })

        return {
          id: issue._id,
          title: issue.title,
          category: issue.category,
          votes: voteCount,
        }
      }),
    )

    const topVotedIssues = issuesWithVotes.sort((a, b) => b.votes - a.votes).slice(0, 5)

    // Get total counts
    const totalIssues = await Issue.countDocuments()
    const totalVotes = await Vote.countDocuments()
    const openIssues = await Issue.countDocuments({
      status: { $in: ["Pending", "In Progress"] },
    })

    return NextResponse.json({
      issuesByCategory,
      last7Days,
      topVotedIssues,
      totalIssues,
      totalVotes,
      openIssues,
    })
  } catch (error: any) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
