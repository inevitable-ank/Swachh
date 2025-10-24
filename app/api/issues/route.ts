import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Issue from "@/models/Issue";
import Vote from "@/models/Vote";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { issueRateLimited } from "@/lib/rate-limit";

// Get all issues with vote counts
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: any = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Sort options
    const sortOptions: any = {};
    if (sort === "newest") {
      sortOptions.createdAt = -1;
    } else if (sort === "oldest") {
      sortOptions.createdAt = 1;
    }

    // Get issues
    const issues = await Issue.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email");

    // Get total count for pagination
    const totalIssues = await Issue.countDocuments(query);

    // Get vote counts for each issue
    const issuesWithVotes = await Promise.all(
      issues.map(async (issue) => {
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
          userHasVoted,
        };
      })
    );

    return NextResponse.json({
      issues: issuesWithVotes,
      totalIssues,
      totalPages: Math.ceil(totalIssues / limit),
      currentPage: page,
    });
  } catch (error: any) {
    console.error("Get issues error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

// Create a new issue
export async function POST(request: Request) {
  try {
    await dbConnect();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isIssueLimitExceeded = await issueRateLimited(session.user.id);

    if(isIssueLimitExceeded){
      return NextResponse.json(
        { error: "Issue creation limit exceeded. Please try again later." },
        { status: 429 }
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

    const issueData: any = {
      title,
      description,
      category,
      location,
      imageUrl,
      createdBy: session.user.id,
      status,
    };

    // Only add lat/lng if they're defined (not null)
    if (latitude != null && longitude != null) {
      issueData.latitude = latitude;
      issueData.longitude = longitude;
    }
    const issue = await Issue.create(issueData);
    await Issue.populate(issue, { path: "createdBy", select: "name email" });

    // Award points for creating an issue
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { points: 10 }
    });

    // Check for "First Issue" badge
    const userIssues = await Issue.countDocuments({ createdBy: session.user.id });
    if (userIssues === 1) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { badges: "First Issue" }
      });
    }

    // Check for "Issue Hunter" badge (5+ issues)
    if (userIssues === 5) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { badges: "Issue Hunter" }
      });
    }

    return NextResponse.json(issue, { status: 201 });
  } catch (error: any) {
    console.error("Create issue error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
