// Run reads side by side on the pool, but one after another inside a transaction (one pg client runs one query at a time)
import "server-only";
import { PgTransaction } from "drizzle-orm/pg-core";
import type { Executor } from "@/db";

type Tasks = readonly (() => unknown)[];
type Results<T extends Tasks> = { -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> };

export async function queries<const T extends Tasks>(db: Executor, tasks: T): Promise<Results<T>> {
  if (!(db instanceof PgTransaction)) return (await Promise.all(tasks.map((t) => t()))) as Results<T>;
  const out: unknown[] = [];
  for (const task of tasks) out.push(await task());
  return out as Results<T>;
}

// The same for one read per item (e.g. per Set)
export async function eachQuery<I, R>(db: Executor, items: readonly I[], read: (item: I) => Promise<R>): Promise<R[]> {
  if (!(db instanceof PgTransaction)) return Promise.all(items.map(read));
  const out: R[] = [];
  for (const item of items) out.push(await read(item));
  return out;
}
