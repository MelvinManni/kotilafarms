// GET /api/reports/set/pdf?setIds=a,b — the Set report as an A4 PDF (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { env } from "@/lib/env";
import { pnlQuerySchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { parseCookies, printPdf } from "@/server/services/reports/print-pdf";
import { pnlFor } from "@/server/services/finance/pnl";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const url = new URL(req.url);
  const { setIds } = pnlQuerySchema.parse(Object.fromEntries(url.searchParams));
  const { sets } = await pnlFor(getDb(), setIds);
  // Never the request's Host header: the browser only ever visits this app
  const pdf = await printPdf(env().INTERNAL_APP_URL ?? env().NEXTAUTH_URL, `/print/reports/set?setIds=${setIds.join(",")}`, parseCookies(req.headers.get("cookie")));
  const name = `kotila-set-${sets.map((s) => s.number).sort((a, b) => a - b).join("-")}-report.pdf`;
  return new Response(new Uint8Array(pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" } });
});
