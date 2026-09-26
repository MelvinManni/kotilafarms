// Daily logs: a Set's logs, one day's log, missed days, saving and editing
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import { useCurrentUser } from "@/lib/auth/current-user";
import { submitViaOutbox } from "@/lib/offline/submit";
import type { DailyLogUpsertInput } from "@/schemas/daily-log";
import type { DailyLogRow } from "@/types/daily-log";

export type DailyLogSubmit = DailyLogUpsertInput & { clientId: string };

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

// Every save goes through the outbox (one write path): sent straight away when there's signal, kept on the phone when not
export function useSubmitLog(setId: string) {
  const refresh = useRefreshAfterLog(setId);
  const user = useCurrentUser();
  return useMutation({
    mutationFn: ({ clientId, ...payload }: DailyLogSubmit) => submitViaOutbox({ type: "dailyLog.upsert", clientId, userId: user.id, payload: { setId, ...payload } }),
    onSettled: refresh,
  });
}
