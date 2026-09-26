// Feed types in use
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { REFERENCE_STALE_MS } from "@/lib/query/query-client";
import { qk } from "@/lib/query/query-keys";

export type FeedType = { id: string; kind: "starter" | "grower" | "finisher"; brand: string; kgPerBag: number; active: boolean };

export function useFeedTypes() {
  return useQuery({ queryKey: qk.feed.types(), queryFn: ({ signal }) => apiFetch<FeedType[]>("/api/feed/types", { signal }), staleTime: REFERENCE_STALE_MS });
}

export const feedTypeLabel = (t: FeedType) => `${t.kind[0]!.toUpperCase()}${t.kind.slice(1)} · ${t.brand}`;
