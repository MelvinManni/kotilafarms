// /sales/buyers/:id
import type { Metadata } from "next";
import { BuyerScreen } from "@/components/sales/buyer-screen";

export const metadata: Metadata = { title: "Buyer · Kotila Farm" };

export default async function BuyerPage({ params }: PageProps<"/sales/buyers/[id]">) {
  return <BuyerScreen id={(await params).id} />;
}
