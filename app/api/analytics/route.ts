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

    // Calculate trends and growth metrics
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Issues trend (last month vs previous month)
    const issuesLastMonth = await Issue.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    })
    const issuesPreviousMonth = await Issue.countDocuments({
      createdAt: { 
        $gte: new Date(oneMonthAgo.getTime() - 30 * 24 * 60 * 60 * 1000),
        $lt: oneMonthAgo
      }
    })
    const issuesTrend = issuesPreviousMonth > 0 
      ? Math.round(((issuesLastMonth - issuesPreviousMonth) / issuesPreviousMonth) * 100)
      : issuesLastMonth > 0 ? 100 : 0

    // Votes trend (last week vs previous week)
    const votesLastWeek = await Vote.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    })
    const votesPreviousWeek = await Vote.countDocuments({
      createdAt: { 
        $gte: twoWeeksAgo,
        $lt: oneWeekAgo
      }
    })
    const votesTrend = votesPreviousWeek > 0 
      ? Math.round(((votesLastWeek - votesPreviousWeek) / votesPreviousWeek) * 100)
      : votesLastWeek > 0 ? 100 : 0

    // Resolution rate trend (last week vs previous week)
    const resolvedLastWeek = await Issue.countDocuments({
      status: "Resolved",
      updatedAt: { $gte: oneWeekAgo }
    })
    const resolvedPreviousWeek = await Issue.countDocuments({
      status: "Resolved",
      updatedAt: { 
        $gte: twoWeeksAgo,
        $lt: oneWeekAgo
      }
    })
    const resolutionTrend = resolvedPreviousWeek > 0 
      ? Math.round(((resolvedLastWeek - resolvedPreviousWeek) / resolvedPreviousWeek) * 100)
      : resolvedLastWeek > 0 ? 100 : 0

    // Calculate average response times by category
    const responseTimes = await Issue.aggregate([
      {
        $match: {
          status: "Resolved",
          updatedAt: { $exists: true }
        }
      },
      {
        $addFields: {
          responseTimeHours: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: "$category",
          avgResponseTime: { $avg: "$responseTimeHours" }
        }
      }
    ])

    // Format response times
    const formattedResponseTimes = responseTimes.reduce((acc, item) => {
      acc[item._id] = Math.round(item.avgResponseTime * 24 * 10) / 10 // Convert to days with 1 decimal
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      issuesByCategory,
      last7Days,
      topVotedIssues,
      totalIssues,
      totalVotes,
      openIssues,
      trends: {
        issuesTrend,
        votesTrend,
        resolutionTrend,
        responseTimes: formattedResponseTimes
      }
    })
  } catch (error: any) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
