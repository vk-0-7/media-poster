"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import Sidebar from "./Sidebar"
import FileUploader from "./FileUploader"
import PostsPreview from "./PostsPreview"
import UploadsHistory from "./UploadsHistory"
import AutoPostingManager from "./AutoPostingManager"

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [uploadedData, setUploadedData] = useState<InstagramPost[]>([])
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleFileUpload = (data: InstagramPost[]) => {
    setUploadedData(data)
    setPosts(data)
  }

  const handleLoadPostsFromDB = (data: InstagramPost[]) => {
    setPosts(data)
    setActiveTab("dashboard") // Switch to dashboard to show loaded posts
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return posts.length > 0 ? (
          <PostsPreview posts={posts} />
        ) : (
          <FileUploader onFileUpload={handleFileUpload} />
        )

      case "uploads":
        return <UploadsHistory onLoadPosts={handleLoadPostsFromDB} />

      case "schedule":
        return <AutoPostingManager />

      default:
        return <FileUploader onFileUpload={handleFileUpload} />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-8 py-4 sm:py-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 md:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-medium">
                  <span className="text-white text-base sm:text-lg font-bold">
                    {activeTab.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {activeTab === "dashboard" &&
                      "Manage your Instagram content"}
                    {activeTab === "uploads" &&
                      "View upload history and analytics"}
                    {activeTab === "schedule" &&
                      "Automate your Instagram posting"}
                    {activeTab === "settings" && "Configure your preferences"}
                  </p>
                </div>
              </div>

              {posts.length > 0 && (
                <div className="hidden sm:flex items-center space-x-3 bg-blue-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-blue-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-xs sm:text-sm font-medium text-blue-700">
                    {posts.length} posts loaded
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gradient-to-br from-slate-50/50 to-blue-50/50 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
