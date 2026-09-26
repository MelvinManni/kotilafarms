// /sets/:id
import type { Metadata } from "next";
import { SetDetailScreen } from "@/components/sets/set-detail-screen";

export const metadata: Metadata = { title: "Set · Kotila Farm" };

export default async function SetPage({ params }: PageProps<"/sets/[id]">) {
  const { id } = await params;
  return <SetDetailScreen id={id} />;
}
