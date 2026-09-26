// Weekly review for the week holding a day
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { WeeklyPayload } from "@/types/weekly";

export function useWeeklyReview(day: string) {
  return useQuery({ queryKey: qk.reports.weekly(day), queryFn: ({ signal }) => apiFetch<WeeklyPayload>(`/api/reports/weekly?week=${day}`, { signal }) });
}
