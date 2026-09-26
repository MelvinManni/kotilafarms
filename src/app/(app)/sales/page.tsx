// /sales
import type { Metadata } from "next";
import { SalesScreen } from "@/components/sales/sales-screen";

export const metadata: Metadata = { title: "Sales · Kotila Farm" };

export default function SalesPage() {
  return <SalesScreen />;
}
