// GET /api/reports/set/pdf?setIds=a,b — the Set report as an A4 PDF (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { pnlQuerySchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { pdfResponse } from "@/server/services/reports/print-pdf";
import { pnlFor } from "@/server/services/finance/pnl";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { setIds } = pnlQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { sets } = await pnlFor(getDb(), setIds);
  return pdfResponse(req, `/print/reports/set?setIds=${setIds.join(",")}`, `kotila-set-${sets.map((s) => s.number).sort((a, b) => a - b).join("-")}-report.pdf`);
});
