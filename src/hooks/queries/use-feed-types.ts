// Feed types: those in use, all of them for Settings, and adding or changing one
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { REFERENCE_STALE_MS } from "@/lib/query/query-client";
import { qk } from "@/lib/query/query-keys";
import type { FeedTypeUpdate } from "@/schemas/feed";

export type FeedType = { id: string; kind: "starter" | "grower" | "finisher"; brand: string; kgPerBag: number; active: boolean };

export function useFeedTypes() {
  return useQuery({ queryKey: qk.feed.types(), queryFn: ({ signal }) => apiFetch<FeedType[]>("/api/feed/types", { signal }), staleTime: REFERENCE_STALE_MS });
}

// Settings list, with retired feeds
export function useAllFeedTypes() {
  return useQuery({ queryKey: qk.feed.allTypes(), queryFn: ({ signal }) => apiFetch<FeedType[]>("/api/feed/types?all=1", { signal }) });
}

export function useSaveFeedType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: FeedTypeUpdate & { id?: string }) =>
      id ? apiFetch<FeedType>(`/api/feed/types/${id}`, { method: "PATCH", body: input }) : apiFetch<FeedType>("/api/feed/types", { method: "POST", body: input }),
    onSuccess: () => void client.invalidateQueries({ queryKey: qk.feed.types() }),
  });
}
