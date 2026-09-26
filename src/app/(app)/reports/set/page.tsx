// /reports/set?setIds= — the Set report
import type { Metadata } from "next";
import { SetReportScreen } from "@/components/reports/set-report-screen";

export const metadata: Metadata = { title: "Set report · Kotila Farm" };

export default async function SetReportPage({ searchParams }: PageProps<"/reports/set">) {
  const { setIds } = await searchParams;
  return <SetReportScreen initialIds={typeof setIds === "string" ? setIds.split(",").filter(Boolean) : []} />;
}
