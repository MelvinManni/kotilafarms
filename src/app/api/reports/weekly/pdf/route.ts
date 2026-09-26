// GET /api/reports/weekly/pdf?week= — the weekly review as an A4 PDF (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { weekQuerySchema } from "@/schemas/report";
import { requireRole, requireSession } from "@/server/auth";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { pdfResponse } from "@/server/services/reports/print-pdf";
import { weekOf } from "@/utils/dates/week-of";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { week } = weekQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const { start } = weekOf(week ?? farmToday());
  return pdfResponse(req, `/print/reports/weekly?week=${start}`, `kotila-weekly-review-${start}.pdf`);
});
