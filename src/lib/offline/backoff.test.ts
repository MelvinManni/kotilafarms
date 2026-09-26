// Tests for retry timing
import { describe, expect, it } from "vitest";
import { nextAttemptAt } from "@/lib/offline/backoff";

const at = (attempts: number, random: number) => Date.parse(nextAttemptAt(attempts, 0, random));

describe("nextAttemptAt", () => {
  it("starts at 30 seconds", () => expect(at(0, 0.5)).toBe(30_000));
  it("doubles each time", () => expect(at(2, 0.5)).toBe(120_000));
  it("never waits more than 30 minutes (plus jitter)", () => expect(at(20, 0.5)).toBe(1_800_000));
  it("spreads retries by up to 20%", () => {
    expect(at(0, 0)).toBe(24_000);
    expect(at(0, 1)).toBe(36_000);
  });
});
