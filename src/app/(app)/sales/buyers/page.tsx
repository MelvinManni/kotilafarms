// /sales/buyers
import type { Metadata } from "next";
import { BuyersScreen } from "@/components/sales/buyers-screen";

export const metadata: Metadata = { title: "Buyers · Kotila Farm" };

export default function BuyersPage() {
  return <BuyersScreen />;
}
