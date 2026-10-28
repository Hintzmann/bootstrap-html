import { expect, test } from "@playwright/test";

test("docs load the minified loader and only the fallbacks the browser lacks", async ({ page }) => {
  await page.goto("about:blank");
  const native = await page.evaluate(() => ({
    interestfor: Object.hasOwn(HTMLButtonElement.prototype, "interestForElement"),
    "scroll-target-group": CSS.supports("scroll-target-group: auto"),
  }));

  const scripts = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname);
  });
  await page.goto("/components/tooltip/");
  await page.waitForLoadState("networkidle");

  expect(scripts).toContain("/js/polyfills/index.js");
  expect(scripts.filter((path) => path.includes("preload-helper"))).toEqual([]);
  for (const [name, has] of Object.entries(native)) {
    expect(scripts.includes(`/js/polyfills/${name}.js`), name).toBe(!has);
  }
  expect(await page.evaluate(() => Object.hasOwn(HTMLButtonElement.prototype, "interestForElement"))).toBe(true);
});

test("pattern pages load the minified behaviors as plain module scripts", async ({ page }) => {
  const scripts = [];
  page.on("request", (request) => {
    if (request.resourceType() === "script") scripts.push(new URL(request.url()).pathname);
  });
  await page.goto("/patterns/tabs/");
  await page.waitForLoadState("networkidle");

  expect(scripts).toContain("/js/behaviors/tabs.js");
  expect(scripts).toContain("/js/polyfills/index.js");
  expect(scripts.filter((path) => path.startsWith("/_astro/"))).toEqual([]);
  expect(await page.evaluate(() => customElements.get("pe-tabs") !== undefined)).toBe(true);
});
