// /log/:setId — a Set's days
import type { Metadata } from "next";
import { Suspense } from "react";
import { SetLogScreen } from "@/components/daily-log/set-log-screen";

export const metadata: Metadata = { title: "Daily log · Kotila Farm" };

export default async function SetLogPage({ params }: PageProps<"/log/[setId]">) {
  const { setId } = await params;
  return (
    <Suspense>
      <SetLogScreen setId={setId} />
    </Suspense>
  );
}
