// /log — choose a Set to log
import type { Metadata } from "next";
import { LogIndexScreen } from "@/components/daily-log/log-index-screen";

export const metadata: Metadata = { title: "Daily log · Kotila Farm" };

export default function LogPage() {
  return <LogIndexScreen />;
}
