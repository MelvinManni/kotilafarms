// /settings/activity — owners see who did what on the farm records
import type { Metadata } from "next";
import { ActivityScreen } from "@/components/settings/activity-screen";

export const metadata: Metadata = { title: "Activity · Kotila Farm" };

export default function ActivityPage() {
  return <ActivityScreen />;
}
