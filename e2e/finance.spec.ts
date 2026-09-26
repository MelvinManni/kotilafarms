// Finance: an owner reconciles cash, and sees what a Set made
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn, startSetViaApi } from "./helpers";

test("owner counts the cash and sees the Set P&L", async ({ page }) => {
  await signIn(page, E2E.owner.email, E2E.owner.password);
  await startSetViaApi(page, { intake: 200 });
  await page.goto("/finance");
  await expect(page.getByRole("region", { name: /should be on hand|more went out than came in/ })).toBeVisible();
  await expect(page.getByRole("region", { name: /^Set \d+ (has made|made|is|was) / })).toBeVisible();

  await page.getByRole("button", { name: "Reconcile cash" }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("textbox", { name: "Cash counted in the box" }).fill("50000");
  await sheet.getByRole("textbox", { name: "Bank balance" }).fill("0");
  await expect(sheet.getByText(/^(Short|Over|It matches)$/)).toBeVisible();
  await sheet.getByRole("button", { name: "Save the count" }).click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("region", { name: "₦50,000 should be on hand" })).toBeVisible();
  await expect(page.getByText(/Money in minus money out since Kosi reconciled on/)).toBeVisible();
});

test("managers see the books but can't record a count", async ({ page }) => {
  await signIn(page, E2E.manager.email, E2E.manager.password);
  await page.goto("/finance");
  await expect(page.getByRole("heading", { name: "Finance", level: 1 })).toBeVisible();
  await expect(page.getByText("Count the cash box and check the bank balance, then record the difference.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reconcile cash" })).toHaveCount(0);
});
