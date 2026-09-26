// GET /api/health?setId= — drugs and supplements given, newest first; POST — record one (owners and managers)
import { z } from "zod";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { healthRecordCreateSchema } from "@/schemas/health";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { createHealthRecord, listHealthRecords } from "@/server/services/health/records";

const filters = z.object({ setId: z.uuid().optional() });

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { setId } = filters.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await listHealthRecords(getDb(), setId));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { record, created } = await createHealthRecord(getDb(), healthRecordCreateSchema.parse(await req.json()), user, farmToday());
  return Response.json({ id: record.id }, { status: created ? 201 : 200 });
});
