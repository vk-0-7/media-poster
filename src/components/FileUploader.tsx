"use client"

import { useCallback, useState } from "react"

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

interface FileUploaderProps {
  onFileUpload: (data: InstagramPost[]) => void
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<
    "dreamchasers" | "codingwithbugs"
  >(
    (typeof window !== "undefined" &&
      (window.localStorage.getItem("selectedAccount") as
        | "dreamchasers"
        | "codingwithbugs")) ||
      "dreamchasers"
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const jsonFile = files.find(
      (file) => file.type === "application/json" || file.name.endsWith(".json")
    )
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setIsUploading(true)
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = JSON.parse(e.target?.result as string)
          onFileUpload(data)
        }
        reader.readAsText(file)
      }
    },
    []
  )

  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="w-full max-w-4xl">
        {/* Account Tabs */}
        <div className="w-full mb-6 flex justify-center">
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => {
                if (selectedAccount !== "dreamchasers") {
                  setSelectedAccount("dreamchasers")
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                      "selectedAccount",
                      "dreamchasers"
                    )
                  }
                }
              }}
              className={
                "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
                (selectedAccount === "dreamchasers"
                  ? "bg-white text-gray-900 shadow border border-gray-200"
                  : "text-gray-600 hover:text-gray-900")
              }
            >
              DreamChasers
            </button>
            <button
              onClick={() => {
                if (selectedAccount !== "codingwithbugs") {
                  setSelectedAccount("codingwithbugs")
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                      "selectedAccount",
                      "codingwithbugs"
                    )
                  }
                }
              }}
              className={
                "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
                (selectedAccount === "codingwithbugs"
                  ? "bg-white text-gray-900 shadow border border-gray-200"
                  : "text-gray-600 hover:text-gray-900")
              }
            >
              CodingWithBugs
            </button>
          </div>
        </div>
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="gradient-text">InstaPoster</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload your Instagram data and let us help you create the perfect
            posting schedule
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`w-full border-3 border-dashed rounded-3xl p-16 text-center transition-all duration-300 hover:shadow-xl ${
            isDragOver
              ? "border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 shadow-2xl"
              : "border-gray-300 hover:border-purple-300 hover:bg-gray-50 shadow-large"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-8">
              <div className="w-24 h-24 mx-auto border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin shadow-large"></div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Processing your Instagram data...
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  Please wait while we analyze your Instagram posts and prepare
                  your dashboard
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-64 mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Icon */}
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-large">
                <span className="text-5xl">📁</span>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Upload Instagram Data
                  </h3>
                  <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Drag and drop your Instagram JSON file here, or click the
                    button below to browse
                  </p>
                </div>

                {/* Upload Button */}
                <div className="space-y-6">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-2xl cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  >
                    <span className="mr-3 text-2xl">📤</span>
                    Upload & Process
                  </label>
                </div>

                {/* File Info */}
                <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Instagram JSON export files</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Maximum file size: 50MB</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span>Secure & encrypted processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Check out our{" "}
            <a
              href="#"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              documentation
            </a>{" "}
            or{" "}
            <a
              href="#"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
