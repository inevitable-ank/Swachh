import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Issue from "@/models/Issue"
import Vote from "@/models/Vote"
import User from "@/models/User"
import { auth } from "@/lib/auth"

// Vote on an issue
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const issue = await Issue.findById(params.id)

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      issue: issue._id,
      user: session.user.id,
    })

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted on this issue" }, { status: 400 })
    }

    // Create vote
    await Vote.create({
      issue: issue._id,
      user: session.user.id,
    })

    // Award points for voting
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { points: 5 }
    });

    // Check for voting badges
    const userVotes = await Vote.countDocuments({ user: session.user.id });
    if (userVotes === 10) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { badges: "Community Helper" }
      });
    }
    if (userVotes === 25) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { badges: "Voting Master" }
      });
    }

    // Get updated vote count
    const voteCount = await Vote.countDocuments({ issue: issue._id })

    return NextResponse.json({ votes: voteCount, userHasVoted: true })
  } catch (error: any) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}

// Remove vote from an issue
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const issue = await Issue.findById(params.id)

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    // Delete vote
    const result = await Vote.deleteOne({
      issue: issue._id,
      user: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "You have not voted on this issue" }, { status: 400 })
    }

    // Get updated vote count
    const voteCount = await Vote.countDocuments({ issue: issue._id })

    return NextResponse.json({ votes: voteCount, userHasVoted: false })
  } catch (error: any) {
    console.error("Remove vote error:", error)
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
  }
}
