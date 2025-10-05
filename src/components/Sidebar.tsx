"use client"

import { useState } from "react"
import { BarChart3, Upload, Bot, Settings, X, Instagram } from "lucide-react"
import { PLATFORMS } from "./../data/accountsData"
import { Platform } from "@/types"
import { useAccountStore } from "@/store/accountStore"
import { useParams, useRouter } from "next/navigation"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const router = useRouter()
  const { activePlatform, setActivePlatform } = useAccountStore()
  const params = useParams()
  const platform = params?.platform
  const page = params?.page

  // console.log(platform, page)

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen bg-white/95 backdrop-blur-xl border-r border-indigo-100/80 flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isOpen ? "w-80" : "w-0 lg:w-80"} overflow-hidden`}
      >
        {/* Close Button for Mobile */}
        <button
          onClick={onToggle}
          className="absolute top-6 right-6 lg:hidden z-10 p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 transition-all duration-200 hover:scale-105"
        >
          <X className="w-5 h-5 text-indigo-600" />
        </button>

        <div className="w-80 flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-8 py-8 border-b border-indigo-100/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform transition-transform hover:scale-110 duration-300">
                  <Instagram className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  mediaPoster
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Content Automation</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-5 py-6 overflow-y-auto">
            <div className="space-y-8">
              {PLATFORMS.map((item: Platform) => {
                return (
                  <div key={item} className="space-y-2">
                    {/* Platform Header */}
                    <div className="flex items-center space-x-2 px-4 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent" />
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                        {item}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-l from-indigo-200 to-transparent" />
                    </div>

                    {/* Platform Navigation Items */}
                    <div className="space-y-1.5">
                      <li className="list-none">
                        <button
                          onClick={() => {
                            router.push(`/${item}/dashboard`)
                            setActivePlatform(item)
                          }}
                          className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                            platform === item && page == "dashboard"
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                              : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-200/50"
                          }`}
                        >
                          {/* Active Indicator */}
                          {platform === item && page == "dashboard" && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                          )}

                          <BarChart3 className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                            platform === item && page == "dashboard" ? "" : "opacity-60"
                          }`} />
                          <span className="font-semibold text-sm tracking-wide">Dashboard</span>
                        </button>
                      </li>

                      <li className="list-none">
                        <button
                          onClick={() => {
                            setActivePlatform(item)
                            router.push(`/${activePlatform}/scheduler`)
                          }}
                          className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                            platform === item && page == "scheduler"
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                              : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-200/50"
                          }`}
                        >
                          {/* Active Indicator */}
                          {platform === item && page == "scheduler" && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg" />
                          )}

                          <Bot className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                            platform === item && page == "scheduler" ? "" : "opacity-60"
                          }`} />
                          <span className="font-semibold text-sm tracking-wide">Scheduler</span>
                        </button>
                      </li>
                    </div>
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-5 py-6 border-t border-indigo-100/50">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Settings</p>
                  <p className="text-xs text-slate-500">Manage preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
