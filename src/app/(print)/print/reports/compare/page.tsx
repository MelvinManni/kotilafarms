// /print/reports/compare?setIds= — the comparison on A4, for the PDF (rendered on the server, no app frame)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CompareDocument } from "@/components/reports/compare-document";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { compareQuerySchema } from "@/schemas/finance";
import { getSessionUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { compareFor } from "@/server/services/reports/compare";
import { shortDate } from "@/utils/format/dates";

export const metadata: Metadata = { title: "Compare Sets · Kotila Farm" };

export default async function PrintComparePage({ searchParams }: PageProps<"/print/reports/compare">) {
  await connection();
  const user = await getSessionUser();
  const query = compareQuerySchema.safeParse(await searchParams);
  if (!user || !OWNER_MANAGER.includes(user.role) || !query.success) notFound();
  const today = farmToday();
  const rows = await compareFor(getDb(), query.data.setIds, today);
  return (
    <main className="mx-auto flex w-full max-w-[182mm] flex-col gap-4 bg-surface">
      <p className="m-0 text-sm text-ink-muted">Kotila Farms · prepared {shortDate(today)}</p>
      <h1 className="m-0 font-display text-[30px] leading-9 font-semibold text-ink">Compare Sets</h1>
      <CompareDocument rows={rows} />
    </main>
  );
}
