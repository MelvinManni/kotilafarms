// Receipt photos in the private S3 bucket: put a file, and hand out a short-lived link to read it
import "server-only";
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

let client: S3Client | undefined;

function s3(): S3Client {
  const e = env();
  client ??= new S3Client({
    region: e.S3_REGION,
    endpoint: e.S3_ENDPOINT,
    // S3-compatible stores (R2, MinIO) usually need path-style addresses
    forcePathStyle: Boolean(e.S3_ENDPOINT),
    credentials: e.S3_ACCESS_KEY_ID && e.S3_SECRET_ACCESS_KEY ? { accessKeyId: e.S3_ACCESS_KEY_ID, secretAccessKey: e.S3_SECRET_ACCESS_KEY } : undefined,
  });
  return client;
}

export const RECEIPT_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "application/pdf": "pdf" };
export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

// receipts/2026/09/<uuid>.jpg
export function receiptKey(contentType: string, today: string): string {
  return `receipts/${today.slice(0, 4)}/${today.slice(5, 7)}/${randomUUID()}.${RECEIPT_TYPES[contentType]}`;
}

export async function putReceipt(key: string, body: Uint8Array, contentType: string) {
  await s3().send(new PutObjectCommand({ Bucket: env().S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
}

export function receiptReadUrl(key: string): Promise<string> {
  return getSignedUrl(s3(), new GetObjectCommand({ Bucket: env().S3_BUCKET, Key: key }), { expiresIn: 300 });
}
