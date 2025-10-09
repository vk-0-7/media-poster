"use client"

import { useState, useEffect } from "react"
import { Play, Square, Zap, Loader2 } from "lucide-react"
import { useAccountStore } from "@/store/accountStore"
import { ACCOUNTS } from "@/data/accountsData"

interface SchedulerStatus {
  status: string
  config?: {
    cronExpression: string
    timezone: string
    postingCriteria: {
      minViews: number
      maxPostsPerDay: number
      preferredTypes: string[]
      minLikes: number
    }
  }
  startedAt?: string
  nextRun?: string
  uptime?: number
}

interface PostingHistory {
  success: boolean
  message: string
  postsProcessed: number
  postsSuccessful: number
  errors: string[]
  timestamp: string
}

export default function TwitterScheduler() {
  const [schedulerStatus, setSchedulerStatus] =
    useState<SchedulerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const { activeAccountByPlatform, activePlatform } = useAccountStore()
  const activeAccountId = activeAccountByPlatform["twitter"]
  const activeAccount = ACCOUNTS.find((a) => a.id === activeAccountId)

  const isRunning = schedulerStatus?.status === "running"

  const getAccountName = () => {
    if (!activeAccount) return "maria"
    // Map from display names to backend account names
    if (activeAccount.displayName === "@maria_in_tech") return "maria"
    if (activeAccount.displayName === "@me_divya") return "divya"
    return "maria" // default
  }
  console.log(getAccountName())

  const startScheduler = async () => {
    setIsStarting(true)
    setError(null)

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }scheduler/start?account=${getAccountName()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to start scheduler")
      }

      const result = await response.json()
      console.log("Scheduler started successfully:", result)

      // Refresh status after starting
      fetchSchedulerStatus()
    } catch (error) {
      console.error("Error starting scheduler:", error)
      setError("Failed to start scheduler. Please try again.")
    } finally {
      setIsStarting(false)
    }
  }

  const stopScheduler = async () => {
    setIsStopping(true)
    setError(null)

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }scheduler/stop?account=${getAccountName()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to stop scheduler")
      }

      const result = await response.json()
      console.log("Scheduler stopped successfully:", result)

      // Refresh status after stopping
      fetchSchedulerStatus()
    } catch (error) {
      console.error("Error stopping scheduler:", error)
      setError("Failed to stop scheduler. Please try again.")
    } finally {
      setIsStopping(false)
    }
  }

  const postNow = async () => {
    setError(null)

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }scheduler/manual-post?account=${getAccountName()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to trigger immediate posting")
      }

      const result = await response.json()
      console.log("Immediate posting triggered successfully:", result)

      // You might want to show a success message or refresh data
    } catch (error) {
      console.error("Error triggering immediate posting:", error)
      setError("Failed to trigger immediate posting. Please try again.")
    }
  }

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }scheduler/status?account=${getAccountName()}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch scheduler status")
      }

      const status = await response.json()
      setSchedulerStatus(status)
    } catch (error) {
      console.error("Error fetching scheduler status:", error)
      setError("Failed to load scheduler status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedulerStatus()
  }, [activeAccount])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Auto-Posting Manager
          </h3>
          <p className="text-gray-500">Checking scheduler status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 sm:p-10 pb-4 sm:pb-6">
        <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Auto-Posting Manager
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Automate Instagram posting with intelligent content selection
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={startScheduler}
              disabled={isRunning || isStarting}
              className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-xl bg-emerald-600 text-white text-sm sm:text-base font-medium shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isStarting ? "Starting..." : "Start Schedule"}
            </button>

            <button
              onClick={stopScheduler}
              disabled={!isRunning || isStopping}
              className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-xl bg-rose-600 text-white text-sm sm:text-base font-medium shadow-sm hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStopping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {isStopping ? "Stopping..." : "Stop"}
            </button>

            <button
              onClick={postNow}
              className="inline-flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-xl bg-blue-600 text-white text-sm sm:text-base font-semibold shadow-sm hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <Zap className="w-4 h-4" />
              Post Now
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Scheduler Status */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Scheduler Status
              </h3>
              <span
                className={
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm " +
                  (isRunning
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-gray-50 text-gray-700 border border-gray-200")
                }
              >
                <span
                  className={
                    "w-2 h-2 rounded-full " +
                    (isRunning ? "bg-emerald-500" : "bg-gray-400")
                  }
                ></span>
                {isRunning ? "Running" : "Stopped"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="text-gray-900">
                  {schedulerStatus?.startedAt
                    ? new Date(schedulerStatus.startedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Next Run:</span>
                <span className="text-gray-900">
                  {schedulerStatus?.nextRun
                    ? new Date(schedulerStatus.nextRun).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Schedule:</span>
                <span className="text-gray-900 font-mono text-sm">
                  {schedulerStatus?.config?.cronExpression || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="text-gray-900">
                  {schedulerStatus?.uptime
                    ? `${schedulerStatus.uptime} min`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
