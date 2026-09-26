// Sets as the API returns them; money fields are absent for recorders
import type { SetStatus } from "@/types/set-status";

export type SetMoney = { spend: number; revenue: number; profit: number; margin: number | null };

export type SetSummary = {
  id: string;
  number: number;
  name: string | null;
  pen: string | null;
  status: SetStatus;
  startDate: string;
  closedOn: string | null;
  intake: number;
  dayOfAge: number;
  deaths: number;
  mortalityRate: number;
  birdsSold: number;
  liveBirds: number;
  trend: { thisWeek: number; lastWeek: number; perWeekAverage: number };
  money?: SetMoney;
};

export type SetDetail = SetSummary & {
  dayOldSupplier: string;
  dayOldUnitCost?: number;
  spendByCategory?: { label: string; value: number }[];
  deathsByDay: { date: string; deaths: number }[];
  counts: { logs: number; weights: number; sales: number; expenses: number };
};
