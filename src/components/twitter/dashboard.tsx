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

  const { activeAccountByPlatform } = useAccountStore()
  const activeAccountId = activeAccountByPlatform["twitter"]
  const activeAccount = ACCOUNTS.find((a) => a.id === activeAccountId)

  // Get account name for API calls (maria or divya)
  const getAccountName = () => {
    if (!activeAccount) return "maria"
    // Map from display names to backend account names
    if (activeAccount.displayName === "@maria_in_tech") return "maria"
    if (activeAccount.displayName === "@me_divya") return "divya"
    return "maria" // default
  }

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/"

  // Fetch tweets from database on mount and when active account changes
  useEffect(() => {
    fetchTweetsFromDB()
  }, [activeAccountId])

  const fetchTweetsFromDB = async () => {
    try {
      const accountName = getAccountName()
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
      const accountName = getAccountName()
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
      const accountName = getAccountName()
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
      const accountName = getAccountName()
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
      const accountName = getAccountName()
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
      const accountName = getAccountName()
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

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header with Search */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Twitter Dashboard
        </h1>
        <p className="text-slate-600 mb-6">
          Fetch top posts from any Twitter account
        </p>

        {/* Search Bar */}
        <div className="flex gap-3 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Twitter username (e.g., elonmusk)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFetchTweets()}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          {/* Count Input */}
          <div className="w-32">
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
              className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-center font-semibold"
              disabled={isLoading}
              placeholder="Count"
            />
          </div>

          <button
            onClick={handleFetchTweets}
            disabled={isLoading}
            className={`
              px-6 py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-indigo-600 to-purple-600
              shadow-lg shadow-indigo-500/30
              transition-all duration-300
              ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching...
              </span>
            ) : (
              "Fetch Tweets"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Tweets List */}
      <div className="flex-1 overflow-auto">
        {tweets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tweets.map((tweet) => (
              <div
                key={tweet._id}
                className={`
                  bg-white rounded-2xl border p-5 transition-all duration-300 flex flex-col
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
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-slate-800">
                        {tweet.author.name}
                      </span>
                      <span className="text-slate-500">
                        @{tweet.author.username}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 text-sm">
                        {formatDate(tweet.createdAt)}
                      </span>
                    </div>

                    {/* Tweet Text */}
                    <p className="text-slate-700 mb-4 leading-relaxed">
                      {tweet.text}
                    </p>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        ❤️ {tweet.metrics.likes.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        🔄 {tweet.metrics.retweets.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {tweet.metrics.replies.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        👁️ {tweet.metrics.views.toLocaleString()}
                      </span>
                    </div>

                    {/* Scheduled Info */}
                    {tweet.isSelected && tweet.scheduledFor && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg w-fit">
                        <Clock className="w-4 h-4" />
                        <span>
                          {tweet.queuePosition && (
                            <span className="font-semibold">#{tweet.queuePosition} in queue - </span>
                          )}
                          Scheduled in{" "}
                          {getTimeUntilScheduled(tweet.scheduledFor)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {!tweet.isSelected && !tweet.isPosted && (
                    <div className="flex flex-col gap-2.5">
                      {/* Post Type Dropdown */}
                      <select
                        id={`postType-${tweet._id}`}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 outline-none transition-all text-xs font-medium text-slate-600 bg-white hover:bg-slate-50"
                      >
                        <option value="feed">📱 My Feed</option>
                        <option value="softwareengineering">💻 Software Engineering</option>
                        <option value="buildinpublic">🔨 Build in Public</option>
                        <option value="webdevelopers">🌐 Web Developers</option>
                        <option value="startup">🚀 Startup Community</option>
                        <option value="memes">😂 Memes</option>
                        <option value="techtwitter">🐦 Tech Twitter</option>
                      </select>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            const select = document.getElementById(
                              `postType-${tweet._id}`
                            ) as HTMLSelectElement
                            handleAccept(tweet._id, select.value)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                          title="Schedule Post"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Schedule
                        </button>
                        <button
                          onClick={() => handlePostNow(tweet._id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                          title="Post Now"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Post Now
                        </button>
                        <button
                          onClick={() => handleReject(tweet._id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                          title="Reject and Delete"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {tweet.isSelected && !tweet.isPosted && (
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Scheduled
                      </div>
                      <button
                        onClick={() => handleCancelSchedule(tweet._id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                        title="Cancel Schedule"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}

                  {tweet.isPosted && (
                    <div className="flex justify-center">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Posted
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No tweets yet
              </h3>
              <p className="text-slate-600">
                Enter a Twitter username above to fetch their top 100 posts
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwitterDashboard
