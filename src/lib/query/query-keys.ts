// Every React Query key comes from here, so invalidating by prefix always matches
export const qk = {
  today: () => ["today"] as const,
  sets: {
    all: () => ["sets"] as const,
    detail: (id: string) => ["sets", id] as const,
    logs: (id: string) => ["sets", id, "logs"] as const,
    missingDays: (id: string) => ["sets", id, "missing-days"] as const,
    weights: (id: string) => ["sets", id, "weights"] as const,
    vaccines: (id: string) => ["sets", id, "vaccines"] as const,
  },
  logs: { history: (id: string) => ["logs", id, "history"] as const },
  expenses: { all: (filters?: object) => ["expenses", filters ?? {}] as const },
  categories: () => ["expense-categories"] as const,
  sales: {
    all: (filters?: object) => ["sales", filters ?? {}] as const,
    outstanding: () => ["sales", "outstanding"] as const,
  },
  buyers: { all: () => ["buyers"] as const, detail: (id: string) => ["buyers", id] as const },
  feed: {
    types: () => ["feed", "types"] as const,
    purchases: () => ["feed", "purchases"] as const,
    stock: () => ["feed", "stock"] as const,
    prices: (feedTypeId: string) => ["feed", "prices", feedTypeId] as const,
  },
  health: { all: (setId?: string) => ["health", setId ?? "all"] as const },
  finance: {
    cash: () => ["finance", "cash"] as const,
    pnl: (setIds: string[]) => ["finance", "pnl", [...setIds].sort()] as const,
    capital: () => ["finance", "capital"] as const,
    loans: () => ["finance", "loans"] as const,
  },
  reports: {
    set: (setIds: string[]) => ["reports", "set", [...setIds].sort()] as const,
    weekly: (week: string) => ["reports", "weekly", week] as const,
    compare: (setIds: string[]) => ["reports", "compare", setIds] as const,
  },
  audit: (table: string, rowId: string) => ["audit", table, rowId] as const,
  users: () => ["users"] as const,
  settings: (key: string) => ["settings", key] as const,
};
