import { components, scriptSubpath } from "../data/components.js";
import { examples } from "../data/examples.js";
import { bundleGzipKb, polyfillById } from "../data/js-cost.js";
import { contractHash, hashVersion } from "./hash.js";
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

/**
 * The project-side lockfile an agent writes after copying patterns. The
 * hash says whether a copy is out of date; `changes` says what to do.
 */
export const manifestFile = "bootstrap-html.lock.json";

export function manifestProtocol(packageJson) {
  return {
    file: manifestFile,
    rule: `After copying a pattern, write or update ${manifestFile} at the project root with one entry per pattern. On a later run, compare each entry's hash with this contract. Report every pattern whose hash differs, with the changes whose sinceVersion is newer than the entry's version. Never overwrite local files without asking.`,
    example: {
      contract: `${packageJson.name}@${packageJson.version}`,
      contractVersion,
      hashVersion,
      patterns: [
        {
          id: "modal",
          hash: "sha256-0123456789abcdef",
          version: packageJson.version,
          files: ["src/components/modal.html", "src/styles/modal.css"],
        },
      ],
    },
  };
}

export function buildContract(packageJson) {
  return {
    contractVersion,
    hashVersion,
    package: packageJson.name,
    version: packageJson.version,
    bootstrap: packageJson.dependencies.bootstrap,
    bootstrapBundleGzipKb: bundleGzipKb,
    patternUsage:
      "Without Bootstrap, start from `pattern`: copy its markup and CSS. Rename the `data-pe` hooks to the project's convention, but keep the state selectors, transition properties, and fallbacks. With Bootstrap, use `example`.",
    manifest: manifestProtocol(packageJson),
    polyfillLoader: {
      module: "src/polyfills/index.js",
      import: `${packageJson.name}/polyfills`,
      usage:
        "Import the loader once per document; it checks the markup that is there. After a client-side render, call its exported `loadPolyfills(root)` so markup added later still gets its fallback.",
    },
    components: components.map((item) => ({
      id: item.id,
      hash: contractHash(item),
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
      changes: item.changes ?? [],
      avoid: item.avoid,
      accessibility: item.a11y,
      pattern: patterns[item.id] ?? null,
      patternless: item.patternless ?? null,
      example: examples[item.id],
    })),
  };
}
