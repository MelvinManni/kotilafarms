// Tests for the env schema
import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env-schema";

const valid = {
  DATABASE_URL: "postgres://kotila:kotila@localhost:5432/kotila",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "a".repeat(44),
  S3_BUCKET: "kotila-farm-receipts",
  S3_REGION: "eu-west-1",
};

describe("parseEnv", () => {
  it("accepts a valid env and fills defaults", () => {
    const env = parseEnv(valid);
    expect(env.FARM_TIMEZONE).toBe("Africa/Lagos");
    expect(env.NODE_ENV).toBe("development");
    expect(env.S3_ENDPOINT).toBeUndefined();
  });

  it("treats empty values as not set", () => {
    const env = parseEnv({ ...valid, S3_ENDPOINT: "", S3_ACCESS_KEY_ID: "", S3_SECRET_ACCESS_KEY: "" });
    expect(env.S3_ENDPOINT).toBeUndefined();
    expect(env.S3_ACCESS_KEY_ID).toBeUndefined();
  });

  it("lists every missing value in one error", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL[\s\S]*NEXTAUTH_SECRET/);
  });

  it("rejects a non-postgres database address", () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: "mysql://x@localhost/db" })).toThrow(/postgres:\/\//);
  });

  it("rejects the example secret", () => {
    expect(() => parseEnv({ ...valid, NEXTAUTH_SECRET: "replace-with-openssl-rand-base64-32" })).toThrow(
      /example value/,
    );
  });

  it("needs both S3 keys or neither", () => {
    expect(() => parseEnv({ ...valid, S3_ACCESS_KEY_ID: "AKIA123" })).toThrow(/both/);
    expect(parseEnv({ ...valid, S3_ACCESS_KEY_ID: "AKIA123", S3_SECRET_ACCESS_KEY: "s" }).S3_ACCESS_KEY_ID).toBe(
      "AKIA123",
    );
  });

  it("rejects an unknown time zone", () => {
    expect(() => parseEnv({ ...valid, FARM_TIMEZONE: "Mars/Olympus" })).toThrow(/time zone/);
  });
});
