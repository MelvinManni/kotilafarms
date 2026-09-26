// Deaths this week vs last week vs the Set's running weekly average
import { addDays } from "@/utils/dates/add-days";
import { daysBetween } from "@/utils/dates/days-between";

export type DayDeaths = { date: string; deaths: number };

export type MortalityTrend = { thisWeek: number; lastWeek: number; perWeekAverage: number; total: number };

// This week = today and the 6 days before; last week = the 7 days before that
export function mortalityTrend(logs: DayDeaths[], startDate: string, today: string): MortalityTrend {
  const weekStart = addDays(today, -6);
  const lastWeekStart = addDays(today, -13);
  let thisWeek = 0;
  let lastWeek = 0;
  let total = 0;
  for (const log of logs) {
    total += log.deaths;
    if (log.date >= weekStart && log.date <= today) thisWeek += log.deaths;
    else if (log.date >= lastWeekStart && log.date < weekStart) lastWeek += log.deaths;
  }
  const weeks = Math.max(1, (daysBetween(startDate, today) + 1) / 7);
  return { thisWeek, lastWeek, perWeekAverage: total / weeks, total };
}

// Day of age: the start date is day 0; a closed Set stops ageing when it closes
export function dayOfAge(startDate: string, today: string, closedOn?: string | null): number {
  return Math.max(0, daysBetween(startDate, closedOn && closedOn < today ? closedOn : today));
}
