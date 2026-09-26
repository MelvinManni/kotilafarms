// GET /api/reports/weekly/pdf?week= — the weekly review as an A4 PDF (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { env } from "@/lib/env";
import { weekQuerySchema } from "@/schemas/report";
import { requireRole, requireSession } from "@/server/auth";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { parseCookies, printPdf } from "@/server/services/reports/print-pdf";
import { weekOf } from "@/utils/dates/week-of";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { week } = weekQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { start } = weekOf(week ?? farmToday());
  // Never the request's Host header: the browser only ever visits this app
  const pdf = await printPdf(env().INTERNAL_APP_URL ?? env().NEXTAUTH_URL, `/print/reports/weekly?week=${start}`, parseCookies(req.headers.get("cookie")));
  return new Response(new Uint8Array(pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="kotila-weekly-review-${start}.pdf"`, "cache-control": "no-store" } });
});
