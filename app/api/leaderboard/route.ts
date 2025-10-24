import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Issue from "@/models/Issue"
import Vote from "@/models/Vote"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get top users by points
    const users = await User.find()
      .select("name email points badges")
      .sort({ points: -1 })
      .limit(50)

    // Get additional stats for each user
    const leaderboard = await Promise.all(
      users.map(async (user, index) => {
        const totalIssues = await Issue.countDocuments({ createdBy: user._id })
        const totalVotes = await Vote.countDocuments({ user: user._id })

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          points: user.points || 0,
          badges: user.badges || [],
          totalIssues,
          totalVotes,
          rank: index + 1
        }
      })
    )

    return NextResponse.json(leaderboard)
  } catch (error: any) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
