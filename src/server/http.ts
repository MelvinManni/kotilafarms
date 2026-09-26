// Wrap a route handler: known errors become { error } JSON with the right status, the rest become 500
import "server-only";
import { ZodError } from "zod";
import { ApiError } from "@/server/errors";
import type { ApiErrorBody } from "@/types/api";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

function body(code: string, message: string, issues?: ApiErrorBody["error"]["issues"]): ApiErrorBody {
  return { error: { code, message, ...(issues ? { issues } : {}) } };
}

// Postgres errors come wrapped by Drizzle; read the driver's code from the cause
function postgresCode(error: unknown): { code?: string; constraint?: string } {
  const e = error as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
  return { code: e.cause?.code ?? e.code, constraint: e.cause?.constraint ?? e.constraint };
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) return Response.json(body(error.code, error.message, error.issues), { status: error.status });
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    return Response.json(body("validation", issues[0]?.message ?? "Check the form and try again.", issues), { status: 422 });
  }
  if (error instanceof SyntaxError) return Response.json(body("bad_request", "The request wasn't valid JSON."), { status: 400 });
  const pg = postgresCode(error);
  if (pg.code === "23505") return Response.json(body("conflict", "That record already exists."), { status: 409 });
  if (pg.code === "23514" || pg.code === "23503" || pg.code === "23502")
    return Response.json(body("validation", `The farm records refused this (${pg.constraint ?? "rule"}).`), { status: 422 });
  console.error(error);
  return Response.json(body("server_error", "Something went wrong on the server. Try again."), { status: 500 });
}

export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
