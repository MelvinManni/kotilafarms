// Scale readings typed on the phone
import { describe, expect, it } from "vitest";
import { parseGrams } from "@/schemas/weight";

describe("parseGrams", () => {
  it("reads grams with or without commas or a g", () => {
    expect(parseGrams("1,030")).toEqual({ grams: 1030 });
    expect(parseGrams(" 964g ")).toEqual({ grams: 964 });
  });
  it("says why a reading can't be used", () => {
    expect(parseGrams("1.03")).toEqual({ error: "Grams only, no decimals." });
    expect(parseGrams("9")).toHaveProperty("error");
    expect(parseGrams("12000")).toEqual({ error: "That's too heavy — type grams, e.g. 1030." });
    expect(parseGrams("abc")).toHaveProperty("error");
  });
});
