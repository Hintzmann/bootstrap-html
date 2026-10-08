import { listed } from "../data/components.js";
import { examples } from "../data/examples.js";
import { sitePath } from "./path.js";

const groups = [
  ["components", "Components"],
  ["forms", "Forms"],
  ["recipes", "Recipes"],
];

function behaviorNote(behavior) {
  if (!behavior) return "";
  const element = `\`<${behavior.element}>\` and \`${behavior.module}\``;
  return behavior.required ? ` Requires ${element}.` : ` Optional ${element}: ${behavior.adds}`;
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
    `Version ${packageJson.version}, Bootstrap ${packageJson.dependencies.bootstrap}. Class names are Bootstrap’s. Behavior comes from native HTML: \`<dialog>\`, \`popover\`, \`<details>\`, and \`command\` / \`commandfor\`.`,
    "",
    "Rules for generated markup:",
    "",
    "- Do not load `bootstrap.js` or `bootstrap.bundle.js`, and do not write `data-bs-*` attributes.",
    "- `command` / `commandfor` triggers are `<button>` elements, not `<a href>`. `commandfor` is an id with no `#`.",
    "- Load `src/polyfills/index.js` once per page with `type=\"module\"`. It fetches a fallback only when the browser lacks the API and the page uses it.",
    "- A component that requires a `pe-*` element does not work without that element and its module.",
    "- Start from the component’s example and follow its avoid list.",
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
    `- [Polyfills](${page("/polyfills")}): What each fallback covers and when the loader fetches it.`,
  ];

  for (const [group, title] of groups) {
    lines.push("", `## ${title}`, "");
    for (const item of listed(group)) {
      const experimental = item.baseline === "experimental" ? " Experimental." : "";
      lines.push(`- [${item.name}](${page(item.route)}): ${item.blurb}${behaviorNote(item.behavior)}${experimental}`);
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

/**
 * /llms-full.txt: the example and avoid list for every component in one
 * Markdown file, so an agent reading it as text gets copyable markup instead
 * of an escaped JSON string. Support and accessibility notes stay in
 * components.json to keep this short enough to read whole.
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
        `### ${item.name}`,
        "",
        `${item.blurb}${behaviorNote(item.behavior)}${experimental} Docs: ${page(item.route)}`,
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
