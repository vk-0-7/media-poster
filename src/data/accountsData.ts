import type { Account, Platform } from "../types"

export const PLATFORMS: Platform[] = [
  "instagram",
  "twitter",
  "facebook",
  "tiktok",
]

export const Communities: Record<string, string> = {
  softwareEngineering: "1699807431709041070",
  BuildInPublic: "1493446837214187523",
  webDevelopers: "1488952693443997701",
  startupCommunity: "1471580197908586507",
  Memes: "1669501013441806336",
  TechTwitter: "1472105760389668865",
}

// fixed 4 accounts per platform
export const ACCOUNTS: Account[] = [
  // Instagram (4)
  {
    id: "coding_with_bugs",
    platform: "instagram",
    handle: "@coding_with_bugs",
    displayName: "@Coding_with_bugs",
  },
  {
    id: "dream_chasers",
    platform: "instagram",
    handle: "@dream_chasers",
    displayName: "@dream_chasers",
  },
  {
    id: "vallendros",
    platform: "instagram",
    handle: "@vallendros",
    displayName: "@vallendros",
  },
  {
    id: "dailyAIInsights",
    platform: "instagram",
    handle: "@dailyAIInsights",
    displayName: "@dailyAIInsights",
  },

  // Twitter (4)
  {
    id: "maria_in_tech",
    platform: "twitter",
    handle: "@tw_one",
    displayName: "@maria_in_tech",
  },

  {
    id: "me_divya",
    platform: "twitter",
    handle: "@tw_three",
    displayName: "@me_divya",
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
