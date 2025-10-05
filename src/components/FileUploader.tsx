"use client"

import { useCallback, useState } from "react"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react"
import { ACCOUNTS, getAccountFromLocalStorage } from "../config/accounts"

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
  const [selectedAccount, setSelectedAccount] = useState(
    getAccountFromLocalStorage()
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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-12">
      <div className="w-full max-w-4xl">
        {/* Account Tabs */}
        <div className="w-full mb-6 flex justify-center">
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-sm">
            {ACCOUNTS.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  if (selectedAccount.id !== account.id) {
                    setSelectedAccount(account)
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem("selectedAccount", account.id)
                    }
                  }
                }}
                className={
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
                  (selectedAccount.id === account.id
                    ? "bg-white text-gray-900 shadow border border-gray-200"
                    : "text-gray-600 hover:text-gray-900")
                }
              >
                {account.displayName}
              </button>
            ))}
          </div>
        </div>
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome to <span className="gradient-text">mediaPoster</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload your Instagram data and let us help you create the perfect
            posting schedule
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`w-full border-3 border-dashed rounded-3xl p-6 sm:p-16 text-center transition-all duration-300 hover:shadow-xl ${
            isDragOver
              ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-2xl"
              : "border-gray-300 hover:border-blue-300 hover:bg-gray-50 shadow-large"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin shadow-large"></div>
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Processing your Instagram data...
                </h3>
                <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
                  Please wait while we analyze your Instagram posts and prepare
                  your dashboard
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-48 sm:w-64 mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Icon */}

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Upload Instagram Data
                  </h3>
                  <p className="text-base sm:text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
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
                    className="inline-flex items-center px-6 py-4 md:px-8 md:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-base sm:text-lg rounded-2xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  >
                    <Upload className="w-5 h-5 mr-2 sm:mr-3" />
                    Upload & Process
                  </label>
                </div>

                {/* File Info */}
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instagram JSON export files</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                      <span>Maximum file size: 50MB</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-500" />
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
