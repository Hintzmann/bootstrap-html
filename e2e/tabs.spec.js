import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/components/tabs");
});

test("click selects a tab and hides the other panels until found", async ({ page }) => {
  const profile = page.locator("#profile-tab");
  await profile.click();
  await expect(profile).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#home-tab")).toHaveAttribute("aria-selected", "false");
  await expect(page.locator("#profile-tab-pane")).toBeVisible();
  await expect(page.locator("#home-tab-pane")).toHaveAttribute("hidden", "until-found");
  await expect(page.locator("#home-tab-pane")).toBeHidden();
});

test("arrow keys move the selection and focus", async ({ page }) => {
  const home = page.locator("#home-tab");
  await home.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#profile-tab")).toBeFocused();
  await expect(page.locator("#profile-tab")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(page.locator("#contact-tab")).toHaveAttribute("aria-selected", "true");
});

test("the selected tab gets the active look without .active", async ({ page }) => {
  const home = page.locator("#home-tab");
  const profile = page.locator("#profile-tab");
  const background = (el) => getComputedStyle(el).backgroundColor;
  const active = await home.evaluate(background);
  expect(await profile.evaluate(background)).not.toBe(active);
  await expect(home).not.toHaveClass(/\bactive\b/);
  await profile.click();
  await expect.poll(() => profile.evaluate(background)).toBe(active);
});

test("beforematch on a hidden panel selects its tab", async ({ page }) => {
  await page.locator("#contact-tab-pane").evaluate((el) => {
    el.dispatchEvent(new Event("beforematch", { bubbles: true }));
    el.removeAttribute("hidden");
  });
  await expect(page.locator("#contact-tab")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#home-tab-pane")).toHaveAttribute("hidden", "until-found");
});

test("pe-tab-change bubbles with the tab and panel", async ({ page }) => {
  const detail = page.evaluate(
    () =>
      new Promise((resolve) => {
        document.addEventListener(
          "pe-tab-change",
          (event) => resolve([event.detail.tab.id, event.detail.panel.id]),
          { once: true },
        );
      }),
  );
  await page.locator("#profile-tab").click();
  expect(await detail).toEqual(["profile-tab", "profile-tab-pane"]);
});
