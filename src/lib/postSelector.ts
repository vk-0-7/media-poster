import dbConnect from "./mongodb"
import InstagramPost from "@/models/InstagramPost"

interface PostSelectionCriteria {
  minViews?: number
  maxPostsPerDay?: number
  excludeRecentlyPosted?: boolean
  hoursToExclude?: number
  preferredTypes?: ("Video" | "Image")[]
  minLikes?: number
  maxCaptionLength?: number
}

interface SelectedPost {
  _id: string
  id: string
  type: string
  caption: string
  hashtags: string[]
  videoUrl?: string
  displayUrl: string
  likesCount: number
  videoViewCount?: number
  videoPlayCount?: number
  ownerUsername: string
  timestamp: string
  score: number
}

export class PostSelector {
  private static defaultCriteria: PostSelectionCriteria = {
    minViews: 1000,
    maxPostsPerDay: 3,
    excludeRecentlyPosted: true,
    hoursToExclude: 24,
    preferredTypes: ["Video", "Image"],
    minLikes: 100,
    maxCaptionLength: 2000,
  }

  static calculatePostScore(post: any): number {
    const views = post.videoViewCount || post.videoPlayCount || 0
    const likes = post.likesCount || 0
    const comments = post.commentsCount || 0

    // Base score from engagement
    let score = views * 0.1 + likes * 2 + comments * 5

    // Bonus for videos (typically perform better)
    if (post.type === "Video") {
      score *= 1.2
    }

    // Bonus for posts with hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      score *= 1.1
    }

    // Penalty for very long captions
    if (post.caption && post.caption.length > 1500) {
      score *= 0.9
    }

    // Bonus for recent engagement (posts from last 30 days)
    const daysSincePost =
      (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePost <= 30) {
      score *= 1.15
    }

    return Math.round(score)
  }

  static async getMostViewedPosts(
    criteria: Partial<PostSelectionCriteria> = {}
  ): Promise<SelectedPost[]> {
    try {
      await dbConnect()

      const finalCriteria = { ...this.defaultCriteria, ...criteria }
      console.log("🔍 Selecting posts with criteria:", finalCriteria)

      // Build query filters
      const query: any = {}

      // Minimum views filter
      if (finalCriteria.minViews) {
        query.$or = [
          { videoViewCount: { $gte: finalCriteria.minViews } },
          { videoPlayCount: { $gte: finalCriteria.minViews } },
        ]
      }

      // Minimum likes filter
      if (finalCriteria.minLikes) {
        query.likesCount = { $gte: finalCriteria.minLikes }
      }

      // Type filter
      if (
        finalCriteria.preferredTypes &&
        finalCriteria.preferredTypes.length > 0
      ) {
        query.type = { $in: finalCriteria.preferredTypes }
      }

      // Caption length filter
      if (finalCriteria.maxCaptionLength) {
        query.$expr = {
          $lte: [{ $strLenCP: "$caption" }, finalCriteria.maxCaptionLength],
        }
      }

      // Exclude recently posted content
      if (finalCriteria.excludeRecentlyPosted && finalCriteria.hoursToExclude) {
        const hoursAgo = new Date(
          Date.now() - finalCriteria.hoursToExclude * 60 * 60 * 1000
        )
        query.lastPostedAt = { $not: { $gte: hoursAgo } }
      }

      // Fetch posts from database
      const posts = await InstagramPost.find(query).lean().limit(100) // Get top 100 candidates

      console.log(`📊 Found ${posts.length} candidate posts`)

      if (posts.length === 0) {
        console.log("⚠️ No posts found matching criteria")
        return []
      }

      // Calculate scores and sort
      const scoredPosts = posts
        .map((post: any) => ({
          ...post,
          _id: post._id.toString(),
          score: this.calculatePostScore(post),
        }))
        .sort((a, b) => b.score - a.score)

      // Apply daily limit
      const selectedPosts = scoredPosts.slice(
        0,
        finalCriteria.maxPostsPerDay || 3
      )

      console.log(`✅ Selected ${selectedPosts.length} posts for posting:`)
      selectedPosts.forEach((post, index) => {
        console.log(
          `  ${index + 1}. ${post.id} - Score: ${post.score} - Views: ${
            post.videoViewCount || post.videoPlayCount || 0
          }`
        )
      })

      return selectedPosts
    } catch (error) {
      console.error("❌ Error selecting posts:", error)
      throw error
    }
  }

  static async markPostAsPosted(postId: string): Promise<void> {
    try {
      await dbConnect()

      await InstagramPost.findOneAndUpdate(
        { id: postId },
        {
          lastPostedAt: new Date(),
          timesPosted: { $inc: 1 },
        }
      )

      console.log(`📝 Marked post ${postId} as posted`)
    } catch (error) {
      console.error(`❌ Error marking post ${postId} as posted:`, error)
    }
  }

  static async getPostingHistory(days: number = 7): Promise<any[]> {
    try {
      await dbConnect()

      const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const history = await InstagramPost.find({
        lastPostedAt: { $gte: daysAgo },
      })
        .select(
          "id ownerUsername caption lastPostedAt timesPosted likesCount videoViewCount"
        )
        .sort({ lastPostedAt: -1 })
        .lean()

      console.log(`📈 Found ${history.length} posts in last ${days} days`)
      return history
    } catch (error) {
      console.error("❌ Error fetching posting history:", error)
      return []
    }
  }

  static async getTopPerformers(limit: number = 10): Promise<any[]> {
    try {
      await dbConnect()

      const topPosts = await InstagramPost.find({})
        .sort({
          videoViewCount: -1,
          videoPlayCount: -1,
          likesCount: -1,
        })
        .limit(limit)
        .lean()

      return topPosts.map((post: any) => ({
        ...post,
        _id: post._id.toString(),
        score: this.calculatePostScore(post),
      }))
    } catch (error) {
      console.error("❌ Error fetching top performers:", error)
      return []
    }
  }

  static async validatePostForPosting(postId: string): Promise<{
    valid: boolean
    reason?: string
    post?: any
  }> {
    try {
      await dbConnect()

      const post: any = await InstagramPost.findOne({ id: postId }).lean()

      if (!post) {
        return { valid: false, reason: "Post not found" }
      }

      // Check if post has required media URLs
      if (!post.displayUrl && !post.videoUrl) {
        return { valid: false, reason: "No media URL available" }
      }

      // Check if recently posted
      if (post.lastPostedAt) {
        const hoursSincePosted =
          (Date.now() - new Date(post.lastPostedAt).getTime()) /
          (1000 * 60 * 60)
        if (hoursSincePosted < 24) {
          return {
            valid: false,
            reason: `Posted ${Math.round(hoursSincePosted)} hours ago`,
          }
        }
      }

      // Check engagement metrics
      const views = post.videoViewCount || post.videoPlayCount || 0
      if (views < 1000) {
        return { valid: false, reason: "Insufficient views" }
      }

      return { valid: true, post }
    } catch (error) {
      console.error(`❌ Error validating post ${postId}:`, error)
      return { valid: false, reason: "Validation error" }
    }
  }
}

export default PostSelector
