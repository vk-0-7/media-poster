export type Platform = "instagram" | "twitter" | "facebook" | "tiktok"
export type Account = {
  id: string
  platform: Platform
  handle: string
  displayName: string
  avatarUrl?: string
  connected?: boolean
}
