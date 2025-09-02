import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import InstagramPost from "@/models/InstagramPost"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting Instagram data upload...")

    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...")
    await dbConnect()
    console.log("✅ MongoDB connected successfully")

    // Parse the JSON data from the request
    const data = await request.json()
    console.log(`📊 Received ${data?.length || 0} posts for upload`)

    if (!Array.isArray(data) || data.length === 0) {
      console.log("❌ Invalid data format")
      return NextResponse.json(
        { error: "Invalid data format. Expected an array of Instagram posts." },
        { status: 400 }
      )
    }

    // Validate that the data contains Instagram posts
    const firstPost = data[0]
    if (!firstPost.id || !firstPost.ownerUsername || !firstPost.timestamp) {
      console.log("❌ Invalid Instagram post data structure")
      return NextResponse.json(
        { error: "Invalid Instagram post data structure." },
        { status: 400 }
      )
    }

    console.log("✅ Data validation passed")

    // Process and save posts
    const results = {
      inserted: 0,
      updated: 0,
      errors: 0,
      duplicates: 0,
    }

    const uploadedAt = new Date()
    console.log("🔄 Processing posts...")

    for (let i = 0; i < data.length; i++) {
      const postData = data[i]
      try {
        // Check if post already exists
        const existingPost = await InstagramPost.findOne({ id: postData.id })

        if (existingPost) {
          // Update existing post with new data
          await InstagramPost.findOneAndUpdate(
            { id: postData.id },
            {
              ...postData,
              uploadedAt,
              updatedAt: new Date(),
            },
            { new: true, upsert: false }
          )
          results.updated++
          console.log(`🔄 Updated post ${i + 1}/${data.length}: ${postData.id}`)
        } else {
          // Create new post
          const newPost = new InstagramPost({
            ...postData,
            uploadedAt,
            userId: "anonymous", // For now, until we add user authentication
          })

          await newPost.save()
          results.inserted++
          console.log(
            `✅ Inserted post ${i + 1}/${data.length}: ${postData.id}`
          )
        }
      } catch (error) {
        console.error(`❌ Error processing post ${postData.id}:`, error)
        results.errors++
      }
    }

    console.log("📊 Upload completed:", results)

    // Return success response with results
    return NextResponse.json(
      {
        success: true,
        message: "Instagram data uploaded successfully",
        results: {
          totalPosts: data.length,
          inserted: results.inserted,
          updated: results.updated,
          errors: results.errors,
          duplicates: results.duplicates,
        },
        uploadedAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Upload API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = parseInt(searchParams.get("skip") || "0")
    const sortBy = searchParams.get("sortBy") || "videoViewCount"
    const order = searchParams.get("order") === "asc" ? 1 : -1

    // Build sort object
    const sort: Record<string, number> = {}
    sort[sortBy] = order

    // Fetch posts from database
    const posts = await InstagramPost.find({})
      .sort(sortBy === "createdAt" ? { createdAt: order } : { [sortBy]: order })
      .limit(limit)
      .skip(skip)
      .lean() // Returns plain JavaScript objects instead of Mongoose documents

    // Get total count for pagination
    const totalCount = await InstagramPost.countDocuments({})

    return NextResponse.json(
      {
        success: true,
        posts,
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

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    // Delete all posts (be careful with this in production!)
    const result = await InstagramPost.deleteMany({})

    return NextResponse.json(
      {
        success: true,
        message: "All posts deleted successfully",
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete posts API error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
