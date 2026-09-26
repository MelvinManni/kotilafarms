// Errors a service or route can throw; the route wrapper turns them into responses
import type { ApiIssue } from "@/types/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues?: ApiIssue[],
  ) {
    super(message);
  }
}

export const unauthorized = () => new ApiError(401, "unauthorized", "Sign in to do this.");
export const forbidden = () => new ApiError(403, "forbidden", "Your role can't do this.");
export const notFound = (what = "That record") => new ApiError(404, "not_found", `${what} wasn't found.`);
export const conflict = (message: string) => new ApiError(409, "conflict", message);
export const unprocessable = (message: string, issues?: ApiIssue[]) => new ApiError(422, "validation", message, issues);
