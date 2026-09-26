// /log/:setId/:date — log (or open) one day
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LogEntryScreen } from "@/components/daily-log/log-entry-screen";

export const metadata: Metadata = { title: "Log a day · Kotila Farm" };

export default async function LogDayPage({ params }: PageProps<"/log/[setId]/[date]">) {
  const { setId, date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  return <LogEntryScreen setId={setId} date={date} />;
}
