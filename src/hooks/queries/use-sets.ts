// Sets: list, one Set, start a Set, change stage
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { SetCreateInput, SetStatusInput } from "@/schemas/set";
import type { SetDetail, SetSummary } from "@/types/sets";

export function useSets() {
  return useQuery({ queryKey: qk.sets.all(), queryFn: ({ signal }) => apiFetch<SetSummary[]>("/api/sets", { signal }) });
}

export function useSet(id: string) {
  return useQuery({ queryKey: qk.sets.detail(id), queryFn: ({ signal }) => apiFetch<SetDetail>(`/api/sets/${id}`, { signal }) });
}

export function useStartSet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SetCreateInput) => apiFetch<{ id: string; number: number }>("/api/sets", { method: "POST", body: input }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: qk.sets.all() });
      void client.invalidateQueries({ queryKey: qk.today() });
    },
  });
}

export function useChangeSetStatus(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: SetStatusInput) => apiFetch<SetDetail>(`/api/sets/${id}`, { method: "PATCH", body: input }),
    onSuccess: (set) => {
      client.setQueryData(qk.sets.detail(id), set);
      void client.invalidateQueries({ queryKey: qk.sets.all() });
    },
  });
}
