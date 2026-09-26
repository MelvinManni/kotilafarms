// Sign-in attempts are limited per email + IP
import { describe, expect, it } from "vitest";
import { allowAttempt, clearAttempts } from "@/server/rate-limit";

describe("allowAttempt", () => {
  it("allows five tries in 15 minutes, then refuses until the window passes", () => {
    const key = "a@b.c|1.2.3.4";
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(allowAttempt(key, t + i)).toBe(true);
    expect(allowAttempt(key, t + 10)).toBe(false);
    expect(allowAttempt(key, t + 16 * 60 * 1000)).toBe(true);
    clearAttempts(key);
  });
});
