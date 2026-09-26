// /print/reports/set?setIds= — the Set report on A4, for the PDF (rendered on the server, no app frame)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SetReportDocument } from "@/components/reports/set-report-document";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { pnlQuerySchema } from "@/schemas/finance";
import { getSessionUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { setReportFor } from "@/server/services/reports/set-report";

export const metadata: Metadata = { title: "Set report · Kotila Farm" };

export default async function PrintSetReportPage({ searchParams }: PageProps<"/print/reports/set">) {
  await connection();
  const user = await getSessionUser();
  const query = pnlQuerySchema.safeParse(await searchParams);
  if (!user || !OWNER_MANAGER.includes(user.role) || !query.success) notFound();
  const report = await setReportFor(getDb(), query.data.setIds, farmToday());
  return (
    <main className="mx-auto w-full max-w-[182mm] bg-surface">
      <SetReportDocument r={report} />
    </main>
  );
}
