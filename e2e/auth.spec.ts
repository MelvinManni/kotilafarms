// Sign in, add a recorder, they choose their own password and land on Today; roles keep pages closed
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { openSignIn, signIn } from "./helpers";

test("signed-out people are sent to sign in", async ({ page }) => {
  await page.goto("/settings/users");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fsettings%2Fusers/);
});

test("a wrong password says so plainly", async ({ page }) => {
  await openSignIn(page);
  await page.getByRole("textbox", { name: "Email" }).fill(E2E.owner.email);
  await page.getByRole("textbox", { name: "Password" }).fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email and password don't match an active account.")).toBeVisible();
});

test("owner adds a recorder who signs in, must choose a password, and can't open Settings", async ({ page, browser }) => {
  await signIn(page);
  await page.goto("/settings/users");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Add someone" }).first().click();
  await page.getByLabel("Name").fill("Ifeanyi Obi");
  await page.getByLabel("Email").fill("ifeanyi@e2e.test");
  await page.getByRole("button", { name: "Recorder" }).click();
  await page.getByRole("button", { name: "Add and email password" }).click();
  // No Resend key in e2e, so the password is shown to pass on
  await expect(page.getByText("The email didn't go")).toBeVisible();
  const password = (await page.locator("code").textContent())!.trim();

  const recorder = await browser.newContext();
  const phone = await recorder.newPage();
  await phone.goto("/sign-in");
  await phone.getByRole("textbox", { name: "Email" }).fill("ifeanyi@e2e.test");
  await phone.getByRole("textbox", { name: "Password" }).fill(password);
  await phone.getByRole("button", { name: "Sign in" }).click();
  await expect(phone).toHaveURL(/\/profile\?first=1/);
  await phone.goto("/today");
  await expect(phone).toHaveURL(/\/profile\?first=1/);
  await phone.getByLabel("Current password").fill(password);
  await phone.getByLabel("New password", { exact: true }).fill("ifeanyi-password");
  await phone.getByLabel("New password again").fill("ifeanyi-password");
  await phone.getByRole("button", { name: "Save and continue" }).click();
  await expect(phone).toHaveURL(/\/today/);
  await phone.goto("/settings/users");
  await expect(phone).toHaveURL(/\/today/);
  await recorder.close();

  await page.reload();
  await expect(page.getByRole("row", { name: /Ifeanyi Obi/ })).toBeVisible();
});
