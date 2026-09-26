// POST /api/uploads/receipt — multipart "file": check role, type and size, put it in the private bucket, return its key
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { unprocessable } from "@/server/errors";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { MAX_RECEIPT_BYTES, RECEIPT_TYPES, putReceipt, receiptKey } from "@/server/storage/receipts";

export const POST = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) throw unprocessable("Choose a photo of the receipt.");
  if (!RECEIPT_TYPES[file.type]) throw unprocessable("Use a photo (JPG, PNG, WebP, HEIC) or a PDF.");
  if (file.size > MAX_RECEIPT_BYTES) throw unprocessable("That file is over 8 MB. Take a smaller photo.");
  const key = receiptKey(file.type, farmToday());
  await putReceipt(key, new Uint8Array(await file.arrayBuffer()), file.type);
  return Response.json({ key }, { status: 201 });
});
