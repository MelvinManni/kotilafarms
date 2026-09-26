// Next.js config: standalone output for the Docker image, and Serwist for the offline service worker
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Launched at run time to print PDFs; not bundled
  serverExternalPackages: ["playwright-core"],
  // It reads files like browsers.json at run time, which tracing can't see
  outputFileTracingIncludes: { "/api/reports/set/pdf": ["./node_modules/.pnpm/playwright-core@*/node_modules/playwright-core/**/*"] },
};

export default withSerwist(nextConfig);
