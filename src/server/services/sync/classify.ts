// Sort an error from applying a mutation: the entry itself is wrong (rejected), or try again later
import "server-only";
import { ZodError } from "zod";
import { ApiError } from "@/server/errors";

export function rejectionOf(error: unknown): { code: string; message: string } | null {
  if (error instanceof ZodError) return { code: "validation", message: error.issues[0]?.message ?? "Check the entry and try again." };
  if (error instanceof ApiError && error.status < 500) return { code: error.code, message: error.message };
  const pg = (error as { cause?: { code?: string } }).cause?.code;
  if (pg === "23514" || pg === "23503") return { code: "validation", message: "The farm records refused this entry." };
  return null;
}
