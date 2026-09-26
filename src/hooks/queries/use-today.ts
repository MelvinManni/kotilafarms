// The Today screen's data
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { TodayPayload } from "@/types/today";

export function useToday() {
  return useQuery({ queryKey: qk.today(), queryFn: ({ signal }) => apiFetch<TodayPayload>("/api/today", { signal }) });
}
