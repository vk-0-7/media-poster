import Dashboard from "@/components/Dashboard"
import React from "react"

// Platform-specific components
import InstagramDashboard from "@/components/Instagram/dashboard"
import InstagramScheduler from "@/components/Instagram/scheduler"
import TwitterDashboard from "@/components/twitter/dashboard"
import TwitterScheduler from "@/components/twitter/scheduler"
import BlueskyDashboard from "@/components/Bluesky/dashboard"
import BlueskyScheduler from "@/components/Bluesky/scheduler"
import ThreadsDashboard from "@/components/Thread/dashboard"
import ThreadsScheduler from "@/components/Thread/scheduler"

interface PageProps {
  params: {
    platform: string
    page: string
  }
}

const Page = ({ params }: PageProps) => {
  const { platform, page } = params

  // Component mapping based on platform and page
  const getPageComponent = () => {
    const key = `${platform}-${page}`

    const componentMap: Record<string, React.ReactNode> = {
      // Instagram
      "instagram-dashboard": <InstagramDashboard />,
      "instagram-scheduler": <InstagramScheduler />,

      // Twitter
      "twitter-dashboard": <TwitterDashboard />,
      "twitter-scheduler": <TwitterScheduler />,

      // Bluesky
      "bluesky-dashboard": <BlueskyDashboard />,
      "bluesky-scheduler": <BlueskyScheduler />,

      // Threads
      "threads-dashboard": <ThreadsDashboard />,
      "threads-scheduler": <ThreadsScheduler />,
    }

    return componentMap[key] || (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-slate-600">
            No component found for {platform} - {page}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Dashboard>
      {getPageComponent()}
    </Dashboard>
  )
}

export default Page
