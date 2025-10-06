"use client"

import React, { useState, useEffect } from "react"
import { Search, Loader2, Check, X, Clock, TrendingUp } from "lucide-react"
import axios from "axios"

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
  scheduledFor?: string
}

const TwitterDashboard = () => {
  const [username, setUsername] = useState("")
  const [count, setCount] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [error, setError] = useState("")

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/"

  // Fetch tweets from database on mount
  useEffect(() => {
    fetchTweetsFromDB()
  }, [])

  const fetchTweetsFromDB = async () => {
    try {
      const response = await axios.get(`${API_BASE}twitter/tweets?posted=false`)
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
      const response = await axios.get(`${API_BASE}twitter/fetch`, {
        params: {
          username: username.trim(),
          count: count,
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

  const handleAccept = async (tweetId: string) => {
    try {
      const response = await axios.post(`${API_BASE}twitter/accept`, {
        tweetId,
      })

      // Update the tweet in the list
      setTweets((prev) =>
        prev.map((tweet) =>
          tweet._id === tweetId
            ? {
                ...tweet,
                isSelected: true,
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
      await axios.post(`${API_BASE}twitter/reject`, { tweetId })

      // Remove the tweet from the list
      setTweets((prev) => prev.filter((tweet) => tweet._id !== tweetId))
    } catch (error) {
      console.error("Error rejecting tweet:", error)
      alert("Failed to reject tweet")
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
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div
                key={tweet._id}
                className={`
                  bg-white rounded-2xl border p-6 transition-all duration-300
                  ${
                    tweet.isSelected
                      ? "border-green-300 bg-green-50/50"
                      : "border-indigo-100 hover:border-indigo-300 hover:shadow-lg"
                  }
                `}
              >
                <div className="flex gap-4">
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
                          Scheduled in{" "}
                          {getTimeUntilScheduled(tweet.scheduledFor)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!tweet.isSelected && !tweet.isPosted && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAccept(tweet._id)}
                        className="p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-200 hover:scale-105 shadow-md"
                        title="Accept and Schedule"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(tweet._id)}
                        className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 shadow-md"
                        title="Reject and Delete"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {tweet.isSelected && (
                    <div className="flex items-center">
                      <div className="px-4 py-2 rounded-xl bg-green-500 text-white font-semibold flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        Scheduled
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
