// Sign in, invite a recorder, they set a password and land on Today; roles keep pages closed
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn } from "./helpers";

test("signed-out people are sent to sign in", async ({ page }) => {
  await page.goto("/settings/users");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fsettings%2Fusers/);
});

test("a wrong password says so plainly", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E.owner.email);
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email and password don't match an active account.")).toBeVisible();
});

test("owner invites a recorder who sets a password and can't open Settings", async ({ page, browser }) => {
  await signIn(page);
  await page.goto("/settings/users");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Invite someone" }).first().click();
  await page.getByLabel("Name").fill("Ifeanyi Obi");
  await page.getByLabel("Email").fill("ifeanyi@e2e.test");
  await page.getByRole("button", { name: "Recorder" }).click();
  await page.getByRole("button", { name: "Make invite link" }).click();
  const link = await page.locator("code").textContent();
  expect(link).toContain("/invite/");

  const recorder = await browser.newContext();
  const phone = await recorder.newPage();
  await phone.goto(link!);
  await expect(phone.getByText("Kosi added you as a recorder")).toBeVisible();
  await phone.getByLabel("New password").fill("ifeanyi-password");
  await phone.getByLabel("Type it again").fill("ifeanyi-password");
  await phone.getByRole("button", { name: "Set password and continue" }).click();
  await expect(phone).toHaveURL(/\/today/);
  await phone.goto("/settings/users");
  await expect(phone).toHaveURL(/\/today/);
  await recorder.close();

  await page.reload();
  await expect(page.getByRole("row", { name: /Ifeanyi Obi/ })).toBeVisible();
});
