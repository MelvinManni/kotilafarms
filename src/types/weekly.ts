// Weekly review: one note per Set running that week
import type { SetStatus } from "@/types/set-status";
import type { SetReview } from "@/utils/metrics/weekly/set-review";
import type { WeekFacts } from "@/utils/metrics/weekly/week-facts";

export type WeeklySet = { id: string; number: number; pen: string | null; status: SetStatus; intake: number; facts: WeekFacts; review: SetReview };

export type WeeklyPayload = { week: { start: string; end: string }; written: string; sets: WeeklySet[] };
