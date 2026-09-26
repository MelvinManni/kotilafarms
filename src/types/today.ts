// What Today shows, shaped by role (no money for recorders)
import type { Outstanding } from "@/types/sale";
import type { SetSummary } from "@/types/sets";

export type TodayTask = {
  kind: "log" | "missed" | "vaccine" | "weigh" | "tag";
  tone: "alert" | "warning" | "neutral";
  title: string;
  detail: string;
  href?: string;
};

export type TodayPayload = {
  date: string;
  sets: SetSummary[];
  missed: { setId: string; setNumber: number; date: string }[];
  loggedToday: string[];
  tasks: TodayTask[];
  owed?: Outstanding;
};
