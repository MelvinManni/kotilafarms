// Daily logs: a Set's logs, one day's log, missed days, saving and editing
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { DailyLogEdit, DailyLogUpsertInput } from "@/schemas/daily-log";
import type { DailyLogRow } from "@/types/daily-log";

export function useSetLogs(setId: string) {
  return useQuery({ queryKey: qk.sets.logs(setId), queryFn: ({ signal }) => apiFetch<DailyLogRow[]>(`/api/sets/${setId}/logs`, { signal }) });
}

export function useMissingDays(setId: string) {
  return useQuery({ queryKey: qk.sets.missingDays(setId), queryFn: ({ signal }) => apiFetch<string[]>(`/api/sets/${setId}/missing-days`, { signal }) });
}

// After a save, everything that shows deaths or live birds is out of date
function useRefreshAfterLog(setId: string) {
  const client = useQueryClient();
  return () => {
    for (const key of [qk.sets.logs(setId), qk.sets.missingDays(setId), qk.sets.detail(setId), qk.sets.all(), qk.today()]) void client.invalidateQueries({ queryKey: key });
  };
}

export function useSaveLog(setId: string) {
  const refresh = useRefreshAfterLog(setId);
  return useMutation({
    mutationFn: (input: DailyLogUpsertInput) => apiFetch<DailyLogRow>(`/api/sets/${setId}/logs`, { method: "POST", body: input }),
    onSuccess: refresh,
  });
}

export function useEditLog(setId: string) {
  const refresh = useRefreshAfterLog(setId);
  return useMutation({
    mutationFn: ({ id, ...input }: DailyLogEdit & { id: string }) => apiFetch<DailyLogRow>(`/api/logs/${id}`, { method: "PATCH", body: input }),
    onSuccess: refresh,
  });
}
