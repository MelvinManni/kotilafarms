// /print/reports/weekly?week= — the weekly review on A4, for the PDF (rendered on the server, no app frame)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { WeeklyDocument } from "@/components/reports/weekly-document";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { weekQuerySchema } from "@/schemas/report";
import { getSessionUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { weeklyFor } from "@/server/services/reports/weekly";

export const metadata: Metadata = { title: "Weekly review · Kotila Farm" };

export default async function PrintWeeklyPage({ searchParams }: PageProps<"/print/reports/weekly">) {
  await connection();
  const user = await getSessionUser();
  const query = weekQuerySchema.safeParse(await searchParams);
  if (!user || !OWNER_MANAGER.includes(user.role) || !query.success) notFound();
  const today = farmToday();
  const review = await weeklyFor(getDb(), query.data.week ?? today, today);
  return (
    <main className="mx-auto flex w-full max-w-[182mm] flex-col gap-4 bg-surface">
      <h1 className="m-0 font-display text-[30px] leading-9 font-semibold text-ink">Weekly review</h1>
      <WeeklyDocument w={review} />
    </main>
  );
}
