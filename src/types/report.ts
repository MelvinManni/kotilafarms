// Set report: the full picture for one Set or several together
import type { PnlPayload } from "@/types/finance";

export type SetReportPayload = PnlPayload & {
  prepared: string;
  period: { from: string; to: string | null };
  deaths: number;
  liveBirds: number;
  saleWeight: { averageGrams: number; day: number } | null;
  performance: { feedKg: number; feedSpend: number; liveKg: number | null; fcr: number | null; feedCostPerKg: number | null };
  // One Set only: its samples against the standard
  growth: { samples: { day: number; grams: number }[]; standard: { day: number; grams: number }[] } | null;
  largestExpenses: { rows: { date: string; description: string; category: string; amount: number }[]; of: number };
  unpaid: { count: number; total: number };
};
