// Reports: the Set report for one or more Sets
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { SetReportPayload } from "@/types/report";

export function useSetReport(setIds: string[]) {
  return useQuery({ queryKey: qk.reports.set(setIds), queryFn: ({ signal }) => apiFetch<SetReportPayload>(`/api/reports/set?setIds=${setIds.join(",")}`, { signal }), enabled: setIds.length > 0 });
}
