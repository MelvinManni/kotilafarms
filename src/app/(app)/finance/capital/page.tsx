// /finance/capital — partner capital and shareholder loans (owners only)
import type { Metadata } from "next";
import { CapitalScreen } from "@/components/finance/capital-screen";

export const metadata: Metadata = { title: "Capital and loans · Kotila Farm" };

export default function CapitalPage() {
  return <CapitalScreen />;
}
