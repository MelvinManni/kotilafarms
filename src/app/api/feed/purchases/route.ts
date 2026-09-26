// GET /api/feed/purchases — every feed purchase, newest first; POST — record one with its expenses (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { feedPurchaseCreateSchema } from "@/schemas/feed";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { createFeedPurchase, listFeedPurchases } from "@/server/services/feed/purchases";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listFeedPurchases(getDb()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { purchase, created } = await createFeedPurchase(getDb(), feedPurchaseCreateSchema.parse(await req.json()), user);
  return Response.json({ id: purchase.id }, { status: created ? 201 : 200 });
});
