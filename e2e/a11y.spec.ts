// Accessibility: no serious or critical axe problems on the main pages, desktop and phone
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { E2E } from "./e2e-env";
import { signIn } from "./helpers";

const OWNER_PAGES = ["/today", "/sets", "/log", "/weigh", "/feed", "/health", "/sales", "/sales/buyers", "/expenses", "/finance", "/finance/capital", "/reports/weekly", "/reports/set", "/reports/compare", "/settings/users", "/settings/breed", "/settings/feed", "/settings/vaccines", "/settings/categories"];

async function problems(page: import("@playwright/test").Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test("sign-in page has no serious accessibility problems", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("button", { name: "Sign in" }).waitFor();
  expect(await problems(page)).toEqual([]);
});

async function sweep(page: import("@playwright/test").Page) {
  await signIn(page, E2E.owner.email, E2E.owner.password);
  const found: Record<string, string[]> = {};
  for (const path of OWNER_PAGES) {
    await page.goto(path);
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
    const list = await problems(page);
    if (list.length) found[path] = list;
  }
  return found;
}

test("owner pages have no serious accessibility problems on a laptop", async ({ page }) => {
  test.setTimeout(240_000);
  expect(await sweep(page)).toEqual({});
});

test("owner pages have no serious accessibility problems on a phone @phone", async ({ page }) => {
  test.setTimeout(240_000);
  expect(await sweep(page)).toEqual({});
});
