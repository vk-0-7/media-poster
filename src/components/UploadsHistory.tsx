"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Database, Calendar, FileText, Loader2 } from "lucide-react"

interface InstagramPost {
  _id: string
  id: string
  type: string
  shortCode: string
  caption: string
  hashtags: string[]
  mentions: string[]
  url: string
  commentsCount: number
  firstComment: string
  latestComments: any[]
  dimensionsHeight: number
  dimensionsWidth: number
  displayUrl: string
  images: any[]
  videoUrl?: string
  alt: string | null
  likesCount: number
  videoViewCount?: number
  videoPlayCount?: number
  timestamp: string
  childPosts: any[]
  ownerFullName: string
  ownerUsername: string
  ownerId: string
  productType: string
  videoDuration?: number
  isSponsored: boolean
  musicInfo?: any
  isCommentsDisabled: boolean
  isSelected: boolean
  isSkipped: boolean
  customCaption: string
  scheduledTime: string | null
  uploadedAt: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface UploadsHistoryProps {
  onLoadPosts: (posts: InstagramPost[]) => void
}

export default function UploadsHistory({ onLoadPosts }: UploadsHistoryProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    totalViews: 0,
    totalLikes: 0,
  })

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getViewCount = (post: InstagramPost) => {
    return post.videoViewCount || post.videoPlayCount || 0
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}posts`)
      const result = await response.json()
      console.log("result", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch posts")
      }

      const fetchedPosts = result || []
      setPosts(fetchedPosts)

      // Calculate statistics
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const newStats = {
        total: fetchedPosts.length,
        today: fetchedPosts.filter(
          (post: InstagramPost) => new Date(post.uploadedAt) >= today
        ).length,
        thisWeek: fetchedPosts.filter(
          (post: InstagramPost) => new Date(post.uploadedAt) >= weekAgo
        ).length,
        totalViews: fetchedPosts.reduce(
          (sum: number, post: InstagramPost) => sum + getViewCount(post),
          0
        ),
        totalLikes: fetchedPosts.reduce(
          (sum: number, post: InstagramPost) =>
            sum + (post.likesCount > 0 ? post.likesCount : 0),
          0
        ),
      }

      setStats(newStats)
    } catch (err) {
      console.error("Error fetching posts:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleLoadAllPosts = () => {
    onLoadPosts(posts)
  }

  const handleRefresh = () => {
    fetchPosts()
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-3 sm:mb-4"></div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            Loading Upload History
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Fetching your posts from the database...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            Error Loading Posts
          </h3>
          <p className="text-gray-500 text-sm sm:text-base mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-5 sm:mb-6">
            <span className="text-3xl sm:text-4xl">📤</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            No Uploads Found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base mb-4">
            You haven't uploaded any Instagram data yet.
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Upload a JSON file to see your posts here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 sm:p-10 pb-4 sm:pb-6">
        <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Upload History
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Manage your uploaded Instagram posts from the database
            </p>
          </div>
          <div className="flex gap-2 sm:space-x-3 flex-wrap">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleLoadAllPosts}
              className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-medium"
            >
              <Database className="w-4 h-4" />
              Load to Dashboard
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-soft border border-gray-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">Total Posts</div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-soft border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.today}
            </div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-soft border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.thisWeek}
            </div>
            <div className="text-xs text-gray-500">This Week</div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-soft border border-gray-100">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatNumber(stats.totalViews)}
            </div>
            <div className="text-xs text-gray-500">Total Views</div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 text-center shadow-soft border border-gray-100">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatNumber(stats.totalLikes)}
            </div>
            <div className="text-xs text-gray-500">Total Likes</div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 pb-8 sm:pb-10 min-h-0">
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-soft border border-gray-200 p-3 sm:p-4 hover:shadow-medium transition-all duration-200"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg shadow-medium">
                    {post.displayUrl ? (
                      <img
                        src={post.displayUrl}
                        alt={post.caption || "Post thumbnail"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-lg">
                          {post.type === "Video" ? "🎥" : "🖼️"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">
                        @{post.ownerUsername}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Uploaded:{" "}
                        {new Date(post.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                          post.type === "Video"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {post.type}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-xs mb-2 line-clamp-2">
                    {post.caption.length > 80
                      ? `${post.caption.substring(0, 80)}...`
                      : post.caption}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>❤️</span>
                      <span>
                        {post.likesCount > 0
                          ? formatNumber(post.likesCount)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👁️</span>
                      <span>{formatNumber(getViewCount(post))}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💬</span>
                      <span>{formatNumber(post.commentsCount)}</span>
                    </div>
                    {post.hashtags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>#️⃣</span>
                        <span>{post.hashtags.length} tags</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
