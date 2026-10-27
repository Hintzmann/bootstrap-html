import { components, scriptSubpath } from "../data/components.js";
import { examples } from "../data/examples.js";
import { bundleGzipKb, polyfillById } from "../data/js-cost.js";
import { patterns } from "./patterns.js";

/**
 * The component inventory as JSON, for tooling and agents that would
 * otherwise have to read every .astro page to learn the markup contract.
 * Served at /components.json and shipped in the package as
 * dist/components.json.
 *
 * Text fields keep the Markdown backticks from src/data/components.js.
 *
 * `pattern` is the stack-neutral markup and mechanics CSS from
 * src/patterns, or null with a `patternless` reason. `example` is the same
 * component in the Bootstrap theme.
 */
export const contractVersion = 2;

export function buildContract(packageJson) {
  return {
    contractVersion,
    package: packageJson.name,
    version: packageJson.version,
    bootstrap: packageJson.dependencies.bootstrap,
    bootstrapBundleGzipKb: bundleGzipKb,
    patternUsage:
      "Without Bootstrap, start from `pattern`: copy its markup and CSS. Rename the `data-pe` hooks to the project's convention, but keep the state selectors, transition properties, and fallbacks. With Bootstrap, use `example`.",
    polyfillLoader: {
      module: "src/polyfills/index.js",
      import: `${packageJson.name}/polyfills`,
      usage:
        "Import the loader once per document; it checks the markup that is there. After a client-side render, call its exported `loadPolyfills(root)` so markup added later still gets its fallback.",
    },
    components: components.map((item) => ({
      id: item.id,
      name: item.name,
      route: item.route,
      docs: `${item.route}/`,
      summary: item.blurb,
      needsScript: item.status === "script",
      baseline: item.baseline,
      scripts: item.scripts.map((script) => ({
        element: script.element,
        module: script.module,
        import: `${packageJson.name}${scriptSubpath(script).slice(1)}`,
        required: script.required,
        adds: script.adds,
      })),
      polyfills: (item.cost.polyfill ?? []).map((key) => ({
        module: `src/polyfills/${polyfillById[key].file}`,
        gzipKb: polyfillById[key].kb,
        loadedWhen: polyfillById[key].when,
      })),
      javascript: { bootstrap: item.cost.bootstrapJs, bootstrapHtml: item.cost.nativeJs },
      platform: { bootstrap: item.cost.bootstrap, bootstrapHtml: item.cost.native },
      support: item.support,
      replaces: item.removed,
      avoid: item.avoid,
      accessibility: item.a11y,
      pattern: patterns[item.id] ?? null,
      patternless: item.patternless ?? null,
      example: examples[item.id],
    })),
  };
}
