// Set report: a manager reads it and downloads the PDF
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn, startSetViaApi } from "./helpers";

test("manager reads a Set report and downloads it as a PDF", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  const setId = await startSetViaApi(page, { intake: 250 });
  await page.goto(`/reports/set?setIds=${setId}`);
  await expect(page.getByRole("heading", { level: 1, name: /^Set \d+ is ₦\d[\d,]* down on 250 day-olds so far$/ })).toBeVisible();
  await expect(page.getByText("Cost per bird started")).toBeVisible();

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download PDF" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^kotila-set-\d+-report\.pdf$/);
  const file = readFileSync((await download.path())!);
  expect(file.subarray(0, 5).toString()).toBe("%PDF-");
  expect(file.length).toBeGreaterThan(10_000);
});
