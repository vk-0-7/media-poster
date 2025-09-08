"use client"

import { useState } from "react"
import { BarChart3, Upload, Bot, Settings, X, Instagram } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
  onToggle: () => void
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "schedule", label: "Auto-Posting", icon: Bot },
]

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-soft z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isOpen ? "w-72" : "w-0 lg:w-72"} overflow-hidden`}
      >
        {/* Hamburger Menu Button */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 lg:hidden z-10 p-2 md:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-72">
          {/* Logo Section */}
          <div className="px-8 py-8 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-medium">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  InstaPoster
                </h1>
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

            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 md:px-6 md:py-4 rounded-xl text-left transition-all duration-200 group ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                          activeTab === item.id
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="font-medium text-sm">{item.label}</span>

                      {activeTab === item.id && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
