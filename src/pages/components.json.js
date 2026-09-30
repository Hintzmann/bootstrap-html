import packageJson from "../../package.json";
import { components } from "../data/components.js";
import { bundleGzipKb, polyfillById } from "../data/js-cost.js";

/**
 * The component inventory as JSON, for tooling and agents that would
 * otherwise have to read 14 .astro pages to learn the markup contract.
 *
 * Text fields keep the Markdown backticks from src/data/components.js.
 */
export function GET() {
  const body = {
    package: packageJson.name,
    version: packageJson.version,
    bootstrap: packageJson.dependencies.bootstrap,
    bootstrapBundleGzipKb: bundleGzipKb,
    components: components.map((item) => ({
      id: item.id,
      name: item.name,
      route: item.route,
      docs: `${item.route}/`,
      summary: item.blurb,
      needsScript: item.status === "script",
      baseline: item.baseline,
      element: item.behavior
        ? {
            name: item.behavior.element,
            module: item.behavior.module,
            required: item.behavior.required,
            adds: item.behavior.adds,
          }
        : null,
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
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
