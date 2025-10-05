import { create } from "zustand"
import { PLATFORMS, ACCOUNTS } from "@/data/accountsData"
import { Account, Platform } from "@/types"

const makeDefaultAccountMap = () => {
  const map: Record<string, string | null> = {}
  for (const p of PLATFORMS) {
    const first = ACCOUNTS?.find((a) => a.platform == p)
    map[p] = first ? first.id : null
  }
  return map
}

type AccountStore = {
  activePlatform: Platform
  activeAccountByPlatform: Record<Platform, string | null>
  setActivePlatform: (p: Platform) => void
  setActiveAccount: (p: Platform, id: string) => void
}

export const useAccountStore = create<AccountStore>((set) => ({
  activePlatform: PLATFORMS[0],
  activeAccountByPlatform: makeDefaultAccountMap(),
  setActivePlatform: (p) => set({ activePlatform: p }),
  setActiveAccount: (p, id) =>
    set((s) => ({
      activeAccountByPlatform: {
        ...s.activeAccountByPlatform,
        [p]: id,
      },
    })),
}))
