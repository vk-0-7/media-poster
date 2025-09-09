export interface Account {
  id: string
  name: string
  displayName: string
}

export const ACCOUNTS: Account[] = [
  { id: "dreamchasers", name: "DreamChasers", displayName: "DreamChasers" },
  {
    id: "codingwithbugs",
    name: "CodingWithBugs",
    displayName: "CodingWithBugs",
  },
  { id: "vallendros", name: "Vallendros", displayName: "Vallendros" },
  {
    id: "dailyAIInsights",
    name: "DailyAIInsights",
    displayName: "DailyAIInsights",
  },
]

export const DEFAULT_ACCOUNT = ACCOUNTS[0]

export const getAccountById = (id: string): Account | undefined => {
  return ACCOUNTS.find((account) => account.id === id)
}

export const getAccountFromLocalStorage = (): Account => {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT

  const stored = window.localStorage.getItem("selectedAccount")
  return getAccountById(stored || "") || DEFAULT_ACCOUNT
}
