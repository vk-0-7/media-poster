"use client"

import { useState } from "react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "uploads", label: "Uploads", icon: "📤" },
  { id: "schedule", label: "Auto-Posting", icon: "🤖" },
  { id: "settings", label: "Settings", icon: "⚙️" },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen flex flex-col shadow-soft">
      {/* Logo Section */}
      <div className="px-8 py-8 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-medium">
            <span className="text-white text-xl font-bold">I</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">InstaPoster</h1>
            <p className="text-sm text-gray-500 mt-1">Content Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-8">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">
            Navigation
          </h3>
        </div>

        <ul className="space-y-3">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-left transition-all duration-200 group ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 shadow-soft"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-soft"
                }`}
              >
                <span
                  className={`text-xl transition-transform duration-200 group-hover:scale-110 ${
                    activeTab === item.id ? "animate-pulse" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-base">{item.label}</span>

                {activeTab === item.id && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-soft border border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-medium">
            <span className="text-white text-lg font-bold">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">User Account</p>
            <p className="text-xs text-gray-500 mt-1">Free Plan</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <span className="text-lg">⚙️</span>
          </button>
        </div>
      </div>
    </div>
  )
}
