import { NextRequest, NextResponse } from "next/server"
import cron from "node-cron"

interface ScheduleConfig {
  enabled: boolean
  cronExpression: string
  timezone: string
  postingCriteria: {
    minViews: number
    maxPostsPerDay: number
    preferredTypes: string[]
    minLikes: number
  }
}

// Store active cron jobs
const activeCronJobs = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    console.log("⚙️ Configuring cron job scheduler...")

    // Verify authorization
    const authHeader = request.headers.get("authorization")
    const expectedAuth = `Bearer ${process.env.CRON_API_KEY}`

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action // 'start', 'stop', 'update', 'status'

    switch (action) {
      case "start":
        return await startScheduler(body.config)

      case "stop":
        return await stopScheduler()

      case "update":
        return await updateScheduler(body.config)

      case "status":
        return await getSchedulerStatus()

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: start, stop, update, or status" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("❌ Scheduler API error:", error)
    return NextResponse.json(
      {
        error: "Scheduler operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

async function startScheduler(config: ScheduleConfig) {
  try {
    const scheduleConfig: ScheduleConfig = {
      enabled: true,
      cronExpression: config.cronExpression || "0 9,15,21 * * *", // 9 AM, 3 PM, 9 PM daily
      timezone: config.timezone || "America/New_York",
      postingCriteria: {
        minViews: config.postingCriteria?.minViews || 5000,
        maxPostsPerDay: config.postingCriteria?.maxPostsPerDay || 2,
        preferredTypes: config.postingCriteria?.preferredTypes || ["Video"],
        minLikes: config.postingCriteria?.minLikes || 500,
      },
    }

    // Validate cron expression
    if (!cron.validate(scheduleConfig.cronExpression)) {
      return NextResponse.json(
        { error: "Invalid cron expression" },
        { status: 400 }
      )
    }

    // Stop existing scheduler if running
    await stopScheduler()

    console.log(
      `⏰ Starting scheduler with expression: ${scheduleConfig.cronExpression}`
    )

    // Create and start the cron job
    const cronJob = cron.schedule(
      scheduleConfig.cronExpression,
      async () => {
        console.log("🕐 Cron job triggered - starting auto-posting...")

        try {
          // Make request to auto-post endpoint
          const response = await fetch(
            `${
              process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/api/cron/auto-post`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.CRON_API_KEY}`,
              },
              body: JSON.stringify(scheduleConfig.postingCriteria),
            }
          )

          const result = await response.json()

          if (result.success) {
            console.log(`✅ Auto-posting completed: ${result.message}`)
          } else {
            console.error(`❌ Auto-posting failed: ${result.message}`)
          }
        } catch (error) {
          console.error("❌ Cron job execution error:", error)
        }
      },
      {
        // scheduled: false,
        timezone: scheduleConfig.timezone,
      }
    )

    // Start the job
    cronJob.start()

    // Store the active job
    activeCronJobs.set("auto-post", {
      job: cronJob,
      config: scheduleConfig,
      startedAt: new Date(),
      status: "running",
    })

    console.log(`🚀 Auto-posting scheduler started successfully`)

    return NextResponse.json({
      success: true,
      message: "Auto-posting scheduler started",
      config: scheduleConfig,
      nextRun: getNextRunTime(
        scheduleConfig.cronExpression,
        scheduleConfig.timezone
      ),
    })
  } catch (error) {
    console.error("❌ Failed to start scheduler:", error)
    return NextResponse.json(
      {
        error: "Failed to start scheduler",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

async function stopScheduler() {
  try {
    const activeJob = activeCronJobs.get("auto-post")

    if (activeJob) {
      activeJob.job.stop()
      activeJob.job.destroy()
      activeCronJobs.delete("auto-post")

      console.log("⏹️ Auto-posting scheduler stopped")

      return NextResponse.json({
        success: true,
        message: "Auto-posting scheduler stopped",
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "No active scheduler to stop",
      })
    }
  } catch (error) {
    console.error("❌ Failed to stop scheduler:", error)
    return NextResponse.json(
      {
        error: "Failed to stop scheduler",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

async function updateScheduler(config: ScheduleConfig) {
  try {
    // Stop current scheduler
    await stopScheduler()

    // Start with new config
    return await startScheduler(config)
  } catch (error) {
    console.error("❌ Failed to update scheduler:", error)
    return NextResponse.json(
      {
        error: "Failed to update scheduler",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

async function getSchedulerStatus() {
  try {
    const activeJob = activeCronJobs.get("auto-post")

    if (activeJob) {
      return NextResponse.json({
        success: true,
        status: "running",
        config: activeJob.config,
        startedAt: activeJob.startedAt,
        nextRun: getNextRunTime(
          activeJob.config.cronExpression,
          activeJob.config.timezone
        ),
        uptime: Math.round(
          (Date.now() - activeJob.startedAt.getTime()) / 1000 / 60
        ), // minutes
      })
    } else {
      return NextResponse.json({
        success: true,
        status: "stopped",
        message: "No active scheduler running",
      })
    }
  } catch (error) {
    console.error("❌ Failed to get scheduler status:", error)
    return NextResponse.json(
      {
        error: "Failed to get scheduler status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

function getNextRunTime(cronExpression: string, timezone: string): string {
  try {
    // This is a simplified calculation - in production you might want to use a proper library
    const now = new Date()
    const cronParts = cronExpression.split(" ")

    if (cronParts.length >= 5) {
      // Basic parsing for hour (assuming daily schedules)
      const hours = cronParts[1].split(",").map((h) => parseInt(h))
      const currentHour = now.getHours()

      for (const hour of hours.sort((a, b) => a - b)) {
        if (hour > currentHour) {
          const nextRun = new Date(now)
          nextRun.setHours(hour, 0, 0, 0)
          return nextRun.toISOString()
        }
      }

      // Next day
      const nextRun = new Date(now)
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(hours[0], 0, 0, 0)
      return nextRun.toISOString()
    }

    return "Unable to calculate"
  } catch (error) {
    return "Error calculating next run"
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return scheduler status and available commands
    const activeJob = activeCronJobs.get("auto-post")

    return NextResponse.json({
      scheduler: {
        status: activeJob ? "running" : "stopped",
        config: activeJob?.config || null,
        startedAt: activeJob?.startedAt || null,
        nextRun: activeJob
          ? getNextRunTime(
              activeJob.config.cronExpression,
              activeJob.config.timezone
            )
          : null,
      },
      availableActions: ["start", "stop", "update", "status"],
      sampleConfig: {
        action: "start",
        config: {
          cronExpression: "0 9,15,21 * * *",
          timezone: "America/New_York",
          postingCriteria: {
            minViews: 5000,
            maxPostsPerDay: 2,
            preferredTypes: ["Video"],
            minLikes: 500,
          },
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get scheduler info" },
      { status: 500 }
    )
  }
}
