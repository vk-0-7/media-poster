"use client"

import React, { useState, useCallback } from "react"
import { Upload, CheckCircle2, Loader2 } from "lucide-react"
import { useAccountStore } from "@/store/accountStore"

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

const InstaDashboard = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedPosts, setUploadedPosts] = useState<InstagramPost[]>([])
  const { activeAccountByPlatform, activePlatform } = useAccountStore()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setUploadSuccess(false)

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          console.log(data)
          setUploadedPosts(data)

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}instagram/uploadJSON?account=${activeAccountByPlatform[activePlatform]}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          )

          setUploadSuccess(true)
          setTimeout(() => setUploadSuccess(false), 3000)
        } catch (error) {
          console.error("Error parsing JSON:", error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Instagram Dashboard
          </h1>
          <p className="text-slate-600">
            Upload and manage your Instagram content
          </p>
        </div>

        {/* Upload Button */}
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="instagram-file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="instagram-file-upload"
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
              text-white bg-gradient-to-r from-indigo-600 to-purple-600
              shadow-lg shadow-indigo-500/30
              transition-all duration-300 cursor-pointer
              ${
                isUploading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
              }
              ${
                uploadSuccess
                  ? "from-green-600 to-emerald-600 shadow-green-500/30"
                  : ""
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Uploaded!
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload JSON
              </>
            )}
          </label>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {uploadedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uploadedPosts.slice(0, 12).map((post) => (
              <div
                key={post.id}
                className="group relative bg-white rounded-2xl border border-indigo-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Post Image/Video */}
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  {post.videoUrl || post.displayUrl ? (
                    <img
                      src={post.displayUrl}
                      alt={post.alt || "Instagram post"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No media
                    </div>
                  )}

                  {/* Video Indicator */}
                  {post.videoUrl && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      VIDEO
                    </div>
                  )}
                </div>

                {/* Post Info */}
                <div className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {post.caption || "No caption"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>❤️ {post.likesCount.toLocaleString()}</span>
                    <span>💬 {post.commentsCount.toLocaleString()}</span>
                    {post.videoViewCount && (
                      <span>👁️ {post.videoViewCount.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center">
                <Upload className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No posts uploaded yet
              </h3>
              <p className="text-slate-600">
                Upload your Instagram JSON file to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InstaDashboard
