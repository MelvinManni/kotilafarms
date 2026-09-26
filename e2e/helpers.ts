// Shared e2e steps
import { expect, type Page } from "@playwright/test";
import { E2E } from "./e2e-env";

export async function signIn(page: Page, email = E2E.owner.email, password = E2E.owner.password) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/today/);
}
