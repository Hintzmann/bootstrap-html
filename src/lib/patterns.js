import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { components } from "../data/components.js";

/**
 * Neutral patterns: src/patterns/<id>.html and an optional <id>.css, keyed
 * by inventory id. Markup is elements, attributes, and data-pe hooks; the
 * CSS is the mechanics those hooks need. They are the stack-neutral half
 * of the contract; src/data/examples.js is the Bootstrap theme.
 *
 * Paths resolve from the working directory. npm scripts, Astro, and
 * Vitest all run from the project root, and an Astro build moves this
 * module, so import.meta.url would point at the wrong folder.
 */
export const patternDir = join(process.cwd(), "src", "patterns");

function read(file) {
  return existsSync(file) ? readFileSync(file, "utf8").replace(/\r\n/g, "\n").trimEnd() : "";
}

/** Every element with a data-pe attribute, as `{ hook, element }`. */
export function hooksIn(markup) {
  return [...markup.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*?\sdata-pe="([^"]+)"/g)].map(([, element, name]) => ({
    hook: `[data-pe="${name}"]`,
    element,
  }));
}

export const patterns = Object.fromEntries(
  components
    .filter((item) => existsSync(join(patternDir, `${item.id}.html`)))
    .map((item) => {
      const markup = read(join(patternDir, `${item.id}.html`));
      return [
        item.id,
        {
          markup,
          css: read(join(patternDir, `${item.id}.css`)),
          hooks: hooksIn(markup),
          files: [`src/patterns/${item.id}.html`, existsSync(join(patternDir, `${item.id}.css`)) && `src/patterns/${item.id}.css`].filter(Boolean),
        },
      ];
    }),
);
