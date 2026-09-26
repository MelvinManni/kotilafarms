// /sets
import type { Metadata } from "next";
import { SetsScreen } from "@/components/sets/sets-screen";

export const metadata: Metadata = { title: "Sets · Kotila Farm" };

export default function SetsPage() {
  return <SetsScreen />;
}
