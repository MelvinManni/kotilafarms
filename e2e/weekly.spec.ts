// Weekly review: a manager reads this week's notes and downloads the PDF
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn } from "./helpers";

test("manager reads the weekly review and downloads it", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.goto("/reports");
  await expect(page).toHaveURL(/\/reports\/weekly$/);
  await expect(page.getByRole("region", { name: /^Set \d+ review$/ }).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "How reviews are written" })).toBeVisible();
  await page.getByRole("button", { name: "Last week", exact: true }).click();
  await expect(page.getByText(/^Week of /)).toBeVisible();

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download PDF" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^kotila-weekly-review-\d{4}-\d{2}-\d{2}\.pdf$/);
  expect(readFileSync((await download.path())!).subarray(0, 5).toString()).toBe("%PDF-");
});
