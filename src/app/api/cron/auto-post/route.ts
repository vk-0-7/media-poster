import { NextRequest, NextResponse } from "next/server"
import PostSelector from "@/lib/postSelector"
import VideoDownloader from "@/lib/videoDownloader"
import InstagramService from "@/lib/instagramService"
import dbConnect from "@/lib/mongodb"
import InstagramPost from "@/models/InstagramPost"

interface CronJobResult {
  success: boolean
  message: string
  postsProcessed: number
  postsSuccessful: number
  errors: string[]
  details: any[]
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting automated Instagram posting cron job...")

    // Verify authorization (simple API key check)
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_API_KEY}`

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if Instagram credentials are configured
    const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN
    const instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    if (!instagramAccessToken || !instagramBusinessAccountId) {
      return NextResponse.json(
        {
          error: "Instagram credentials not configured",
          message:
            "Please set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID environment variables",
        },
        { status: 400 }
      )
    }

    // Initialize services
    const instagramService = new InstagramService({
      accessToken: instagramAccessToken,
      instagramBusinessAccountId: instagramBusinessAccountId,
    })

    // Validate Instagram credentials
    const credentialsValid = await instagramService.validateCredentials()
    if (!credentialsValid) {
      return NextResponse.json(
        { error: "Invalid Instagram credentials" },
        { status: 400 }
      )
    }

    // Get posting criteria from request body or use defaults
    const body = await request.json().catch(() => ({}))
    const postingCriteria = {
      minViews: body.minViews || 5000,
      maxPostsPerDay: body.maxPostsPerDay || 2,
      excludeRecentlyPosted: body.excludeRecentlyPosted !== false,
      hoursToExclude: body.hoursToExclude || 24,
      preferredTypes: body.preferredTypes || ["Video"],
      minLikes: body.minLikes || 500,
      maxCaptionLength: body.maxCaptionLength || 2000,
    }

    console.log("📋 Posting criteria:", postingCriteria)

    // Select posts to publish
    const selectedPosts = await PostSelector.getMostViewedPosts(postingCriteria)

    if (selectedPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts found matching criteria",
        postsProcessed: 0,
        postsSuccessful: 0,
        errors: [],
        details: [],
      })
    }

    const results: CronJobResult = {
      success: true,
      message: "",
      postsProcessed: selectedPosts.length,
      postsSuccessful: 0,
      errors: [],
      details: [],
    }

    // Process each selected post
    for (const post of selectedPosts) {
      console.log(`\n🎬 Processing post: ${post.id}`)

      const postResult: any = {
        postId: post.id,
        ownerUsername: post.ownerUsername,
        success: false,
        error: null,
        instagramPostId: null,
        permalink: null,
      }

      try {
        // Validate post before processing
        const validation = await PostSelector.validatePostForPosting(post.id)
        if (!validation.valid) {
          postResult.error = validation.reason
          results.errors.push(`${post.id}: ${validation.reason}`)
          results.details.push(postResult)
          continue
        }

        // Download media file
        console.log(`📥 Downloading media for ${post.id}...`)

        let downloadResult
        if (post.type === "Video" && post.videoUrl) {
          downloadResult = await VideoDownloader.downloadVideo(
            post.videoUrl,
            post.id
          )
        } else if (post.displayUrl) {
          downloadResult = await VideoDownloader.downloadImage(
            post.displayUrl,
            post.id
          )
        } else {
          postResult.error = "No valid media URL found"
          results.errors.push(`${post.id}: No valid media URL found`)
          results.details.push(postResult)
          continue
        }

        if (!downloadResult.success || !downloadResult.filePath) {
          postResult.error = downloadResult.error || "Download failed"
          results.errors.push(`${post.id}: ${postResult.error}`)
          results.details.push(postResult)
          continue
        }

        console.log(`✅ Media downloaded: ${downloadResult.fileName}`)

        // Post to Instagram
        console.log(`📤 Posting to Instagram...`)
        const instagramResult = await instagramService.postContent(
          post,
          downloadResult.filePath
        )

        if (instagramResult.success) {
          console.log(`🎉 Successfully posted ${post.id} to Instagram!`)

          postResult.success = true
          postResult.instagramPostId = instagramResult.postId
          postResult.permalink = instagramResult.permalink
          results.postsSuccessful++

          // Mark post as posted in database
          await PostSelector.markPostAsPosted(post.id)
        } else {
          postResult.error = instagramResult.error || "Instagram posting failed"
          results.errors.push(`${post.id}: ${postResult.error}`)
        }

        // Clean up downloaded file
        if (downloadResult.filePath) {
          await VideoDownloader.cleanupFile(downloadResult.filePath)
        }
      } catch (error) {
        console.error(`❌ Error processing post ${post.id}:`, error)
        postResult.error =
          error instanceof Error ? error.message : "Unknown error"
        results.errors.push(`${post.id}: ${postResult.error}`)
      }

      results.details.push(postResult)
    }

    // Clean up old downloaded files
    await VideoDownloader.cleanupOldFiles(1) // Clean files older than 1 hour

    // Generate summary message
    if (results.postsSuccessful === 0) {
      results.success = false
      results.message = `Failed to post any content. ${results.errors.length} errors occurred.`
    } else if (results.postsSuccessful === results.postsProcessed) {
      results.message = `Successfully posted all ${results.postsSuccessful} selected posts to Instagram!`
    } else {
      results.message = `Posted ${results.postsSuccessful} out of ${results.postsProcessed} posts. ${results.errors.length} errors occurred.`
    }

    console.log(`\n📊 Cron job completed: ${results.message}`)

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error("❌ Cron job failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Cron job failed",
        error: error instanceof Error ? error.message : "Unknown error",
        postsProcessed: 0,
        postsSuccessful: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        details: [],
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple health check endpoint
    return NextResponse.json({
      status: "healthy",
      message: "Auto-posting cron job endpoint is operational",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
