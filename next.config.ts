// Next.js config: standalone output for the Docker image, and Serwist for the offline service worker
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withSerwist(nextConfig);
