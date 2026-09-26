// apiFetch sends JSON and turns { error } bodies into ApiRequestError
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiFetch } from "@/lib/query/fetcher";

afterEach(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("posts JSON and returns the body", async () => {
    const fetchMock = vi.fn(async () => Response.json({ id: "1" }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(apiFetch("/api/expenses", { method: "POST", body: { amount: 1 } })).resolves.toEqual({ id: "1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/expenses", expect.objectContaining({ method: "POST", body: '{"amount":1}' }));
  });

  it("throws a typed error from the error body", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ error: { code: "validation", message: "Choose a Set or farm overhead before saving." } }, { status: 422 }));
    const error = await apiFetch("/api/expenses").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 422, code: "validation", message: "Choose a Set or farm overhead before saving." });
  });

  it("lets network failures through untouched (the offline queue handles them)", async () => {
    vi.stubGlobal("fetch", async () => { throw new TypeError("Failed to fetch"); });
    await expect(apiFetch("/api/today")).rejects.toBeInstanceOf(TypeError);
  });
});
