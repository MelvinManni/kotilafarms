// /health — vaccines due and given, and treatments
import type { Metadata } from "next";
import { HealthScreen } from "@/components/health/health-screen";

export const metadata: Metadata = { title: "Health · Kotila Farm" };

export default function HealthPage() {
  return <HealthScreen />;
}
