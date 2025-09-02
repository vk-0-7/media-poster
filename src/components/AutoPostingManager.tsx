"use client"

import { useState, useEffect } from "react"

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

export default function AutoPostingManager() {
  const [schedulerStatus, setSchedulerStatus] =
    useState<SchedulerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [lastJobResult, setLastJobResult] = useState<PostingHistory | null>(
    null
  )

  // Form state for scheduler configuration
  const [config, setConfig] = useState({
    cronExpression: "0 9,15,21 * * *", // 9 AM, 3 PM, 9 PM daily
    timezone: "America/New_York",
    minViews: 5000,
    maxPostsPerDay: 2,
    preferredTypes: ["Video"],
    minLikes: 500,
  })

  const fetchSchedulerStatus = async () => {
    try {
      setError(null)
      const response = await fetch("/api/cron/scheduler", {
        headers: {
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_CRON_API_KEY || "demo-key"
          }`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch scheduler status")
      }

      const data = await response.json()
      setSchedulerStatus(data.scheduler)
    } catch (err) {
      console.error("Error fetching scheduler status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const startScheduler = async () => {
    try {
      setIsStarting(true)
      setError(null)

      const response = await fetch("/api/cron/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_CRON_API_KEY || "demo-key"
          }`,
        },
        body: JSON.stringify({
          action: "start",
          config: {
            cronExpression: config.cronExpression,
            timezone: config.timezone,
            postingCriteria: {
              minViews: config.minViews,
              maxPostsPerDay: config.maxPostsPerDay,
              preferredTypes: config.preferredTypes,
              minLikes: config.minLikes,
            },
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to start scheduler")
      }

      await fetchSchedulerStatus()
    } catch (err) {
      console.error("Error starting scheduler:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsStarting(false)
    }
  }

  const stopScheduler = async () => {
    try {
      setIsStopping(true)
      setError(null)

      const response = await fetch("/api/cron/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_CRON_API_KEY || "demo-key"
          }`,
        },
        body: JSON.stringify({
          action: "stop",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to stop scheduler")
      }

      await fetchSchedulerStatus()
    } catch (err) {
      console.error("Error stopping scheduler:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsStopping(false)
    }
  }

  const runNow = async () => {
    try {
      setError(null)

      const response = await fetch("/api/cron/auto-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_CRON_API_KEY || "demo-key"
          }`,
        },
        body: JSON.stringify({
          minViews: config.minViews,
          maxPostsPerDay: config.maxPostsPerDay,
          preferredTypes: config.preferredTypes,
          minLikes: config.minLikes,
        }),
      })

      const result = await response.json()

      setLastJobResult({
        ...result,
        timestamp: new Date().toISOString(),
      })

      if (!response.ok) {
        throw new Error(result.error || "Failed to run posting job")
      }
    } catch (err) {
      console.error("Error running posting job:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    fetchSchedulerStatus()

    // Refresh status every 30 seconds
    const interval = setInterval(fetchSchedulerStatus, 30000)
    return () => clearInterval(interval)
  }, [])

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
      <div className="flex-shrink-0 p-10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Auto-Posting Manager
            </h2>
            <p className="text-lg text-gray-600">
              Automate Instagram posting with intelligent content selection
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                schedulerStatus?.status === "running"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {schedulerStatus?.status === "running"
                ? "🟢 Active"
                : "⚫ Stopped"}
            </div>
            <button
              onClick={fetchSchedulerStatus}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
            >
              🔄 Refresh
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
      <div className="flex-1 overflow-y-auto px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scheduler Status */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Scheduler Status
            </h3>

            {schedulerStatus?.status === "running" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">🟢 Running</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="text-gray-900">
                    {schedulerStatus.startedAt
                      ? new Date(schedulerStatus.startedAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next Run:</span>
                  <span className="text-gray-900">
                    {schedulerStatus.nextRun
                      ? new Date(schedulerStatus.nextRun).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {schedulerStatus.config?.cronExpression || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="text-gray-900">
                    {schedulerStatus.uptime
                      ? `${schedulerStatus.uptime} min`
                      : "N/A"}
                  </span>
                </div>

                <button
                  onClick={stopScheduler}
                  disabled={isStopping}
                  className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isStopping ? "⏹️ Stopping..." : "⏹️ Stop Scheduler"}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">⏸️</span>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Scheduler Stopped
                </h4>
                <p className="text-gray-500 mb-4">
                  Configure settings and start automated posting
                </p>

                <button
                  onClick={startScheduler}
                  disabled={isStarting}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isStarting ? "🚀 Starting..." : "🚀 Start Scheduler"}
                </button>
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  value={config.cronExpression}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cronExpression: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="0 9,15,21 * * *"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: 9 AM, 3 PM, 9 PM daily
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={config.timezone}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Views
                  </label>
                  <input
                    type="number"
                    value={config.minViews}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        minViews: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Likes
                  </label>
                  <input
                    type="number"
                    value={config.minLikes}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        minLikes: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Posts Per Day
                </label>
                <input
                  type="number"
                  value={config.maxPostsPerDay}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxPostsPerDay: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Content Types
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.preferredTypes.includes("Video")}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...config.preferredTypes, "Video"]
                          : config.preferredTypes.filter(
                              (type) => type !== "Video"
                            )
                        setConfig((prev) => ({
                          ...prev,
                          preferredTypes: newTypes,
                        }))
                      }}
                      className="mr-2"
                    />
                    Video
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.preferredTypes.includes("Image")}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...config.preferredTypes, "Image"]
                          : config.preferredTypes.filter(
                              (type) => type !== "Image"
                            )
                        setConfig((prev) => ({
                          ...prev,
                          preferredTypes: newTypes,
                        }))
                      }}
                      className="mr-2"
                    />
                    Image
                  </label>
                </div>
              </div>

              <button
                onClick={runNow}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200"
              >
                🎬 Test Run Now
              </button>
            </div>
          </div>
        </div>

        {/* Last Job Result */}
        {lastJobResult && (
          <div className="mt-8 bg-white rounded-2xl shadow-soft border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Last Job Result
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${
                    lastJobResult.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {lastJobResult.success ? "✅ Success" : "❌ Failed"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="text-gray-900">
                  {new Date(lastJobResult.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Posts Processed:</span>
                <span className="text-gray-900">
                  {lastJobResult.postsProcessed}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Successful Posts:</span>
                <span className="text-green-600 font-medium">
                  {lastJobResult.postsSuccessful}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Message:</span>
                <span className="text-gray-900">{lastJobResult.message}</span>
              </div>

              {lastJobResult.errors.length > 0 && (
                <div>
                  <span className="text-gray-600 block mb-2">Errors:</span>
                  <div className="bg-red-50 rounded-lg p-3">
                    {lastJobResult.errors.map((error, index) => (
                      <div key={index} className="text-red-700 text-sm">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
