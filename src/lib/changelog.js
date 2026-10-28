/**
 * Renders CHANGELOG.md for the docs page. The file is headings, bullet
 * lists, `code`, **bold**, and https links. Anything else becomes a
 * paragraph. HTML in the source is escaped.
 */

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(text) {
  let html = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        html += `<strong>${inline(text.slice(i + 2, end))}</strong>`;
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        html += `<code>${escapeHtml(text.slice(i + 1, end))}</code>`;
        i = end + 1;
        continue;
      }
    }
    const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/.exec(text.slice(i));
    if (link) {
      html += `<a href="${escapeHtml(link[2])}">${inline(link[1])}</a>`;
      i += link[0].length;
      continue;
    }
    const next = text.slice(i).search(/[`[*]/);
    if (next === -1) {
      html += escapeHtml(text.slice(i));
      break;
    }
    const end = next === 0 ? i + 1 : i + next;
    html += escapeHtml(text.slice(i, end));
    i = end;
  }
  return html;
}

function versionId(text) {
  const version = text.match(/^\d+\.\d+\.\d+/)?.[0];
  return version ? ` id="v${version}"` : "";
}

/**
 * @param {string} markdown
 * @returns {string}
 */
export function renderChangelog(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  /** @type {string[]} */
  const out = [];
  /** @type {string[]} */
  let list = [];

  function flushList() {
    if (list.length === 0) return;
    out.push(`<ul>\n${list.map((item) => `<li>${inline(item)}</li>`).join("\n")}\n</ul>`);
    list = [];
  }

  for (const line of lines) {
    const heading = /^(#{1,3}) (.+)$/.exec(line);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 1) continue;
      const tag = level === 2 ? "h2" : "h3";
      const id = level === 2 ? versionId(text) : "";
      const cls = level === 2 ? ' class="h4"' : "";
      out.push(`<${tag}${id}${cls}>${inline(text)}</${tag}>`);
      continue;
    }

    const item = /^- (.+)$/.exec(line);
    if (item) {
      list.push(item[1]);
      continue;
    }

    if (line.trim() === "") {
      flushList();
      continue;
    }

    flushList();
    out.push(`<p>${inline(line.trim())}</p>`);
  }

  flushList();
  return out.join("\n");
}
