// GET /api/reports/compare/pdf?setIds= — the comparison as an A4 PDF (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { compareQuerySchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { route } from "@/server/http";
import { pdfResponse } from "@/server/services/reports/print-pdf";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { setIds } = compareQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return pdfResponse(req, `/print/reports/compare?setIds=${setIds.join(",")}`, "kotila-compare-sets.pdf");
});
