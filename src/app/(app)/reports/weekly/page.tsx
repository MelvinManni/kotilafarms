// /reports/weekly — the weekly review
import type { Metadata } from "next";
import { WeeklyScreen } from "@/components/reports/weekly-screen";

export const metadata: Metadata = { title: "Weekly review · Kotila Farm" };

export default function WeeklyPage() {
  return <WeeklyScreen />;
}
