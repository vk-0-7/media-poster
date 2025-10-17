"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  Loader2,
  Check,
  X,
  Clock,
  TrendingUp,
  Send,
  Ban,
  Plus,
  Upload,
} from "lucide-react"
import axios from "axios"
import { useAccountStore } from "@/store/accountStore"
import { ACCOUNTS } from "@/data/accountsData"

interface Tweet {
  _id: string
  tweetId: string
  text: string
  author: {
    id: string
    username: string
    name: string
  }
  createdAt: string
  metrics: {
    likes: number
    retweets: number
    replies: number
    views: number
  }
  isSelected?: boolean
  isPosted?: boolean
  queuePosition?: number
  scheduledFor?: string
}

const TwitterDashboard = () => {
  const [username, setUsername] = useState("")
  const [count, setCount] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const { activeAccountByPlatform } = useAccountStore()
  const activeAccountId = activeAccountByPlatform["twitter"]
  const activeAccount = ACCOUNTS.find((a) => a.id === activeAccountId)

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/"

  // Fetch tweets from database on mount and when active account changes
  useEffect(() => {
    fetchTweetsFromDB()
  }, [activeAccountId])

  const fetchTweetsFromDB = async () => {
    try {
      const accountName = activeAccountId
      const response = await axios.get(`${API_BASE}twitter/tweets`, {
        params: {
          posted: false,
          account: accountName,
        },
      })
      setTweets(response.data.tweets)
    } catch (error) {
      console.error("Error fetching tweets:", error)
    }
  }

  const handleFetchTweets = async () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const accountName = activeAccountId
      const response = await axios.get(`${API_BASE}twitter/fetch`, {
        params: {
          username: username.trim(),
          count: count,
          account: accountName,
        },
      })

      setTweets(response.data.tweets)
      setError("")
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch tweets")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (tweetId: string, postType: string) => {
    try {
      const accountName = activeAccountId
      const response = await axios.post(`${API_BASE}twitter/accept`, {
        tweetId,
        postType,
        account: accountName,
      })

      // Update the tweet in the list
      setTweets((prev) =>
        prev.map((tweet) =>
          tweet._id === tweetId
            ? {
                ...tweet,
                isSelected: true,
                queuePosition: response.data.queuePosition,
                scheduledFor: response.data.tweet.scheduledFor,
              }
            : tweet
        )
      )
    } catch (error) {
      console.error("Error accepting tweet:", error)
      alert("Failed to accept tweet")
    }
  }

  const handleReject = async (tweetId: string) => {
    try {
      const accountName = activeAccountId
      await axios.post(`${API_BASE}twitter/reject`, {
        tweetId,
        account: accountName,
      })

      // Remove the tweet from the list
      setTweets((prev) => prev.filter((tweet) => tweet._id !== tweetId))
    } catch (error) {
      console.error("Error rejecting tweet:", error)
      alert("Failed to reject tweet")
    }
  }

  const handlePostNow = async (tweetId: string) => {
    try {
      const accountName = activeAccountId
      await axios.post(`${API_BASE}twitter/post`, {
        tweetId,
        account: accountName,
      })

      // Update the tweet as posted
      setTweets((prev) =>
        prev.map((tweet) =>
          tweet._id === tweetId
            ? { ...tweet, isPosted: true, postedAt: new Date().toISOString() }
            : tweet
        )
      )
    } catch (error) {
      console.error("Error posting tweet:", error)
      alert("Failed to post tweet")
    }
  }

  const handleCancelSchedule = async (tweetId: string) => {
    try {
      const accountName = activeAccountId
      await axios.post(`${API_BASE}twitter/deselect`, {
        tweetIds: [tweetId],
        account: accountName,
      })

      // Refetch tweets to get rebalanced queue positions and times
      await fetchTweetsFromDB()
    } catch (error) {
      console.error("Error canceling schedule:", error)
      alert("Failed to cancel schedule")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTimeUntilScheduled = (scheduledFor: string) => {
    const scheduled = new Date(scheduledFor)
    const now = new Date()
    const diff = scheduled.getTime() - now.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const handleAddPost = async () => {
    if (!postContent.trim()) {
      alert("Please enter post content")
      return
    }

    if (!selectedAccount) {
      alert("Please select an account")
      return
    }

    try {
      const response = await axios.post(
        `${API_BASE}twitter/add?account=${selectedAccount}`,
        {
          data: postContent,
        }
      )

      // Add the new tweet to the list
      if (response.data.tweet) {
        setTweets((prev) => [response.data.tweet, ...prev])
      }

      // Close modal and reset content
      setIsModalOpen(false)
      setPostContent("")
      setSelectedAccount("")
    } catch (error: any) {
      console.error("Error creating post:", error)
      alert(error.response?.data?.error || "Failed to create post")
    }
  }

  const handleCancelModal = () => {
    setIsModalOpen(false)
    setPostContent("")
    setSelectedAccount("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/json") {
      setUploadFile(file)
    } else {
      alert("Please select a valid JSON file")
      e.target.value = ""
    }
  }

  const handleUploadJSON = async () => {
    if (!uploadFile) {
      alert("Please select a file")
      return
    }

    if (!selectedAccount) {
      alert("Please select an account")
      return
    }

    try {
      const fileContent = await uploadFile.text()
      const jsonData = JSON.parse(fileContent)

      const response = await axios.post(
        `${API_BASE}twitter/upload?account=${selectedAccount}`,
        {
          data: jsonData,
        }
      )

      alert(`Successfully uploaded ${response.data.count || 0} tweets`)

      // Refresh tweets list
      await fetchTweetsFromDB()

      // Close modal and reset
      setIsUploadModalOpen(false)
      setUploadFile(null)
      setSelectedAccount("")
    } catch (error: any) {
      console.error("Error uploading JSON:", error)
      alert(error.response?.data?.error || "Failed to upload JSON file")
    }
  }

  const handleCancelUpload = () => {
    setIsUploadModalOpen(false)
    setUploadFile(null)
    setSelectedAccount("")
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 md:p-8">
      {/* Header with Search */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Twitter Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Post</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline">Upload JSON</span>
            </button>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
          Fetch top posts from any Twitter account
        </p>

        {/* Search Bar - Responsive Layout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter username (e.g., elonmusk)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchTweets()}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm sm:text-base"
              disabled={isLoading}
            />
          </div>

          {/* Count Input & Fetch Button Row */}
          <div className="flex gap-2 sm:gap-3">
            <div className="w-20 sm:w-32">
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-full px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center font-semibold text-sm sm:text-base"
                disabled={isLoading}
                placeholder="100"
              />
            </div>

            <button
              onClick={handleFetchTweets}
              disabled={isLoading}
              className={`
                flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base
                bg-gradient-to-r from-indigo-600 to-purple-600
                shadow-lg shadow-indigo-500/30
                transition-all duration-300
                ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 sm:hover:scale-105"
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Fetching...</span>
                  <span className="sm:hidden">...</span>
                </span>
              ) : (
                <>
                  <span className="hidden sm:inline">Fetch Tweets</span>
                  <span className="sm:hidden">Fetch</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm sm:text-base">
            {error}
          </div>
        )}
      </div>

      {/* Tweets List */}
      <div className="flex-1 overflow-auto">
        {tweets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {tweets.map((tweet) => (
              <div
                key={tweet._id}
                className={`
                  bg-white rounded-xl sm:rounded-2xl border p-3 sm:p-4 md:p-5 transition-all duration-300 flex flex-col
                  ${
                    tweet.isSelected
                      ? "border-green-300 bg-green-50/50"
                      : "border-indigo-100 hover:border-indigo-300 hover:shadow-lg"
                  }
                `}
              >
                <div className="flex-1 flex flex-col">
                  {/* Tweet Content */}
                  <div className="flex-1">
                    {/* Author */}

                    {/* Tweet Text */}
                    <p className="text-slate-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                      {tweet.text}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="text-base sm:text-lg">❤️</span>
                        <span className="hidden xs:inline">
                          {tweet.metrics.likes.toLocaleString()}
                        </span>
                        <span className="xs:hidden">
                          {tweet.metrics.likes > 999
                            ? `${(tweet.metrics.likes / 1000).toFixed(1)}k`
                            : tweet.metrics.likes}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base sm:text-lg">🔄</span>
                        <span className="hidden xs:inline">
                          {tweet.metrics.retweets.toLocaleString()}
                        </span>
                        <span className="xs:hidden">
                          {tweet.metrics.retweets > 999
                            ? `${(tweet.metrics.retweets / 1000).toFixed(1)}k`
                            : tweet.metrics.retweets}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base sm:text-lg">💬</span>
                        <span className="hidden xs:inline">
                          {tweet.metrics.replies.toLocaleString()}
                        </span>
                        <span className="xs:hidden">
                          {tweet.metrics.replies > 999
                            ? `${(tweet.metrics.replies / 1000).toFixed(1)}k`
                            : tweet.metrics.replies}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base sm:text-lg">👁️</span>
                        <span className="hidden xs:inline">
                          {tweet.metrics.views.toLocaleString()}
                        </span>
                        <span className="xs:hidden">
                          {tweet.metrics.views > 999
                            ? `${(tweet.metrics.views / 1000).toFixed(1)}k`
                            : tweet.metrics.views}
                        </span>
                      </span>
                    </div>

                    {/* Scheduled Info */}
                    {tweet.isSelected && tweet.scheduledFor && (
                      <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-700 bg-green-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg w-fit max-w-full">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {tweet.queuePosition && (
                            <span className="font-semibold">
                              #{tweet.queuePosition}{" "}
                            </span>
                          )}
                          <span className="hidden sm:inline">
                            Scheduled in{" "}
                          </span>
                          {getTimeUntilScheduled(tweet.scheduledFor)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
                  {!tweet.isSelected && !tweet.isPosted && (
                    <div className="flex flex-col gap-2">
                      {/* Post Type Dropdown */}
                      <select
                        id={`postType-${tweet._id}`}
                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 outline-none transition-all text-[11px] sm:text-xs font-medium text-slate-600 bg-white hover:bg-slate-50"
                      >
                        <option value="feed">📱 My Feed</option>
                        <option value="softwareengineering">
                          💻 Software Engineering
                        </option>
                        <option value="buildinpublic">
                          🔨 Build in Public
                        </option>
                        <option value="webdevelopers">🌐 Web Developers</option>
                        <option value="startup">🚀 Startup Community</option>
                        <option value="memes">😂 Memes</option>
                        <option value="techtwitter">🐦 Tech Twitter</option>
                      </select>

                      <div className="flex gap-1.5 sm:gap-2 justify-end">
                        <button
                          onClick={() => {
                            const select = document.getElementById(
                              `postType-${tweet._id}`
                            ) as HTMLSelectElement
                            handleAccept(tweet._id, select.value)
                          }}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 active:scale-95 text-white text-[11px] sm:text-xs font-medium transition-all duration-200 flex items-center gap-1"
                          title="Schedule Post"
                        >
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden xs:inline">Schedule</span>
                        </button>
                        <button
                          onClick={() => handlePostNow(tweet._id)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 active:scale-95 text-white text-[11px] sm:text-xs font-medium transition-all duration-200 flex items-center gap-1"
                          title="Post Now"
                        >
                          <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden xs:inline">Post</span>
                        </button>
                        <button
                          onClick={() => handleReject(tweet._id)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 text-[11px] sm:text-xs font-medium transition-all duration-200 flex items-center gap-1"
                          title="Reject and Delete"
                        >
                          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden xs:inline">Reject</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {tweet.isSelected && !tweet.isPosted && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Scheduled
                      </div>
                      <button
                        onClick={() => handleCancelSchedule(tweet._id)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 text-[11px] sm:text-xs font-medium transition-all duration-200 flex items-center gap-1 sm:gap-1.5"
                        title="Cancel Schedule"
                      >
                        <Ban className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {tweet.isPosted && (
                    <div className="flex justify-center">
                      <div className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Posted
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">
                No tweets yet
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                Enter a Twitter username above to fetch their top 100 posts
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                Create New Post
              </h2>
              <button
                onClick={handleCancelModal}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label
                  htmlFor="accountSelect"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Account
                </label>
                <select
                  id="accountSelect"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700"
                >
                  <option value="">Select an account</option>
                  {ACCOUNTS.filter((acc) => acc.platform === "twitter").map(
                    (account) => (
                      <option key={account.id} value={account.id}>
                        {account.displayName}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="postContent"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Post Content
                </label>
                <textarea
                  id="postContent"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full min-h-[200px] px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-y text-slate-700"
                />
                <div className="mt-2 text-sm text-slate-500">
                  {postContent.length} characters
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={handleCancelModal}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPost}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300"
              >
                Add Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload JSON Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">
                Upload JSON File
              </h2>
              <button
                onClick={handleCancelUpload}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <label
                  htmlFor="accountSelectUpload"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Account
                </label>
                <select
                  id="accountSelectUpload"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-700"
                >
                  <option value="">Select an account</option>
                  {ACCOUNTS.filter((acc) => acc.platform === "twitter").map(
                    (account) => (
                      <option key={account.id} value={account.id}>
                        {account.displayName}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="fileUpload"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  JSON File
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {uploadFile && (
                  <div className="mt-2 text-sm text-slate-600">
                    Selected: {uploadFile.name}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The JSON file should contain an array
                  of tweet objects. All tweets will be associated with the
                  selected account.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={handleCancelUpload}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadJSON}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 transition-all duration-300"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TwitterDashboard
