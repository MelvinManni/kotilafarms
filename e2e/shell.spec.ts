// The app frame: rail on desktop, tab bar and More on phones, signing out
import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("owner gets the side rail on desktop", async ({ page }) => {
  await signIn(page);
  const rail = page.getByRole("navigation", { name: "Main" });
  await expect(rail.getByRole("link", { name: "Finance" })).toBeVisible();
  await expect(rail.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
});

test("the name in the rail opens the profile", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: /Your profile: Kosi/ }).click();
  await expect(page.getByRole("heading", { name: "Your profile" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Change password" })).toBeVisible();
});

test("owner on a phone opens More and signs out @phone", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: "More" }).click();
  await expect(page.getByRole("link", { name: "Expenses" })).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveURL(/\/settings\/users/);
  await page.getByRole("button", { name: /Your profile: Kosi/ }).click();
  await expect(page).toHaveURL(/\/profile/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.goto("/today");
  await expect(page).toHaveURL(/\/sign-in/);
});
