"use client"

import { useState, useEffect } from "react"

interface ScheduledPost {
  id: string
  caption: string
  scheduledTime: Date
  status: "pending" | "posted" | "failed"
}

interface ScheduleSidebarProps {
  selectedPosts: Set<string>
  posts: any[]
}

export default function ScheduleSidebar({
  selectedPosts,
  posts,
}: ScheduleSidebarProps) {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])

  useEffect(() => {
    // Generate schedule for selected posts
    const selected = posts.filter((post) => selectedPosts.has(post.id))
    const now = new Date()

    const scheduled = selected.map((post, index) => ({
      id: post.id,
      caption: post.caption,
      scheduledTime: new Date(now.getTime() + (index + 1) * 2 * 60 * 60 * 1000), // 2 hours apart
      status: "pending" as const,
    }))

    setScheduledPosts(scheduled)
  }, [selectedPosts, posts])

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "posted":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳"
      case "posted":
        return "✅"
      case "failed":
        return "❌"
      default:
        return "📝"
    }
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 h-screen flex flex-col shadow-soft">
      {/* Header Section */}
      <div className="px-8 py-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-medium">
            <span className="text-white text-xl">📅</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Auto-Posting Schedule
            </h2>
            <p className="text-sm text-gray-600">
              {selectedPosts.size} post{selectedPosts.size !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        {selectedPosts.size > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
              <div className="text-lg font-bold text-purple-600">
                {selectedPosts.size}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-soft">
              <div className="text-lg font-bold text-green-600">
                {Math.ceil(selectedPosts.size * 2)}h
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="flex-1 overflow-y-auto">
        {scheduledPosts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">
              No posts scheduled
            </h3>
            <p className="text-gray-500 mb-2">
              Select posts from the dashboard to see your auto-posting schedule
            </p>
            <p className="text-sm text-gray-400">
              Posts will be automatically scheduled with optimal timing
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {scheduledPosts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-medium">
                      {index + 1}
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusColor(
                        post.status
                      )}`}
                    >
                      <span className="mr-1">{getStatusIcon(post.status)}</span>
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                    {post.caption.length > 80
                      ? `${post.caption.substring(0, 80)}...`
                      : post.caption}
                  </p>

                  {/* Schedule Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🕒</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(post.scheduledTime)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil(
                          (post.scheduledTime.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60)
                        )}
                        h from now
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Settings */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Settings
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posting Interval
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-soft">
                  <option value="2">Every 2 hours</option>
                  <option value="4">Every 4 hours</option>
                  <option value="6">Every 6 hours</option>
                  <option value="12">Every 12 hours</option>
                  <option value="24">Every 24 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-soft"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zone
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-soft">
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          </div>

          {selectedPosts.size > 0 && (
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-2xl text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-medium hover:shadow-lg transform hover:-translate-y-0.5">
                🚀 Start Auto-Posting
              </button>

              <button className="w-full bg-white text-gray-700 py-3 px-6 rounded-2xl text-sm font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-soft hover:shadow-medium">
                ⚙️ Advanced Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
