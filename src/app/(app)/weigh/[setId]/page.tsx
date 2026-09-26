// /weigh/:setId — weigh a sample of birds
import type { Metadata } from "next";
import { WeighScreen } from "@/components/weights/weigh-screen";

export const metadata: Metadata = { title: "Weigh · Kotila Farm" };

export default async function WeighSetPage({ params }: PageProps<"/weigh/[setId]">) {
  const { setId } = await params;
  return <WeighScreen setId={setId} />;
}
