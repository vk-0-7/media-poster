"use client"

import { useEffect, useState } from "react"
import {
  Edit3,
  Save,
  X,
  Upload,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { getAccountFromLocalStorage } from "../config/accounts"

interface InstagramPost {
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
}

interface PostsPreviewProps {
  posts: InstagramPost[]
}

export default function PostsPreview({ posts }: PostsPreviewProps) {
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editedCaption, setEditedCaption] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())
  const [selectedAccount, setSelectedAccount] = useState(
    getAccountFromLocalStorage()
  )

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

  const handleEditClick = (post: InstagramPost) => {
    setEditingPost(post.id)
    setEditedCaption(post.caption)
  }

  const handleSaveEdit = (postId: string) => {
    // Here you would typically update the post data
    setEditingPost(null)
    console.log("Edit saved for post:", postId)
  }

  const handleVideoClick = (postId: string) => {
    setPlayingVideos((prev) => {
      const newSet = new Set(prev)
      newSet.add(postId)
      return newSet
    })
  }

  const handleVideoEnd = (postId: string) => {
    setPlayingVideos((prev) => {
      const newSet = new Set(prev)
      newSet.delete(postId)
      return newSet
    })
  }

  // Sort posts by view count (highest first)
  const sortedPosts = posts
    .sort((a, b) => getViewCount(b) - getViewCount(a))
    .slice(0, posts.length / 2) // Show top 20 posts

  const uploadPostsToBackend = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}posts/uploadJSON?account=${selectedAccount.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: sortedPosts }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to upload posts to backend")
      }

      const result = await response.json()
      console.log("Posts successfully uploaded to backend:", result)
    } catch (error) {
      console.error("Error uploading posts to backend:", error)
    }
  }

  useEffect(() => {
    if (sortedPosts.length > 0) {
      uploadPostsToBackend()
    }
  }, [])

  if (sortedPosts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center text-gray-500">
          <span className="text-6xl mb-6 block">📋</span>
          <h3 className="text-2xl font-semibold mb-3">No posts to preview</h3>
          <p className="text-lg">
            Upload a JSON file to get started with your Instagram content
            management
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-6 sm:p-10 pb-4 sm:pb-6">
        <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Top Instagram Posts
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Posts sorted by view count - Select posts to schedule for
              auto-posting
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 sm:space-x-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white text-purple-600 shadow-soft"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📱 Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white text-purple-600 shadow-soft"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-soft border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {sortedPosts.length}
            </div>
            <div className="text-sm text-gray-500">Total Posts</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-soft border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatNumber(
                sortedPosts.reduce(
                  (sum, post) =>
                    sum + (post.likesCount > 0 ? post.likesCount : 0),
                  0
                )
              )}
            </div>
            <div className="text-sm text-gray-500">Total Likes</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-soft border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatNumber(
                sortedPosts.reduce((sum, post) => sum + getViewCount(post), 0)
              )}
            </div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-center shadow-soft border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {formatNumber(
                sortedPosts.reduce((sum, post) => sum + post.commentsCount, 0)
              )}
            </div>
            <div className="text-sm text-gray-500">Total Comments</div>
          </div>
        </div>
      </div>

      {/* Posts Display - Scrollable */}
      <div className="flex-1 px-4 sm:px-10 pb-8 sm:pb-10 min-h-0 overflow-hidden">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 overflow-y-auto max-h-full">
            {sortedPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onEdit={() => handleEditClick(post)}
                editingPost={editingPost}
                editedCaption={editedCaption}
                setEditedCaption={setEditedCaption}
                setEditingPost={setEditingPost}
                onSaveEdit={handleSaveEdit}
                formatNumber={formatNumber}
                getViewCount={getViewCount}
                isPlaying={playingVideos.has(post.id)}
                onVideoClick={() => handleVideoClick(post.id)}
                onVideoEnd={() => handleVideoEnd(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-full">
            {sortedPosts.map((post, index) => (
              <PostListItem
                key={post.id}
                post={post}
                index={index}
                onEdit={() => handleEditClick(post)}
                editingPost={editingPost}
                editedCaption={editedCaption}
                setEditedCaption={setEditedCaption}
                setEditingPost={setEditingPost}
                onSaveEdit={handleSaveEdit}
                formatNumber={formatNumber}
                getViewCount={getViewCount}
                isPlaying={playingVideos.has(post.id)}
                onVideoClick={() => handleVideoClick(post.id)}
                onVideoEnd={() => handleVideoEnd(post.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Post Card Component for Grid View
function PostCard({
  post,
  index,
  onEdit,
  editingPost,
  editedCaption,
  setEditedCaption,
  setEditingPost,
  onSaveEdit,
  formatNumber,
  getViewCount,
  isPlaying,
  onVideoClick,
  onVideoEnd,
}: {
  post: InstagramPost
  index: number
  onEdit: () => void
  editingPost: string | null
  editedCaption: string
  setEditedCaption: (caption: string) => void
  setEditingPost: (postId: string | null) => void
  onSaveEdit: (postId: string) => void
  formatNumber: (num: number) => string
  getViewCount: (post: InstagramPost) => number
  isPlaying: boolean
  onVideoClick: () => void
  onVideoEnd: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-purple-200">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-medium">
              #{index + 1}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-900">
                {post.ownerUsername}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(post.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Post Image/Video */}
        <div className="relative mb-3">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-medium">
            {post.type === "Video" && post.videoUrl ? (
              <div className="relative w-full h-full">
                {isPlaying ? (
                  <video
                    src={post.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    onEnded={onVideoEnd}
                    controls
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {post.displayUrl ? (
                      <img
                        src={post.displayUrl}
                        alt={post.caption || "Video thumbnail"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-4xl">🎥</span>
                      </div>
                    )}
                    {/* Play button overlay */}
                    <button
                      onClick={onVideoClick}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <span className="text-lg text-gray-800 ml-1">▶️</span>
                      </div>
                    </button>
                    {/* Video duration */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      🎥{" "}
                      {post.videoDuration
                        ? `${Math.round(post.videoDuration)}s`
                        : "Video"}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {post.displayUrl ? (
                  <img
                    src={post.displayUrl}
                    alt={post.caption || "Post image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-3">
          {/* Caption */}
          {editingPost === post.id ? (
            <div className="space-y-2">
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg resize-none text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Edit your caption..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onSaveEdit(post.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={() => setEditingPost(null)}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-gray-500 text-white text-xs font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                {post.caption}
              </p>

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.hashtags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{post.hashtags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <Heart className="w-3 h-3 text-red-500 mb-1" />
              <div className="text-xs font-semibold text-gray-900">
                {post.likesCount > 0 ? formatNumber(post.likesCount) : "N/A"}
              </div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-sm font-bold text-blue-500 mb-1">👁️</div>
              <div className="text-xs font-semibold text-gray-900">
                {formatNumber(getViewCount(post))}
              </div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <MessageCircle className="w-3 h-3 text-green-500 mb-1" />
              <div className="text-xs font-semibold text-gray-900">
                {formatNumber(post.commentsCount)}
              </div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
          </div>

          {/* Action Buttons */}
          {editingPost !== post.id && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-all duration-200 border border-blue-200"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Post List Item Component for List View
function PostListItem({
  post,
  index,
  onEdit,
  editingPost,
  editedCaption,
  setEditedCaption,
  setEditingPost,
  onSaveEdit,
  formatNumber,
  getViewCount,
  isPlaying,
  onVideoClick,
  onVideoEnd,
}: {
  post: InstagramPost
  index: number
  onEdit: () => void
  editingPost: string | null
  editedCaption: string
  setEditedCaption: (caption: string) => void
  setEditingPost: (postId: string | null) => void
  onSaveEdit: (postId: string) => void
  formatNumber: (num: number) => string
  getViewCount: (post: InstagramPost) => number
  isPlaying: boolean
  onVideoClick: () => void
  onVideoEnd: () => void
}) {
  return (
    <div className="bg-white rounded-3xl shadow-soft border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-purple-200">
      <div className="p-8">
        <div className="flex gap-8">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl flex items-center justify-center shadow-medium relative">
              {post.type === "Video" && post.videoUrl ? (
                <div className="relative w-full h-full">
                  {isPlaying ? (
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover rounded-2xl"
                      autoPlay
                      muted
                      onEnded={onVideoEnd}
                      controls
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      {post.displayUrl ? (
                        <img
                          src={post.displayUrl}
                          alt={post.caption || "Video thumbnail"}
                          className="w-full h-full object-cover rounded-2xl"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display =
                              "none"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-2xl">
                          <span className="text-4xl">🎥</span>
                        </div>
                      )}
                      {/* Play button overlay */}
                      <button
                        onClick={onVideoClick}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-200 group rounded-2xl"
                      >
                        <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <span className="text-lg text-gray-800 ml-0.5">
                            ▶️
                          </span>
                        </div>
                      </button>
                      {/* Video duration */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        🎥{" "}
                        {post.videoDuration
                          ? `${Math.round(post.videoDuration)}s`
                          : "Video"}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {post.displayUrl ? (
                    <img
                      src={post.displayUrl}
                      alt={post.caption || "Post image"}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <span className="text-4xl">🖼️</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-medium">
                  #{index + 1}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {post.ownerUsername}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.timestamp).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div>
              {editingPost === post.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-2xl resize-none text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Edit your caption..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => onSaveEdit(post.id)}
                      className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all duration-200 shadow-medium hover:shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-gray-500 text-white text-sm font-medium rounded-xl hover:bg-gray-600 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Caption
                  </h4>
                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {post.caption}
                  </p>

                  {/* Hashtags */}
                  {post.hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.hashtags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.hashtags.length > 5 && (
                        <span className="text-sm text-gray-500">
                          +{post.hashtags.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Heart className="w-6 h-6 text-red-500 mb-1" />
                <div className="text-lg font-semibold text-gray-900">
                  {post.likesCount > 0 ? formatNumber(post.likesCount) : "N/A"}
                </div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">👁️</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(getViewCount(post))}
                </div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <MessageCircle className="w-6 h-6 text-green-500 mb-1" />
                <div className="text-lg font-semibold text-gray-900">
                  {formatNumber(post.commentsCount)}
                </div>
                <div className="text-sm text-gray-500">Comments</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  📱
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {post.type}
                </div>
                <div className="text-sm text-gray-500">Type</div>
              </div>
            </div>

            {/* Action Buttons */}
            {editingPost !== post.id && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 bg-blue-100 text-blue-700 rounded-2xl text-sm font-semibold hover:bg-blue-200 transition-all duration-200 shadow-medium hover:shadow-lg border border-blue-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Caption
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
