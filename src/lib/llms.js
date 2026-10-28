import { listed } from "../data/components.js";
import { examples } from "../data/examples.js";
import { manifestFile } from "./contract.js";
import { contractHash } from "./hash.js";
import { sitePath } from "./path.js";
import { patterns } from "./patterns.js";

const groups = [
  ["components", "Components"],
  ["forms", "Forms"],
  ["recipes", "Recipes"],
];

function scriptsNote(scripts) {
  return scripts
    .map((script) => {
      const what = script.element
        ? `\`<${script.element}>\` and \`${script.module}\``
        : `\`${script.module}\``;
      return script.required ? ` Requires ${what}.` : ` Optional ${what}: ${script.adds}`;
    })
    .join("");
}

function links({ site, base }) {
  const url = (path) => new URL(sitePath(path, base), site).href;
  return { url, page: (route) => url(`${route}/`) };
}

function intro(packageJson) {
  return [
    "# Bootstrap HTML",
    "",
    `> ${packageJson.description}`,
    "",
    `Version ${packageJson.version}, Bootstrap ${packageJson.dependencies.bootstrap}. Behavior comes from native HTML: \`<dialog>\`, \`popover\`, \`<details>\`, and \`command\` / \`commandfor\`. Most components have a neutral pattern (markup and mechanics CSS on \`data-pe\` hooks, no classes) and an example in the Bootstrap theme.`,
    "",
    "Rules for generated markup:",
    "",
    "- Do not load `bootstrap.js` or `bootstrap.bundle.js`, and do not write `data-bs-*` attributes.",
    "- Without Bootstrap, start from the pattern. Rename `data-pe` hooks to the project’s convention (classes, Tailwind utilities, component props). Keep the mechanics: state selectors such as `:open`, `:popover-open`, `[open]`, `[hidden]`, and `[aria-selected]`, transition properties with `allow-discrete`, `@starting-style`, anchors, and `@supports` fallbacks. With Bootstrap, start from the example.",
    "- `command` / `commandfor` triggers are `<button>` elements, not `<a href>`. `commandfor` is an id with no `#`.",
    "- Load the polyfill loader once per page. A bundler imports `bootstrap-html/polyfills` (`src/polyfills/index.js`); a plain page uses `<script type=\"module\" src>` on the minified `dist/js/polyfills/index.js`. It fetches a fallback from the same folder only when the browser lacks the API and the page uses it.",
    "- A client-side router calls `loadPolyfills(root)`, exported by the same module, after each render. The first import only checks the markup that existed then.",
    "- A component that requires a `pe-*` element does not work without that element and its module.",
    "- Loading assets: with a bundler, import the package exports (`bootstrap-html/behaviors/tabs`, `bootstrap-html/polyfills`). A CMS or plain page loads the minified copies in `dist/js/` (each script's `script` in components.json, such as `dist/js/behaviors/tabs.js`) with `<script type=\"module\" src>`. An import map can point `bootstrap-html/` at the package folder so both use one specifier.",
    "- Who owns state: the platform owns `<dialog>` (`close`, `cancel`), `popover` (`beforetoggle`, `toggle`), and `<details>` (`toggle`). `<pe-tabs>` owns the selection (`select()`, `pe-tab-change`). `<pe-alert>` owns dismiss (`pe-dismiss`, cancelable). A framework renders the start state, then listens to those events and calls those methods; it does not re-render the state attributes they own.",
    `- After copying a pattern, record it in \`${manifestFile}\` at the project root: \`{ contract, contractVersion, hashVersion, patterns: [{ id, hash, version, files }] }\`, with \`id\`, \`hash\`, and \`version\` from the component heading in llms-full.txt. On a later run, report every pattern whose hash differs and the changes newer than its recorded version. Never overwrite local files without asking.`,
    "- Follow the component’s avoid list.",
  ];
}

/**
 * /llms.txt (https://llmstxt.org): an index an agent can fetch from the docs
 * URL alone. Links are absolute because the file is read outside the site.
 */
export function buildLlms({ packageJson, site, base }) {
  const { url, page } = links({ site, base });
  const lines = [
    ...intro(packageJson),
    "",
    "## Contract",
    "",
    `- [llms-full.txt](${url("/llms-full.txt")}): Every component’s example markup in an \`html\` code block, with its avoid list. The installed package has the same file at \`node_modules/bootstrap-html/dist/llms-full.txt\`.`,
    `- [components.json](${url("/components.json")}): The same examples plus polyfills, browser support, and accessibility notes, as JSON for tooling. Packaged at \`node_modules/bootstrap-html/dist/components.json\`.`,
    `- [Principles](${page("/principles")}): Why native HTML, progressive enhancement, accessibility, and these contracts.`,
    `- [Getting started](${page("/getting-started")}): Stylesheet, polyfill loader, Sass, and the \`data-bs-*\` migration table.`,
    `- [Changelog](${page("/changelog")}): Release notes for this package version.`,
    `- [Polyfills](${page("/polyfills")}): What each fallback covers and when the loader fetches it.`,
  ];

  for (const [group, title] of groups) {
    lines.push("", `## ${title}`, "");
    for (const item of listed(group)) {
      const experimental = item.baseline === "experimental" ? " Experimental." : "";
      lines.push(`- [${item.name}](${page(item.route)}): ${item.blurb}${scriptsNote(item.scripts)}${experimental}`);
    }
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Browser matrix](${url("/")}): What works without script, what a polyfill covers, and what has no fallback, per component.`,
    "",
  );
  return lines.join("\n");
}

function changeLines(item) {
  if (!item.changes?.length) return [];
  return [
    "",
    "Changes:",
    "",
    ...item.changes.map(
      (change) =>
        `- ${change.sinceVersion} ${change.type}: ${change.note}${change.migration ? ` Migration: ${change.migration}` : ""}`,
    ),
  ];
}

function patternLines(item, page) {
  const pattern = patterns[item.id];
  if (!pattern) return ["", `No neutral pattern: ${item.patternless}`];
  const hooks = pattern.hooks.map(({ hook, element }) => `\`${hook}\` on \`<${element}>\``).join(", ");
  const lines = [
    "",
    `Neutral pattern (${pattern.files.join(", ")}). Hooks: ${hooks}. Live: ${page(`/patterns/${item.id}`)}`,
    "",
    "```html",
    pattern.markup,
    "```",
  ];
  if (pattern.css) lines.push("", "```css", pattern.css, "```");
  return lines;
}

/**
 * /llms-full.txt: the neutral pattern, the Bootstrap example, and the avoid
 * list for every component in one Markdown file, so an agent reading it as
 * text gets copyable markup instead of an escaped JSON string. Support and
 * accessibility notes stay in components.json to keep this short enough to
 * read whole.
 */
export function buildLlmsFull({ packageJson, site, base }) {
  const { page } = links({ site, base });
  const lines = intro(packageJson);

  for (const [group, title] of groups) {
    lines.push("", `## ${title}`);
    for (const item of listed(group)) {
      const experimental = item.baseline === "experimental" ? " Experimental." : "";
      lines.push(
        "",
        `### ${item.name} · id \`${item.id}\` · hash \`${contractHash(item)}\` · version ${packageJson.version}`,
        "",
        `${item.blurb}${scriptsNote(item.scripts)}${experimental} Docs: ${page(item.route)}`,
        ...changeLines(item),
        ...patternLines(item, page),
        "",
        "Bootstrap theme example:",
        "",
        "```html",
        examples[item.id],
        "```",
        "",
        "Avoid:",
        "",
        ...item.avoid.map((line) => `- ${line}`),
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}
