// Open daily-log conflicts (owners and managers) and settling one
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import type { LogConflict } from "@/types/conflict";

export function useConflicts(enabled: boolean) {
  return useQuery({ queryKey: ["conflicts"], queryFn: ({ signal }) => apiFetch<LogConflict[]>("/api/conflicts", { signal }), enabled, refetchInterval: 60_000 });
}

export function useResolveConflict() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, keep }: { id: string; keep: "existing" | "incoming" }) => apiFetch<void>(`/api/conflicts/${id}`, { method: "POST", body: { keep } }),
    onSuccess: () => client.invalidateQueries(),
  });
}
