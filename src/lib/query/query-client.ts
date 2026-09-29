// One QueryClient: offline-first, lists fresh for 30s, cache kept a day, no automatic mutation retries
import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/query/fetcher";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 24 * 60 * 60 * 1000,
        networkMode: "offlineFirst",
        // Don't retry what the server refused (4xx); do retry network trouble twice
        retry: (count, error) => !(error instanceof ApiRequestError && error.status < 500) && count < 2,
      },
      mutations: { retry: 0, networkMode: "offlineFirst" },
    },
  });
}

// Reference lists change rarely
export const REFERENCE_STALE_MS = 5 * 60 * 1000;

// Money figures: fresh for a minute, always fetched again when a page opens
export const FINANCE_QUERY = { staleTime: 60_000, refetchOnMount: "always" } as const;
