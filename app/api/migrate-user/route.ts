import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Issue from "@/models/Issue"
import Vote from "@/models/Vote"
import { auth } from "@/lib/auth"

export async function POST() {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Count user's issues and votes
    const issuesCount = await Issue.countDocuments({ createdBy: session.user.id })
    const votesCount = await Vote.countDocuments({ user: session.user.id })

    // Calculate points based on existing activities
    let totalPoints = 0
    const badges = []

    // Award points for existing issues
    totalPoints += issuesCount * 10

    // Award points for existing votes
    totalPoints += votesCount * 5

    // Award badges based on activities
    if (issuesCount >= 1) {
      badges.push('First Issue')
    }
    if (issuesCount >= 5) {
      badges.push('Issue Hunter')
    }
    if (votesCount >= 10) {
      badges.push('Community Helper')
    }
    if (votesCount >= 25) {
      badges.push('Voting Master')
    }
    if (totalPoints >= 100) {
      badges.push('Local Hero')
    }

    // Update user with calculated points and badges
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        points: totalPoints,
        badges: badges
      }
    })

    return NextResponse.json({
      message: "User migrated successfully",
      points: totalPoints,
      badges: badges,
      issuesCount,
      votesCount
    })
  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}

