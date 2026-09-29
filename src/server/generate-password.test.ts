// Starting passwords: long enough, no look-alike characters, not repeated
import { describe, expect, it } from "vitest";
import { generatePassword } from "@/server/generate-password";

describe("generatePassword", () => {
  it("makes four groups of four with no 0, O, 1, l or I", () => {
    const made = Array.from({ length: 200 }, generatePassword);
    for (const p of made) expect(p).toMatch(/^[A-HJ-NP-Za-km-z2-9]{4}(-[A-HJ-NP-Za-km-z2-9]{4}){3}$/);
    expect(new Set(made).size).toBe(200);
  });
});
