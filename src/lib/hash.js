import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { patterns } from "./patterns.js";

/**
 * A short content hash per component, so an agent can tell that a copied
 * pattern is out of date. It detects change; it is not an integrity check.
 *
 * Input, as canonical JSON (sorted keys, LF line endings, `/` paths): the
 * pattern markup and CSS, the source of every required script, the
 * polyfill ids, and the avoid and a11y notes. Bump hashVersion when that
 * input changes shape, because every hash changes with it.
 */
export const hashVersion = 1;

const lf = (text) => text.replace(/\r\n/g, "\n");

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(typeof value === "string" ? lf(value) : value);
}

export function hashInput(item) {
  const pattern = patterns[item.id];
  return {
    pattern: pattern ? { markup: pattern.markup, css: pattern.css } : null,
    scripts: item.scripts
      .filter((script) => script.required)
      .map((script) => ({
        module: script.module.replaceAll("\\", "/"),
        source: lf(readFileSync(join(process.cwd(), script.module), "utf8")),
      })),
    polyfills: [...(item.cost.polyfill ?? [])].sort(),
    avoid: item.avoid,
    a11y: item.a11y,
  };
}

export function contractHash(item) {
  const digest = createHash("sha256").update(canonicalJson(hashInput(item)), "utf8").digest("hex");
  return `sha256-${digest.slice(0, 16)}`;
}
