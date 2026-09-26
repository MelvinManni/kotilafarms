// The one way the browser calls /api: JSON in, JSON out, a typed error from the { error } body
import type { ApiErrorBody, ApiIssue } from "@/types/api";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues?: ApiIssue[],
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; signal?: AbortSignal };

export async function apiFetch<T>(path: string, { method = "GET", body, signal }: Options = {}): Promise<T> {
  const res = await fetch(path, {
    method,
    signal,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const err = (data as ApiErrorBody | null)?.error;
    throw new ApiRequestError(res.status, err?.code ?? "unknown", err?.message ?? "Something went wrong. Try again.", err?.issues);
  }
  return data as T;
}
