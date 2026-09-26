// Playwright e2e: a dev server on :3200 against the throwaway kotila_e2e database
import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import { E2E, E2E_APP_ENV, E2E_PORT } from "./e2e/e2e-env";

// Use the installed Chrome when there is one; CI and the dev container use Playwright's Chromium
const hasChrome = existsSync("/Applications/Google Chrome.app") || existsSync("/usr/bin/google-chrome");

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: { baseURL: E2E.baseUrl, trace: "retain-on-failure", ...(hasChrome ? { channel: "chrome" } : {}) },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...(hasChrome ? { channel: "chrome" } : {}) } },
    { name: "phone", use: { ...devices["Pixel 7"], ...(hasChrome ? { channel: "chrome" } : {}) }, grep: /@phone/ },
  ],
  webServer: {
    command: `pnpm exec next dev --port ${E2E_PORT}`,
    url: `${E2E.baseUrl}/sign-in`,
    env: E2E_APP_ENV,
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
