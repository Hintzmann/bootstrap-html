import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { components, listed } from "../src/data/components.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readRepo = (rel) => readFileSync(join(root, rel), "utf8");

describe("component inventory", () => {
  it("covers every documented component with support, avoid, and a11y", () => {
    expect(components.map((item) => item.id)).toEqual([
      "accordion",
      "alerts",
      "buttons",
      "collapse",
      "modal",
      "offcanvas",
      "navbar",
      "dropdown",
      "popover",
      "tooltip",
      "scrollspy",
      "tabs",
      "toasts",
      "carousel",
      "progress",
      "spinner",
      "validation",
      "field-sizing",
      "datalist",
      "output",
      "customizable-select",
      "composed",
    ]);
    for (const item of components) {
      expect(item.a11y.length, item.id).toBeGreaterThan(0);
      expect(item.avoid.length, item.id).toBeGreaterThan(0);
      expect(item.support.noScript, item.id).toBeTruthy();
      expect(item.support.polyfill, item.id).toBeTruthy();
      expect(item.support.noFallback, item.id).toBeTruthy();
    }
  });

  it("lists components alphabetically for the docs nav and catalog", () => {
    const names = listed("components").map((item) => item.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    expect(listed("components").every((item) => item.nav === "components")).toBe(true);
    expect(listed("components").map((item) => item.id)).not.toContain("composed");
    expect(listed("recipes").map((item) => item.id)).toEqual(["composed"]);
    expect(listed("forms").map((item) => item.id)).toEqual([
      "customizable-select",
      "datalist",
      "field-sizing",
      "output",
      "validation",
    ]);
  });

  it("lists every inventory route in the README docs table", () => {
    const readme = readRepo("README.md");
    for (const item of components) {
      expect(readme, item.route).toContain(item.route);
    }
    for (const route of ["/getting-started/", "/", "/polyfills/", "/components.json"]) {
      expect(readme, route).toContain(route);
    }
  });

  it("names every behavior module and count.js in AGENTS.md", () => {
    const agents = readRepo("AGENTS.md");
    const modules = [
      ...new Set(
        components
          .map((item) => item.behavior?.module)
          .filter(Boolean),
      ),
      "src/behaviors/count.js",
    ];
    for (const module of modules) {
      expect(agents, module).toContain(module);
    }
  });

  it("mentions the four polyfill loader APIs on getting started", () => {
    const page = readRepo("src/pages/getting-started.astro");
    for (const api of [
      "commandForElement",
      "closedBy",
      "scroll-target-group",
      "interestForElement",
    ]) {
      expect(page, api).toContain(api);
    }
  });

  it("keeps HTML compact so wrapped prose does not glue onto inline tags", () => {
    expect(readRepo("astro.config.mjs")).toMatch(/compressHTML:\s*true/);
  });
});
