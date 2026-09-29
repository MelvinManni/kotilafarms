// withRdsCa adds the RDS certificate file only for RDS hosts, and only when the file exists
import { afterEach, describe, expect, it, vi } from "vitest";
import { withRdsCa } from "@/db/with-rds-ca";

const RDS = "postgres://u:p%40ss@kotila.abc.us-east-1.rds.amazonaws.com:5432/kotila?sslmode=verify-full";

afterEach(() => vi.unstubAllEnvs());

describe("withRdsCa", () => {
  it("adds sslrootcert for an RDS host", () => {
    vi.stubEnv("RDS_CA_FILE", "package.json");
    const url = new URL(withRdsCa(RDS));
    expect(url.searchParams.get("sslrootcert")).toBe("package.json");
    expect(url.searchParams.get("sslmode")).toBe("verify-full");
    expect(url.password).toBe("p%40ss");
  });

  it("leaves other hosts alone", () => {
    vi.stubEnv("RDS_CA_FILE", "package.json");
    expect(withRdsCa("postgres://kotila:kotila@localhost:5432/kotila")).toBe("postgres://kotila:kotila@localhost:5432/kotila");
  });

  it("leaves the URL alone when the file is missing or already named", () => {
    vi.stubEnv("RDS_CA_FILE", "no-such-file.pem");
    expect(withRdsCa(RDS)).toBe(RDS);
    vi.stubEnv("RDS_CA_FILE", "package.json");
    const own = `${RDS}&sslrootcert=mine.pem`;
    expect(withRdsCa(own)).toBe(own);
  });
});
