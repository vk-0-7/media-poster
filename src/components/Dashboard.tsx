"use client"

import { ReactNode, useMemo, useState } from "react"
import { BarChart3, Bot, Menu, Upload } from "lucide-react"
import Sidebar from "./Sidebar"
import UploadsHistory from "./UploadsHistory"
import AutoPostingManager from "./Instagram/scheduler"
import { ACCOUNTS } from "@/data/accountsData"
import { useAccountStore } from "@/store/accountStore"
import { Account } from "@/types"

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

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const { activePlatform, activeAccountByPlatform } = useAccountStore()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [uploadedData, setUploadedData] = useState<InstagramPost[]>([])
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  var handleFileUpload = (data: InstagramPost[]) => {
    setUploadedData(data)
    setPosts(data)
  }

  var handleLoadPostsFromDB = (data: InstagramPost[]) => {
    setPosts(data)
    setActiveTab("dashboard") // Switch to dashboard to show loaded posts
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
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
        {/* Top Navigation Bar - Fixed & Scrollable */}
        <div className="sticky top-0 z-30 border-b border-indigo-100/80 bg-white/95 backdrop-blur-xl shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/60 hover:border-indigo-300 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5 text-indigo-600" />
              </button>

              {/* Account Switcher - Horizontal Scroll */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2 sm:gap-3 min-w-max">
                  {ACCOUNTS?.filter((v: Account) => v.platform == activePlatform)?.map(
                    (a: Account) => {
                      const isActive = activeAccountByPlatform[a.platform] === a.id
                      return (
                        <button
                          key={a.id}
                          className={`
                            group relative px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl
                            transition-all duration-300 ease-out
                            flex items-center gap-2 sm:gap-3 min-w-fit
                            ${
                              isActive
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105"
                                : "bg-white text-slate-700 hover:bg-indigo-50 border border-indigo-200/60 hover:border-indigo-300 hover:shadow-md"
                            }
                          `}
                          onClick={() =>
                            useAccountStore.getState().setActiveAccount(a.platform, a.id)
                          }
                        >
                          {/* Active Indicator Glow */}
                          {isActive && (
                            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-10 blur-xl" />
                          )}

                          {/* Avatar */}
                          {a.avatarUrl && (
                            <div className="relative z-10">
                              <img
                                src={a.avatarUrl}
                                alt={a.displayName || a.handle}
                                className={`
                                  w-7 h-7 sm:w-9 sm:h-9 rounded-full ring-2 transition-all duration-300
                                  ${isActive ? "ring-white/40 shadow-md" : "ring-indigo-200/50 group-hover:ring-indigo-300"}
                                `}
                              />
                              {isActive && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                              )}
                            </div>
                          )}

                          {/* Account Info */}
                          <div className="flex flex-col items-start z-10">
                            <span className={`font-semibold text-xs sm:text-sm leading-tight ${isActive ? "text-white" : "text-slate-800"}`}>
                              {a.displayName || a.handle}
                            </span>
                            <span className={`text-[10px] sm:text-xs font-medium ${isActive ? "text-indigo-100" : "text-slate-500"}`}>
                              {a.platform}
                            </span>
                          </div>
                        </button>
                      )
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Modern Card Design */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="h-full rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-sm border border-indigo-100/50 shadow-xl overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
