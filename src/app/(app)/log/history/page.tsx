// /log/history — recent days for each running Set
import type { Metadata } from "next";
import { LogHistoryScreen } from "@/components/daily-log/log-history-screen";

export const metadata: Metadata = { title: "History · Kotila Farm" };

export default function LogHistoryPage() {
  return <LogHistoryScreen />;
}
