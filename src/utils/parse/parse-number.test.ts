// Tests for reading typed numbers
import { describe, expect, it } from "vitest";
import { parseNumber } from "@/utils/parse/parse-number";

describe("parseNumber", () => {
  it("reads money with symbols and commas", () => expect(parseNumber("₦1,284,750")).toBe(1284750));
  it("keeps decimals for bags", () => expect(parseNumber("12.5")).toBe(12.5));
  it("returns null when empty", () => expect(parseNumber("")).toBeNull());
  it("returns null for a lone sign", () => expect(parseNumber("-")).toBeNull());
});
