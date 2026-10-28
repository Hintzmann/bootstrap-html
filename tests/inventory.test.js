import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { components, listed, scriptPath, scriptSubpath } from "../src/data/components.js";
import { examples } from "../src/data/examples.js";
import { buildContract } from "../src/lib/contract.js";
import { buildLlms, buildLlmsFull } from "../src/lib/llms.js";
import { patterns } from "../src/lib/patterns.js";

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
      "range-group",
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
      for (const script of item.scripts.filter((entry) => entry.required)) {
        if (script.element) expect(examples[item.id], item.id).toContain(`<${script.element}`);
        expect(examples[item.id], item.id).toContain(`node_modules/bootstrap-html/${scriptPath(script)}`);
      }
    }
  });

  it("lists every script a component loads as an exported module", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    for (const item of components) {
      if (item.status === "script") {
        expect(item.scripts.some((script) => script.required), item.id).toBe(true);
      }
      for (const script of item.scripts) {
        expect(script.module, item.id).toMatch(/^src\/behaviors\/[a-z-]+\.js$/);
        expect(existsSync(join(root, script.module)), script.module).toBe(true);
        expect(packageJson.exports[scriptSubpath(script)], script.module).toBe(`./${script.module}`);
        if (script.element) {
          const source = readRepo(script.module);
          const siblings = [...source.matchAll(/(?:import\(|from )"\.\/([a-z-]+\.js)"/g)].map(([, file]) =>
            readRepo(`src/behaviors/${file}`),
          );
          expect([source, ...siblings].join("\n"), script.module).toContain(`customElements.define("${script.element}"`);
        }
      }
    }
  });

  it("ships the example in the package contract", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    const contract = buildContract(packageJson);
    expect(contract.components.map((item) => item.id)).toEqual(components.map((item) => item.id));
    expect(contract.components.every((item) => item.example)).toBe(true);
    expect(contract.contractVersion).toBe(2);
    const spin = contract.components.find((item) => item.id === "spin-button");
    expect(spin.scripts).toEqual([
      expect.objectContaining({
        element: null,
        import: "bootstrap-html/behaviors/step",
        script: "dist/js/behaviors/step.js",
        required: true,
      }),
    ]);
    expect(packageJson.exports["./js/behaviors/*"]).toBe("./dist/js/behaviors/*");
    expect(packageJson.files).toContain("dist/components.json");
    expect(packageJson.exports["./components.json"]).toBe("./dist/components.json");
  });

  it("declares the BSD-3-Clause interestfor code next to MIT", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    expect(packageJson.license).toBe("MIT AND BSD-3-Clause");
    expect(readRepo("LICENSE")).toContain("BSD 3-Clause License");
    expect(readRepo("src/polyfills/interestfor.js")).toMatch(/^\/\*! interestfor: .*BSD-3-Clause/);
  });

  it("links every component from llms.txt with absolute URLs under base", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    const text = buildLlms({ packageJson, site: "https://example.org", base: "/bootstrap-html/" });
    expect(text.startsWith("# Bootstrap HTML\n\n> ")).toBe(true);
    expect(text).toContain("(https://example.org/bootstrap-html/components.json)");
    expect(text).toContain("(https://example.org/bootstrap-html/llms-full.txt)");
    for (const item of components) {
      expect(text, item.id).toContain(`[${item.name}](https://example.org/bootstrap-html${item.route}/)`);
      for (const script of item.scripts.filter((entry) => entry.required)) {
        const what = script.element ? `<${script.element}>` : script.module;
        expect(text, item.id).toContain(`Requires \`${what}\``);
      }
    }
    expect(text).not.toMatch(/\]\(\//);
  });

  it("puts every example in its own html fence in llms-full.txt", () => {
    const packageJson = JSON.parse(readRepo("package.json"));
    const text = buildLlmsFull({ packageJson, site: "https://example.org", base: "/bootstrap-html/" });
    for (const item of components) {
      expect(examples[item.id], item.id).not.toContain("```");
      expect(text, item.id).toContain(`### ${item.name} · id \`${item.id}\` · hash `);
      expect(text, item.id).toContain(`\`\`\`html\n${examples[item.id]}\n\`\`\``);
      for (const line of item.avoid) expect(text, item.id).toContain(`- ${line}`);
    }
    const fences = components.reduce((n, item) => {
      const pattern = patterns[item.id];
      return n + 2 + (pattern ? 2 : 0) + (pattern?.css ? 2 : 0);
    }, 0);
    expect(text.match(/^```/gm)).toHaveLength(fences);
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
      "range-group",
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

  it("names every script module in AGENTS.md", () => {
    const agents = readRepo("AGENTS.md");
    const modules = [...new Set(components.flatMap((item) => item.scripts.map((script) => script.module)))];
    expect(modules).toEqual(expect.arrayContaining([
      "src/behaviors/count.js",
      "src/behaviors/step.js",
      "src/behaviors/range-group.js",
    ]));
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
