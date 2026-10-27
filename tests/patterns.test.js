import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { components } from "../src/data/components.js";
import { examples } from "../src/data/examples.js";
import { buildContract } from "../src/lib/contract.js";
import { buildLlmsFull } from "../src/lib/llms.js";
import { patternDir, patterns } from "../src/lib/patterns.js";

const packageJson = { name: "bootstrap-html", version: "0.0.0", homepage: "https://example.test/", description: "", dependencies: { bootstrap: "^5.3.8" } };

const NEW_PSEUDO = /::(details-content|picker|picker-icon|checkmark|field-content|scroll-button|scroll-marker|scroll-marker-group|slider-fill|-webkit-[a-z-]+|-moz-[a-z-]+)/;

function fragment(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  return template.content;
}

function idRefs(root) {
  const refs = [];
  const single = ["commandfor", "aria-controls", "list", "data-controls"];
  const multi = ["for", "aria-labelledby", "aria-describedby"];
  for (const el of root.querySelectorAll("*")) {
    for (const name of single) if (el.hasAttribute(name)) refs.push([name, el.getAttribute(name)]);
    for (const name of multi) {
      if (!el.hasAttribute(name)) continue;
      for (const id of el.getAttribute(name).split(/\s+/).filter(Boolean)) refs.push([name, id]);
    }
  }
  return refs;
}

const uncommented = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function selectorsIn(css) {
  return [...uncommented(css).matchAll(/([^{};]+)\{/g)]
    .map(([, prelude]) => prelude.trim())
    .filter((prelude) => !prelude.startsWith("@") && !/^(from|to|\d+%)$/.test(prelude));
}

function topLevelList(selector) {
  let depth = 0;
  for (const char of selector) {
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === "," && depth === 0) return true;
  }
  return false;
}

describe("neutral patterns", () => {
  it("covers every inventory id with a pattern or a patternless reason, not both", () => {
    for (const item of components) {
      const has = Boolean(patterns[item.id]);
      expect(has !== Boolean(item.patternless), item.id).toBe(true);
      if (item.patternless) expect(item.patternless.length, item.id).toBeGreaterThan(20);
    }
  });

  it("has no pattern files for unknown ids", () => {
    const ids = new Set(components.map((item) => item.id));
    for (const file of readdirSync(patternDir)) {
      expect(ids.has(file.replace(/\.(html|css)$/, "")), file).toBe(true);
    }
  });

  it("uses only data-pe hooks: no classes, no data-bs-*, no script, no triple backtick", () => {
    for (const [id, pattern] of Object.entries(patterns)) {
      expect(pattern.markup, id).toContain(`data-pe="${id}"`);
      expect(pattern.markup, id).not.toMatch(/\sclass=|data-bs-|<script|```|\sstyle=/);
      expect(pattern.css, id).not.toContain("```");
      for (const selector of selectorsIn(pattern.css)) expect(selector, id).not.toMatch(/\.[a-z]/i);
      expect(pattern.hooks.map((hook) => hook.hook), id).toContain(`[data-pe="${id}"]`);
    }
  });

  it("selects only its own hook in CSS", () => {
    for (const [id, pattern] of Object.entries(patterns)) {
      for (const [, name] of pattern.css.matchAll(/data-pe="([^"]+)"/g)) expect(name, id).toBe(id);
    }
  });

  it("styles ::backdrop only in modal and offcanvas", () => {
    for (const [id, pattern] of Object.entries(patterns)) {
      const css = uncommented(pattern.css);
      if (["modal", "offcanvas"].includes(id)) expect(css, id).toContain("::backdrop");
      else expect(css, id).not.toContain("::backdrop");
    }
  });

  it("never lists a new pseudo-element next to another selector", () => {
    for (const [id, pattern] of Object.entries(patterns)) {
      for (const selector of selectorsIn(pattern.css)) {
        if (NEW_PSEUDO.test(selector)) expect(topLevelList(selector), `${id}: ${selector}`).toBe(false);
      }
    }
  });

  it("takes inline defaults for every --pe-* it reads but does not set", () => {
    for (const [id, pattern] of Object.entries(patterns)) {
      const set = new Set([...pattern.css.matchAll(/(--pe-[\w-]+)\s*:/g)].map(([, name]) => name));
      for (const [, name, fallback] of pattern.css.matchAll(/var\((--pe-[\w-]+)(\s*,)?/g)) {
        if (!set.has(name)) expect(fallback, `${id}: ${name}`).toBeTruthy();
      }
    }
  });

  it("includes the pe-* element of every required script", () => {
    for (const item of components.filter((entry) => patterns[entry.id])) {
      for (const script of item.scripts.filter((entry) => entry.required && entry.element)) {
        expect(patterns[item.id].markup, item.id).toContain(`<${script.element}`);
      }
    }
  });

  it("points every id reference at an element in the same markup", () => {
    const sources = [
      ...Object.entries(patterns).map(([id, pattern]) => [`pattern ${id}`, pattern.markup]),
      ...Object.entries(examples).map(([id, markup]) => [`example ${id}`, markup]),
    ];
    for (const [label, markup] of sources) {
      const root = fragment(markup);
      for (const [name, id] of idRefs(root)) {
        expect(root.getElementById(id), `${label}: ${name}="${id}"`).not.toBeNull();
      }
    }
  });

  it("writes the tabs start state in the markup", () => {
    for (const [label, markup] of [["pattern", patterns.tabs.markup], ["example", examples.tabs]]) {
      const root = fragment(markup);
      const tabs = [...root.querySelectorAll("[role=tab]")];
      const selected = tabs.filter((tab) => tab.getAttribute("aria-selected") === "true");
      expect(selected, label).toHaveLength(1);
      for (const tab of tabs) {
        const on = tab === selected[0];
        const panel = root.getElementById(tab.getAttribute("aria-controls"));
        expect(tab.getAttribute("tabindex"), `${label} ${tab.id}`).toBe(on ? null : "-1");
        expect(panel.getAttribute("hidden"), `${label} ${panel.id}`).toBe(on ? null : "until-found");
        expect(panel.getAttribute("aria-labelledby"), `${label} ${panel.id}`).toBe(tab.id);
      }
    }
  });

  it("ships the pattern in the contract and before the example in llms-full", () => {
    const contract = buildContract(packageJson);
    const text = buildLlmsFull({ packageJson, site: "https://example.test", base: "/" });
    for (const entry of contract.components) {
      expect(entry.pattern, entry.id).toEqual(patterns[entry.id] ?? null);
      if (!entry.pattern) {
        expect(entry.patternless, entry.id).toBeTruthy();
        continue;
      }
      const at = text.indexOf(entry.pattern.markup);
      expect(at, entry.id).toBeGreaterThan(-1);
      expect(text.indexOf(examples[entry.id], at), entry.id).toBeGreaterThan(at);
    }
  });
});
