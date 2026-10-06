import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { components, listed } from "../src/data/components.js";
import { examples } from "../src/data/examples.js";
import { buildContract } from "../src/lib/contract.js";
import { buildLlms, buildLlmsFull } from "../src/lib/llms.js";

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
      "spin-button",
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

  it("renders each canonical example on its component page", () => {
    expect(Object.keys(examples).sort()).toEqual(components.map((item) => item.id).sort());
    for (const item of components) {
      const key = /^[a-z]+$/.test(item.id) ? `examples.${item.id}` : `examples["${item.id}"]`;
      expect(readRepo(`src/pages${item.route}.astro`), item.id).toContain(`code={${key}}`);
      expect(examples[item.id], item.id).not.toMatch(/data-bs-|bootstrap\.js|pep-/);
      if (item.behavior?.required) {
        expect(examples[item.id], item.id).toContain(`<${item.behavior.element}`);
        expect(examples[item.id], item.id).toContain(item.behavior.module);
      }
    }
  });

  it("ships the example in the package contract", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    const contract = buildContract(packageJson);
    expect(contract.components.map((item) => item.id)).toEqual(components.map((item) => item.id));
    expect(contract.components.every((item) => item.example)).toBe(true);
    expect(packageJson.files).toContain("dist/components.json");
    expect(packageJson.exports["./components.json"]).toBe("./dist/components.json");
  });

  it("links every component from llms.txt with absolute URLs under base", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    const text = buildLlms({ packageJson, site: "https://example.org", base: "/bootstrap-html/" });
    expect(text.startsWith("# Bootstrap HTML\n\n> ")).toBe(true);
    expect(text).toContain("(https://example.org/bootstrap-html/components.json)");
    expect(text).toContain("(https://example.org/bootstrap-html/llms-full.txt)");
    for (const item of components) {
      expect(text, item.id).toContain(`[${item.name}](https://example.org/bootstrap-html${item.route}/)`);
      if (item.behavior?.required) expect(text, item.id).toContain(`Requires \`<${item.behavior.element}>\``);
    }
    expect(text).not.toMatch(/\]\(\//);
  });

  it("puts every example in its own html fence in llms-full.txt", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    const text = buildLlmsFull({ packageJson, site: "https://example.org", base: "/bootstrap-html/" });
    for (const item of components) {
      expect(examples[item.id], item.id).not.toContain("```");
      expect(text, item.id).toContain(`### ${item.name}\n`);
      expect(text, item.id).toContain(`\`\`\`html\n${examples[item.id]}\n\`\`\``);
      for (const line of item.avoid) expect(text, item.id).toContain(`- ${line}`);
    }
    expect(text.match(/^```/gm)).toHaveLength(components.length * 2);
    expect(text).not.toMatch(/\]\(\//);
    expect(packageJson.files).toContain("dist/llms-full.txt");
    expect(packageJson.exports["./llms-full.txt"]).toBe("./dist/llms-full.txt");
    expect(new URL(packageJson.homepage).pathname).toBe("/bootstrap-html/");
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
      "spin-button",
      "validation",
    ]);
  });

  it("lists every inventory route in the README docs table", () => {
    const readme = readRepo("README.md");
    for (const item of components) {
      expect(readme, item.route).toContain(item.route);
    }
    for (const route of ["/getting-started/", "/", "/polyfills/", "/components.json", "/llms.txt", "/llms-full.txt"]) {
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
      "src/behaviors/step.js",
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
