import type { Account, Platform } from "../types"

export const PLATFORMS: Platform[] = [
  "instagram",
  "twitter",
  "facebook",
  "tiktok",
]

// fixed 4 accounts per platform
export const ACCOUNTS: Account[] = [
  // Instagram (4)
  {
    id: "ig-1",
    platform: "instagram",
    handle: "@coding_with_bugs",
    displayName: "@Coding_with_bugs",
  },
  {
    id: "ig-2",
    platform: "instagram",
    handle: "@dream_chasers",
    displayName: "@dream_chasers",
  },
  {
    id: "ig-3",
    platform: "instagram",
    handle: "@vallendros",
    displayName: "@vallendros",
  },
  {
    id: "ig-4",
    platform: "instagram",
    handle: "@dailyAIInsights",
    displayName: "@dailyAIInsights",
  },

  // Twitter (4)
  { id: "tw-1", platform: "twitter", handle: "@tw_one", displayName: "TW One" },
  { id: "tw-2", platform: "twitter", handle: "@tw_two", displayName: "TW Two" },
  {
    id: "tw-3",
    platform: "twitter",
    handle: "@tw_three",
    displayName: "TW Three",
  },

  // Facebook (4)
  { id: "fb-1", platform: "facebook", handle: "FB One", displayName: "FB One" },
  { id: "fb-2", platform: "facebook", handle: "FB Two", displayName: "FB Two" },
  {
    id: "fb-3",
    platform: "facebook",
    handle: "FB Three",
    displayName: "FB Three",
  },
  {
    id: "fb-4",
    platform: "facebook",
    handle: "FB Four",
    displayName: "FB Four",
  },

  // Tiktok (4)
  { id: "tt-1", platform: "tiktok", handle: "@tt_one", displayName: "TT One" },
  { id: "tt-2", platform: "tiktok", handle: "@tt_two", displayName: "TT Two" },
  {
    id: "tt-3",
    platform: "tiktok",
    handle: "@tt_three",
    displayName: "TT Three",
  },
  {
    id: "tt-4",
    platform: "tiktok",
    handle: "@tt_four",
    displayName: "TT Four",
  },
]
