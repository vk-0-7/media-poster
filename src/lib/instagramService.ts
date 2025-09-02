import axios from "axios"
import FormData from "form-data"
import fs from "fs"

interface InstagramCredentials {
  accessToken: string
  instagramBusinessAccountId: string
}

interface MediaUploadResult {
  success: boolean
  mediaId?: string
  error?: string
}

interface PostResult {
  success: boolean
  postId?: string
  error?: string
  permalink?: string
}

interface InstagramPost {
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
}

export class InstagramService {
  private accessToken: string
  private businessAccountId: string
  private baseUrl = "https://graph.facebook.com/v18.0"

  constructor(credentials: InstagramCredentials) {
    this.accessToken = credentials.accessToken
    this.businessAccountId = credentials.instagramBusinessAccountId
  }

  private formatCaption(post: InstagramPost): string {
    let caption = post.caption || ""

    // Clean up caption
    caption = caption.trim()

    // Add hashtags if they exist and aren't already in the caption
    if (post.hashtags && post.hashtags.length > 0) {
      const existingHashtags = caption.match(/#\w+/g) || []
      const existingHashtagsSet = new Set(
        existingHashtags.map((tag) => tag.toLowerCase())
      )

      const newHashtags = post.hashtags
        .filter((tag) => !existingHashtagsSet.has(`#${tag.toLowerCase()}`))
        .map((tag) => `#${tag}`)
        .slice(0, 10) // Limit to 10 additional hashtags

      if (newHashtags.length > 0) {
        caption += "\n\n" + newHashtags.join(" ")
      }
    }

    // Add attribution
    caption += `\n\n📸 Originally by @${post.ownerUsername}`
    caption += `\n🔥 ${this.formatNumber(
      post.videoViewCount || post.videoPlayCount || 0
    )} views`
    caption += `\n❤️ ${this.formatNumber(post.likesCount)} likes`

    // Instagram caption limit is 2200 characters
    if (caption.length > 2200) {
      caption = caption.substring(0, 2150) + "...\n\n#viral #trending"
    }

    return caption
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  async uploadVideo(
    filePath: string,
    caption: string
  ): Promise<MediaUploadResult> {
    try {
      console.log("📤 Uploading video to Instagram...")

      // Step 1: Create media container
      const containerResponse = await axios.post(
        `${this.baseUrl}/${this.businessAccountId}/media`,
        {
          media_type: "VIDEO",
          video_url: filePath, // For local files, we need to upload to a public URL first
          caption: caption,
          access_token: this.accessToken,
        }
      )

      const containerId = containerResponse.data.id
      console.log(`✅ Media container created: ${containerId}`)

      // Step 2: Check upload status
      let uploadComplete = false
      let attempts = 0
      const maxAttempts = 30 // 5 minutes max wait time

      while (!uploadComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

        const statusResponse = await axios.get(
          `${this.baseUrl}/${containerId}`,
          {
            params: {
              fields: "status_code",
              access_token: this.accessToken,
            },
          }
        )

        const statusCode = statusResponse.data.status_code
        console.log(`📊 Upload status: ${statusCode}`)

        if (statusCode === "FINISHED") {
          uploadComplete = true
        } else if (statusCode === "ERROR") {
          throw new Error("Video upload failed")
        }

        attempts++
      }

      if (!uploadComplete) {
        throw new Error("Video upload timeout")
      }

      return {
        success: true,
        mediaId: containerId,
      }
    } catch (error) {
      console.error("❌ Video upload failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      }
    }
  }

  async uploadImage(
    filePath: string,
    caption: string
  ): Promise<MediaUploadResult> {
    try {
      console.log("📤 Uploading image to Instagram...")

      const response = await axios.post(
        `${this.baseUrl}/${this.businessAccountId}/media`,
        {
          image_url: filePath, // For local files, we need to upload to a public URL first
          caption: caption,
          access_token: this.accessToken,
        }
      )

      return {
        success: true,
        mediaId: response.data.id,
      }
    } catch (error) {
      console.error("❌ Image upload failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      }
    }
  }

  async publishPost(mediaId: string): Promise<PostResult> {
    try {
      console.log("🚀 Publishing post to Instagram...")

      const response = await axios.post(
        `${this.baseUrl}/${this.businessAccountId}/media_publish`,
        {
          creation_id: mediaId,
          access_token: this.accessToken,
        }
      )

      const postId = response.data.id

      // Get post permalink
      const postDetails = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: "permalink",
          access_token: this.accessToken,
        },
      })

      console.log("✅ Post published successfully!")

      return {
        success: true,
        postId: postId,
        permalink: postDetails.data.permalink,
      }
    } catch (error) {
      console.error("❌ Post publishing failed:", error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown publishing error",
      }
    }
  }

  async postContent(
    post: InstagramPost,
    filePath: string
  ): Promise<PostResult> {
    try {
      console.log(`🎬 Starting Instagram post for: ${post.id}`)

      const caption = this.formatCaption(post)
      console.log("📝 Generated caption:", caption.substring(0, 100) + "...")

      // Upload media
      let uploadResult: MediaUploadResult

      if (post.type === "Video" && post.videoUrl) {
        uploadResult = await this.uploadVideo(filePath, caption)
      } else {
        uploadResult = await this.uploadImage(filePath, caption)
      }

      if (!uploadResult.success || !uploadResult.mediaId) {
        return {
          success: false,
          error: uploadResult.error || "Media upload failed",
        }
      }

      // Publish the post
      const publishResult = await this.publishPost(uploadResult.mediaId)

      if (publishResult.success) {
        console.log(`🎉 Successfully posted ${post.id} to Instagram!`)
        console.log(`🔗 Permalink: ${publishResult.permalink}`)
      }

      return publishResult
    } catch (error) {
      console.error(`❌ Failed to post ${post.id}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown posting error",
      }
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.businessAccountId}`,
        {
          params: {
            fields: "account_type,username",
            access_token: this.accessToken,
          },
        }
      )

      console.log(
        `✅ Instagram credentials valid for: @${response.data.username}`
      )
      return true
    } catch (error) {
      console.error("❌ Instagram credentials validation failed:", error)
      return false
    }
  }
}

export default InstagramService
