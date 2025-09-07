import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Issue from "@/models/Issue";
import Vote from "@/models/Vote";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";

// Get a single issue with vote count
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const issue = await Issue.findById(id).populate("createdBy", "name email");
    
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Get vote count
    const voteCount = await Vote.countDocuments({ issue: issue._id });

    // Check if current user has voted (if authenticated)
    let userHasVoted = false;
    const session = await auth();

    if (session?.user?.id) {
      const vote = await Vote.findOne({
        issue: issue._id,
        user: session.user.id,
      });
      userHasVoted = !!vote;
    }

    return NextResponse.json({
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
      latitude: issue.latitude,
      longitude: issue.longitude,
      userHasVoted,
    });
  } catch (error: any) {
    console.error("Get issue error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Update an issue
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const issue = await Issue.findById(params.id);

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Check if user is the creator of the issue
    if (issue.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this issue" },
        { status: 403 }
      );
    }

    // Check if issue is still in Pending status
    if (issue.status !== "Pending") {
      return NextResponse.json(
        { error: "Cannot update issue that is not in Pending status" },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      category,
      location,
      imageUrl,
      latitude,
      longitude,
      status,
    } = await request.json();

    issue.title = title || issue.title;
    issue.description = description || issue.description;
    issue.category = category || issue.category;
    issue.location = location || issue.location;
    issue.imageUrl = imageUrl || issue.imageUrl;
    issue.latitude = latitude || issue.latitude;
    issue.longitude = longitude || issue.longitude;
    issue.status = status || issue.status;

    await issue.save();

    return NextResponse.json(issue);
  } catch (error: any) {
    console.error("Update issue error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Delete an issue
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    /* ──────── 1. Auth check ──────── */
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    /* ──────── 2. Issue existence / permissions ──────── */
    const issue = await Issue.findById(params.id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    if (issue.createdBy.toString() !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this issue" },
        { status: 403 }
      );
    }
    if (issue.status !== "Pending") {
      return NextResponse.json(
        { error: "Only pending issues can be deleted" },
        { status: 400 }
      );
    }

    /* ──────── 3. Delete votes + issue ──────── */
    await Vote.deleteMany({ issue: issue._id });
    await issue.deleteOne();

    /* ──────── 4. Decrement Redis rate‑limit counter ──────── */
    const key = `issue_limit:${userId}`;
    const countRaw = await redis.get<string | null>(key);
    const count = Number(countRaw) || 0;

    if (count > 0) {
      const newVal = await redis.decr(key); // atomic
      if (newVal < 0) await redis.set(key, "0"); // clamp at 0
    }

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (err: any) {
    console.error("Delete issue error:", err);
    return NextResponse.json(
      { error: err?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
