// /settings/vaccines
import type { Metadata } from "next";
import { VaccinesScreen } from "@/components/settings/vaccines-screen";

export const metadata: Metadata = { title: "Vaccine schedule · Kotila Farm" };

export default function VaccinesPage() {
  return <VaccinesScreen />;
}
