import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    indexedDB.deleteDatabase("drawDB");
    localStorage.clear();
    sessionStorage.clear();
  });
});

test("landing page shows hero and learn more scroll", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Draw, Copy, and Paste" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Learn more" }).click();
  await expect(page.locator("#learn-more")).toBeInViewport();
});

test("editor flow prompts for database selection", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("link", { name: /try it for yourself/i })
    .click();

  await expect(page).toHaveURL(/\/editor/);
  await expect(
    page.getByRole("heading", { name: "Choose a database" }),
  ).toBeVisible();

  await page.getByText("Generic", { exact: true }).click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByText(/Tables \(0\)/)).toBeVisible();
});
