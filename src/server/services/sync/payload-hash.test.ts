// The same payload hashes the same whatever the key order
import { describe, expect, it } from "vitest";
import { payloadHash } from "@/server/services/sync/payload-hash";

describe("payloadHash", () => {
  it("ignores key order", () => expect(payloadHash({ a: 1, b: { c: 2, d: [1, { e: 1, f: 2 }] } })).toBe(payloadHash({ b: { d: [1, { f: 2, e: 1 }], c: 2 }, a: 1 })));
  it("changes when a value changes", () => expect(payloadHash({ deaths: 2 })).not.toBe(payloadHash({ deaths: 3 })));
});
