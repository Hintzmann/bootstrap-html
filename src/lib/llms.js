import { listed } from "../data/components.js";
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

/**
 * /llms.txt (https://llmstxt.org): an index an agent can fetch from the docs
 * URL alone. Links are absolute because the file is read outside the site.
 * The markup contract itself stays in components.json.
 */
export function buildLlms({ packageJson, site, base }) {
  const url = (path) => new URL(sitePath(path, base), site).href;
  const page = (route) => url(`${route}/`);
  const lines = [
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
    "- Start from the component’s `example` in components.json and follow its `avoid` list.",
    "",
    "## Contract",
    "",
    `- [components.json](${url("/components.json")}): Example markup, required or optional \`pe-*\` element, polyfills, browser support, \`avoid\`, and accessibility notes for every component. The installed package has the same file at \`node_modules/bootstrap-html/dist/components.json\`.`,
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
