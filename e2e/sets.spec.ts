// Start a Set, see it on the list and in detail, move it on; a recorder sees counts without money
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn } from "./helpers";

test("manager starts a Set and moves it to growing", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.goto("/sets");
  await page.getByRole("button", { name: "Start a new Set" }).first().click();
  await page.getByRole("button", { name: "Back pen" }).click();
  await page.getByLabel("Day-olds", { exact: true }).fill("500");
  await page.getByLabel("Supplier").fill("Chi Farms");
  await page.getByLabel("Price per day-old").fill("950");
  await expect(page.getByText("₦475,000 in all")).toBeVisible();
  await page.getByRole("button", { name: "Start the Set" }).click();

  await expect(page).toHaveURL(/\/sets\/[0-9a-f-]{36}$/);
  const heading = page.getByRole("heading", { name: /Set \d+ · Back pen/ });
  await expect(heading).toBeVisible();
  const setName = (await heading.textContent())!.match(/Set \d+/)![0];
  await expect(page.getByText("of 500 started")).toBeVisible();
  await expect(page.getByText("₦475,000").first()).toBeVisible();
  await expect(page.getByText("Day-old chicks")).toBeVisible();

  await page.getByRole("button", { name: "Change stage" }).click();
  await page.getByRole("button", { name: "Growing" }).click();
  await page.getByRole("button", { name: "Save stage" }).click();
  await expect(page.getByText(/Growing · day \d+/).first()).toBeVisible();

  await page.goto("/sets");
  await expect(page.getByRole("row", { name: new RegExp(`${setName} `) })).toContainText("500 live");
});

test("recorder sees Sets without money", async ({ page }) => {
  await signIn(page, E2E.recorder.email, E2E.recorder.password);
  await page.goto("/sets");
  await expect(page.getByRole("row", { name: /Set \d+/ }).first()).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Spent" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start a new Set" })).toHaveCount(0);
});
