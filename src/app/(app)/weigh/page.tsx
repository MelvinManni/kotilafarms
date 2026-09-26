// /weigh — choose a Set to weigh
import type { Metadata } from "next";
import { WeighIndexScreen } from "@/components/weights/weigh-index-screen";

export const metadata: Metadata = { title: "Weigh · Kotila Farm" };

export default function WeighPage() {
  return <WeighIndexScreen />;
}
