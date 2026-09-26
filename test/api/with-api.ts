// Run a route test inside a rolled-back transaction, and call handlers like the browser would
import type { Tx } from "@/db";
import { apiState } from "@test/api/state";
import { inRollback } from "@test/db/test-db";

export async function withApi(fn: (tx: Tx) => Promise<void>) {
  await inRollback(async (tx) => {
    apiState.tx = tx;
    try {
      await fn(tx);
    } finally {
      apiState.tx = null;
      apiState.user = null;
    }
  });
}

type Handler<P> = (req: Request, ctx: { params: Promise<P> }) => Promise<Response>;

export async function call<P = Record<string, string>>(handler: Handler<P>, opts: { method?: string; body?: unknown; params?: P; query?: string } = {}) {
  const req = new Request(`http://test.local/api${opts.query ?? ""}`, {
    method: opts.method ?? "GET",
    headers: opts.body === undefined ? undefined : { "content-type": "application/json" },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const res = await handler(req, { params: Promise.resolve(opts.params ?? ({} as P)) });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}
