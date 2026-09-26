// /finance — cash position and Set profit and loss
import type { Metadata } from "next";
import { FinanceScreen } from "@/components/finance/finance-screen";

export const metadata: Metadata = { title: "Finance · Kotila Farm" };

export default function FinancePage() {
  return <FinanceScreen />;
}
