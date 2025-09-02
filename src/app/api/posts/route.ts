import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import InstagramPost from "@/models/InstagramPost"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = parseInt(searchParams.get("skip") || "0")
    const sortBy = searchParams.get("sortBy") || "videoViewCount"
    const order = searchParams.get("order") === "asc" ? 1 : -1

    // Build sort object - handle multiple sort fields
    const sort: Record<string, number> = {}

    if (sortBy === "views") {
      // Sort by video views, then video play count, then likes
      sort["videoViewCount"] = order
      sort["videoPlayCount"] = order
      sort["likesCount"] = order
    } else {
      sort[sortBy] = order
    }

    // Add timestamp as secondary sort
    if (!sort["timestamp"]) {
      sort["timestamp"] = -1
    }

    // Fetch posts from database
    const posts = await InstagramPost.find({})
      .sort(sort as any)
      .limit(limit)
      .skip(skip)
      .lean() // Returns plain JavaScript objects instead of Mongoose documents

    // Get total count for pagination
    const totalCount = await InstagramPost.countDocuments({})

    // Transform the data to match the frontend interface
    const transformedPosts = posts.map((post: any) => ({
      ...post,
      _id: post._id?.toString(), // Convert ObjectId to string
    }))

    return NextResponse.json(
      {
        success: true,
        posts: transformedPosts,
        pagination: {
          total: totalCount,
          limit,
          skip,
          hasMore: skip + limit < totalCount,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get posts API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const { postId, updates } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      )
    }

    // Update the post
    const updatedPost = await InstagramPost.findOneAndUpdate(
      { id: postId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    )

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        post: updatedPost,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update post API error:", error)
    return NextResponse.json(
      {
        error: "Failed to update post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
