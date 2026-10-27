import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/alerts");
});

test("close fades the alert out, then removes it", async ({ page }) => {
  const alert = page.locator("#dismiss-alert");
  await expect(alert).toBeVisible();
  await expect(alert).toHaveCSS("opacity", "1");
  await alert.getByRole("button", { name: "Close" }).click();
  await expect(alert).toHaveCount(0);
});

test("a canceled pe-dismiss keeps the alert", async ({ page }) => {
  await page.evaluate(() => {
    document.addEventListener("pe-dismiss", (event) => event.preventDefault(), { once: true });
  });
  const alert = page.locator("#dismiss-alert");
  await alert.getByRole("button", { name: "Close" }).click();
  await expect(alert).toBeVisible();
});

test("reduced motion removes the alert at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const alert = page.locator("#dismiss-alert");
  await alert.getByRole("button", { name: "Close" }).click();
  await expect(alert).toHaveCount(0, { timeout: 100 });
});
