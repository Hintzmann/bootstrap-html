import { sitePath } from "./path.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/**
 * Render the Markdown subset used in src/data/components.js.
 *
 * `code` becomes <code>, and [label](/route) becomes a link. A href that
 * starts with "/" goes through sitePath, so the base prefix is applied the
 * same way as in the templates.
 *
 * Escaping runs first, so the data file can hold <details> or a quote
 * without the result depending on where it is interpolated. The return
 * value is trusted markup for set:html.
 */
/** "a", "b", "c" -> "a, b and c". Keeps list prose out of the templates, where
 *  JSX whitespace would leave a gap before each separator. */
export function joinList(items) {
  if (items.length < 2) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function inlineMarkup(text) {
  return escapeHtml(text ?? "")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
      const url = href.startsWith("/") ? sitePath(href) : href;
      return `<a href="${url}">${label}</a>`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
