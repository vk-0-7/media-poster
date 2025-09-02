import axios from "axios"
import fs from "fs"
import path from "path"

interface DownloadResult {
  success: boolean
  filePath?: string
  error?: string
  fileName?: string
}

export class VideoDownloader {
  private static downloadDir = path.join(process.cwd(), "temp", "downloads")

  static async ensureDownloadDir(): Promise<void> {
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true })
    }
  }

  static async downloadVideo(
    videoUrl: string,
    postId: string
  ): Promise<DownloadResult> {
    try {
      console.log(`📥 Starting download for post ${postId}...`)

      await this.ensureDownloadDir()

      // Get file extension from URL or default to mp4
      const urlParts = videoUrl.split(".")
      const extension =
        urlParts.length > 1
          ? urlParts[urlParts.length - 1].split("?")[0]
          : "mp4"
      const fileName = `${postId}_${Date.now()}.${extension}`
      const filePath = path.join(this.downloadDir, fileName)

      // Download video with streaming
      const response = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        timeout: 60000, // 60 seconds timeout
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })

      // Create write stream
      const writer = fs.createWriteStream(filePath)

      // Pipe the response to file
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          console.log(`✅ Video downloaded successfully: ${fileName}`)
          resolve({
            success: true,
            filePath,
            fileName,
          })
        })

        writer.on("error", (error) => {
          console.error(`❌ Download failed for ${postId}:`, error)
          // Clean up partial file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
          resolve({
            success: false,
            error: error.message,
          })
        })

        // Handle download timeout
        setTimeout(() => {
          writer.destroy()
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
          resolve({
            success: false,
            error: "Download timeout",
          })
        }, 60000)
      })
    } catch (error) {
      console.error(`❌ Download error for ${postId}:`, error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown download error",
      }
    }
  }

  static async downloadImage(
    imageUrl: string,
    postId: string
  ): Promise<DownloadResult> {
    try {
      console.log(`📥 Starting image download for post ${postId}...`)

      await this.ensureDownloadDir()

      // Get file extension from URL or default to jpg
      const urlParts = imageUrl.split(".")
      const extension =
        urlParts.length > 1
          ? urlParts[urlParts.length - 1].split("?")[0]
          : "jpg"
      const fileName = `${postId}_${Date.now()}.${extension}`
      const filePath = path.join(this.downloadDir, fileName)

      // Download image
      const response = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "stream",
        timeout: 30000, // 30 seconds timeout
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      })

      const writer = fs.createWriteStream(filePath)
      response.data.pipe(writer)

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          console.log(`✅ Image downloaded successfully: ${fileName}`)
          resolve({
            success: true,
            filePath,
            fileName,
          })
        })

        writer.on("error", (error) => {
          console.error(`❌ Image download failed for ${postId}:`, error)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
          resolve({
            success: false,
            error: error.message,
          })
        })
      })
    } catch (error) {
      console.error(`❌ Image download error for ${postId}:`, error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown download error",
      }
    }
  }

  static async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Cleaned up file: ${path.basename(filePath)}`)
      }
    } catch (error) {
      console.error(`❌ Failed to cleanup file ${filePath}:`, error)
    }
  }

  static async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      await this.ensureDownloadDir()

      const files = fs.readdirSync(this.downloadDir)
      const maxAge = maxAgeHours * 60 * 60 * 1000 // Convert to milliseconds
      const now = Date.now()

      for (const file of files) {
        const filePath = path.join(this.downloadDir, file)
        const stats = fs.statSync(filePath)

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath)
          console.log(`🗑️ Cleaned up old file: ${file}`)
        }
      }
    } catch (error) {
      console.error("❌ Failed to cleanup old files:", error)
    }
  }
}

export default VideoDownloader
