import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"
import Issue from "@/models/Issue"
import Vote from "@/models/Vote"
import { auth } from "@/lib/auth"
import mongoose from "mongoose"

export async function GET() {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with points and badges
    const user = await User.findById(new mongoose.Types.ObjectId(session.user.id)).select("points badges")
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's issues and votes to calculate correct points
    const userIssues = await Issue.find({ createdBy: session.user.id })
    const userVotes = await Vote.find({ user: session.user.id })
    
    // Calculate what the points should be based on actual activities
    const calculatedPoints = (userIssues.length * 10) + (userVotes.length * 5)
    
    // Calculate badges based on activities
    const badges = []
    if (userIssues.length >= 1) {
      badges.push('First Issue')
    }
    if (userIssues.length >= 5) {
      badges.push('Issue Hunter')
    }
    if (userVotes.length >= 10) {
      badges.push('Community Helper')
    }
    if (userVotes.length >= 25) {
      badges.push('Voting Master')
    }
    if (calculatedPoints >= 100) {
      badges.push('Local Hero')
    }

    // If there's a mismatch, update the user's points and badges to match their actual contributions
    if (user.points !== calculatedPoints || JSON.stringify(user.badges) !== JSON.stringify(badges)) {
      await User.findByIdAndUpdate(new mongoose.Types.ObjectId(session.user.id), {
        $set: { 
          points: calculatedPoints,
          badges: badges
        }
      })
      user.points = calculatedPoints
      user.badges = badges
    }

    // Use the already fetched data
    const totalIssues = userIssues.length
    const totalVotes = userVotes.length

    // Get resolved issues (for now, we'll use a simple count)
    const issuesResolved = userIssues.filter(issue => issue.status === "Resolved").length

    // Get recent activity (simplified for now)
    const recentActivity = [
      ...userIssues.slice(0, 3).map(issue => ({
        type: "issue_reported",
        description: `Reported: ${issue.title}`,
        points: 10,
        date: issue.createdAt
      })),
      ...userVotes.slice(0, 2).map(vote => ({
        type: "vote_cast",
        description: "Voted on an issue",
        points: 5,
        date: vote.createdAt
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    // Calculate rank (simplified - would need more complex query for real ranking)
    const allUsers = await User.find().select("points").sort({ points: -1 })
    const rank = allUsers.findIndex(u => u._id.toString() === session.user.id) + 1

    return NextResponse.json({
      totalIssues,
      totalVotes,
      points: user.points || 0,
      badges: user.badges || [],
      rank,
      issuesResolved,
      recentActivity
    })
  } catch (error: any) {
    console.error("Get user stats error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
