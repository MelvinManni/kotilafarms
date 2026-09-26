// /reports/compare — Sets side by side
import type { Metadata } from "next";
import { CompareScreen } from "@/components/reports/compare-screen";

export const metadata: Metadata = { title: "Compare Sets · Kotila Farm" };

export default function ComparePage() {
  return <CompareScreen />;
}
