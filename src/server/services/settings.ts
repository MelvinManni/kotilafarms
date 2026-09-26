// Farm settings (bulk rate, borrowing cap, …) stored as key → JSON value
import "server-only";
import { eq } from "drizzle-orm";
import type { Executor } from "@/db";
import { settings } from "@/db/schema";

export async function getSetting<T>(db: Executor, key: string): Promise<T | null> {
  const [row] = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, key));
  return (row?.value as T | undefined) ?? null;
}
