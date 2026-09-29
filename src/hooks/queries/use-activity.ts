// The activity log, 50 lines a page, filtered (owners only)
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import type { ActivityPage } from "@/types/activity";

export type ActivityFilters = { person?: string; kind?: string; from?: string; to?: string };

export function useActivity(filters: ActivityFilters) {
  return useInfiniteQuery({
    queryKey: ["activity", filters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams(Object.entries({ ...filters, before: pageParam ?? undefined }).filter((e): e is [string, string] => Boolean(e[1])));
      return apiFetch<ActivityPage>(`/api/activity?${params}`, { signal });
    },
    getNextPageParam: (last) => last.nextBefore,
  });
}
