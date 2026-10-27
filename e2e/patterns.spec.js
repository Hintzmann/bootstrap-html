import { expect, test } from "@playwright/test";

const backdrop = (locator) =>
  locator.evaluate((el) => getComputedStyle(el, "::backdrop").backgroundColor);
const transparent = /^(transparent|rgba\(0, 0, 0, 0\))$/;

test.describe("top layer", () => {
  test("modal fades in with a backdrop, locks scroll, and closes from its form", async ({ page }) => {
    await page.goto("/patterns/modal");
    const dialog = page.locator("#pe-modal");
    await page.getByRole("button", { name: "Delete file" }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("opacity", "1");
    expect(await backdrop(dialog)).not.toMatch(transparent);
    await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    expect(await dialog.evaluate((el) => el.returnValue)).toBe("cancel");
    await expect(page.locator("html")).not.toHaveCSS("overflow-y", "hidden");
  });

  test("offcanvas slides in with a backdrop and closes with Escape", async ({ page }) => {
    await page.goto("/patterns/offcanvas");
    const dialog = page.locator("#pe-offcanvas");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("translate", "none");
    expect(await backdrop(dialog)).not.toMatch(transparent);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("dropdown opens under its trigger without a backdrop", async ({ page }) => {
    await page.goto("/patterns/dropdown");
    const trigger = page.getByRole("button", { name: "Options" });
    const menu = page.locator("#pe-dropdown-menu");
    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("opacity", "1");
    expect(await backdrop(menu)).toMatch(transparent);
    if (await page.evaluate(() => CSS.supports("anchor-name: --a"))) {
      const button = await trigger.boundingBox();
      const box = await menu.boundingBox();
      expect(Math.abs(box.y - (button.y + button.height))).toBeLessThan(2);
    }
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("dropdown opens from the keyboard and moves with the arrow keys", async ({ page }) => {
    await page.goto("/patterns/dropdown");
    await page.getByRole("button", { name: "Options" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#pe-dropdown-menu")).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("link", { name: "Duplicate" })).toBeFocused();
  });

  test("popover opens next to its invoker without a backdrop", async ({ page }) => {
    await page.goto("/patterns/popover");
    const popover = page.locator("#pe-popover");
    await page.getByRole("button", { name: "Shipping info" }).click();
    await expect(popover).toBeVisible();
    expect(await backdrop(popover)).toMatch(transparent);
  });

  test("toast shows and hides from its buttons", async ({ page }) => {
    await page.goto("/patterns/toasts");
    const toast = page.locator("#pe-toast");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(toast).toBeVisible();
    await toast.getByRole("button", { name: "Close" }).click();
    await expect(toast).toBeHidden();
  });
});

test.describe("disclosure and tabs", () => {
  test("accordion keeps one item open", async ({ page }) => {
    await page.goto("/patterns/accordion");
    const items = page.locator('[data-pe="accordion"] > details');
    await expect(items.nth(0)).toHaveAttribute("open", "");
    await items.nth(1).locator("summary").click();
    await expect(items.nth(1)).toHaveAttribute("open", "");
    await expect(items.nth(0)).not.toHaveAttribute("open", "");
  });

  test("tabs switch panels and leave the others until-found", async ({ page }) => {
    await page.goto("/patterns/tabs");
    await page.getByRole("tab", { name: "Security" }).click();
    await expect(page.locator("#pe-panel-security")).toBeVisible();
    await expect(page.locator("#pe-panel-profile")).toHaveAttribute("hidden", "until-found");
    await expect(page.locator("#pe-panel-profile")).toBeHidden();
  });

  test("alert fades out and is removed", async ({ page }) => {
    await page.goto("/patterns/alerts");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.locator("#pe-alert")).toHaveCount(0);
  });
});

test.describe("forms", () => {
  test("spin button steps the field and stays in range", async ({ page }) => {
    await page.goto("/patterns/spin-button");
    const field = page.locator("#pe-qty");
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(field).toHaveValue("2");
    await page.getByRole("button", { name: "Decrease quantity" }).click();
    await page.getByRole("button", { name: "Decrease quantity" }).click();
    await expect(field).toHaveValue("1");
  });

  test("range group writes the fill positions", async ({ page }) => {
    await page.goto("/patterns/range-group");
    const group = page.locator('[data-pe="range-group"]');
    await expect.poll(() => group.evaluate((el) => el.style.getPropertyValue("--pe-range-lower"))).toBe("20");
    await expect.poll(() => group.evaluate((el) => el.style.getPropertyValue("--pe-range-upper"))).toBe("80");
  });

  test("output counts checked boxes and keeps its label", async ({ page }) => {
    await page.goto("/patterns/output");
    await page.getByLabel("SMS").check();
    await expect(page.locator("#pe-notify-count")).toHaveText("2 selected");
  });

  test("validation shows the message only after the user tries", async ({ page }) => {
    await page.goto("/patterns/validation");
    const message = page.locator("#pe-email-error");
    await expect(message).toBeHidden();
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(message).toBeVisible();
  });

  test("tooltip shows on keyboard focus", async ({ page }) => {
    await page.goto("/patterns/tooltip");
    const button = page.getByRole("button", { name: "Save" });
    await expect.poll(() => button.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("0");
    await button.focus();
    await expect(button).toBeFocused();
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el, "::after").opacity))
      .toBe("1");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("tabs show the panel from the markup", async ({ page }) => {
    await page.goto("/patterns/tabs");
    await expect(page.locator("#pe-panel-profile")).toBeVisible();
    await expect(page.locator("#pe-panel-security")).toBeHidden();
  });

  test("accordion still opens", async ({ page }) => {
    await page.goto("/patterns/accordion");
    const second = page.locator('[data-pe="accordion"] > details').nth(1);
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("top-layer patterns drop their transitions", async ({ page }) => {
    for (const [path, selector] of [
      ["/patterns/modal", "#pe-modal"],
      ["/patterns/offcanvas", "#pe-offcanvas"],
      ["/patterns/dropdown", "#pe-dropdown-menu"],
      ["/patterns/popover", "#pe-popover"],
    ]) {
      await page.goto(path);
      const duration = await page.locator(selector).evaluate((el) => getComputedStyle(el).transitionDuration);
      expect(duration.split(",").every((part) => part.trim() === "0s"), path).toBe(true);
    }
  });
});

test.describe("forced colors", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "forced-colors emulation is Chromium only");
  test.use({ forcedColors: "active" });

  test("modal and tooltip stay visible", async ({ page }) => {
    await page.goto("/patterns/modal");
    await page.getByRole("button", { name: "Delete file" }).click();
    await expect(page.locator("#pe-modal")).toBeVisible();
    await page.goto("/patterns/tooltip");
    const after = await page
      .getByRole("button", { name: "Save" })
      .evaluate((el) => getComputedStyle(el, "::after").content);
    expect(after).toContain("Saves a copy");
  });
});
