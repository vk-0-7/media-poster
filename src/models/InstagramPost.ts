import mongoose from "mongoose"

const InstagramPostSchema = new mongoose.Schema(
  {
    // Basic post information
    id: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // "Video" or "Image"
    shortCode: { type: String, required: true },
    caption: { type: String, default: "" },
    hashtags: [{ type: String }],
    mentions: [{ type: String }],
    url: { type: String, required: true },

    // Engagement metrics
    commentsCount: { type: Number, default: 0 },
    firstComment: { type: String, default: "" },
    latestComments: [{ type: mongoose.Schema.Types.Mixed }],
    likesCount: { type: Number, default: -1 }, // -1 when hidden
    videoViewCount: { type: Number, default: 0 },
    videoPlayCount: { type: Number, default: 0 },

    // Media information
    dimensionsHeight: { type: Number, default: 0 },
    dimensionsWidth: { type: Number, default: 0 },
    displayUrl: { type: String, default: "" },
    images: [{ type: mongoose.Schema.Types.Mixed }],
    videoUrl: { type: String, default: "" },
    alt: { type: String, default: null },

    // Metadata
    timestamp: { type: Date, required: true },
    childPosts: [{ type: mongoose.Schema.Types.Mixed }],
    ownerFullName: { type: String, required: true },
    ownerUsername: { type: String, required: true },
    ownerId: { type: String, required: true },
    productType: { type: String, default: "" },
    videoDuration: { type: Number, default: 0 },
    isSponsored: { type: Boolean, default: false },
    musicInfo: { type: mongoose.Schema.Types.Mixed, default: null },
    isCommentsDisabled: { type: Boolean, default: false },

    // Additional fields for our app
    isSelected: { type: Boolean, default: false },
    isSkipped: { type: Boolean, default: false },
    customCaption: { type: String, default: "" },
    scheduledTime: { type: Date, default: null },
    uploadedAt: { type: Date, default: Date.now },
    userId: { type: String, default: "anonymous" }, // For future user management

    // Auto-posting tracking
    lastPostedAt: { type: Date, default: null },
    timesPosted: { type: Number, default: 0 },
    instagramPostIds: [{ type: String }], // Track multiple Instagram post IDs if reposted
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Create indexes for better query performance
InstagramPostSchema.index({ id: 1 })
InstagramPostSchema.index({ ownerUsername: 1 })
InstagramPostSchema.index({ timestamp: -1 })
InstagramPostSchema.index({ videoViewCount: -1 })
InstagramPostSchema.index({ likesCount: -1 })
InstagramPostSchema.index({ uploadedAt: -1 })

export default mongoose.models.InstagramPost ||
  mongoose.model("InstagramPost", InstagramPostSchema)
