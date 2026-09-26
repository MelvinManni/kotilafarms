// GET /api/uploads/receipt/:key — send the browser to a 5-minute signed link for the photo
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { notFound } from "@/server/errors";
import { route } from "@/server/http";
import { receiptReadUrl } from "@/server/storage/receipts";

export const GET = route<RouteContext<"/api/uploads/receipt/[...key]">>(async (_req, ctx) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const key = (await ctx.params).key.join("/");
  if (!/^receipts\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp|heic|pdf)$/.test(key)) throw notFound("That receipt");
  return Response.redirect(await receiptReadUrl(key), 302);
});
