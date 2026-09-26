// /today
import type { Metadata } from "next";
import { TodayScreen } from "@/components/today/today-screen";

export const metadata: Metadata = { title: "Today · Kotila Farm" };

export default function TodayPage() {
  return <TodayScreen />;
}
