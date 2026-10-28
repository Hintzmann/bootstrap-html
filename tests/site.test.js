import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { renderChangelog } from "../src/lib/changelog.js";
import { formatUpdated, repositoryUrl, repositoryWebUrl, updatedOn, version } from "../src/lib/site.js";
import packageJson from "../package.json";

describe("repositoryWebUrl", () => {
  test("strips the npm git+ prefix and .git suffix", () => {
    expect(repositoryWebUrl({ url: "git+https://github.com/Hintzmann/bootstrap-html.git" })).toBe(
      "https://github.com/Hintzmann/bootstrap-html",
    );
  });

  test("rejects a non-GitHub url", () => {
    expect(repositoryWebUrl({ url: "git+https://gitlab.com/a/b.git" })).toBeNull();
    expect(repositoryWebUrl(null)).toBeNull();
    expect(repositoryWebUrl({})).toBeNull();
  });

  test("matches package.json", () => {
    expect(repositoryUrl).toBe("https://github.com/Hintzmann/bootstrap-html");
    expect(version).toBe(packageJson.version);
  });
});

describe("formatUpdated", () => {
  test("formats a committer calendar day in English", () => {
    expect(formatUpdated("2026-10-28")).toEqual({ iso: "2026-10-28", label: "28 Oct 2026" });
  });

  test("rejects a day the Date constructor would roll over", () => {
    expect(formatUpdated("2026-02-31")).toBeNull();
    expect(formatUpdated("yesterday")).toBeNull();
  });
});

describe("updatedOn", () => {
  test("is the committer date of HEAD", () => {
    const iso = execFileSync("git", ["log", "-1", "--format=%cs"], { encoding: "utf8" }).trim();
    expect(updatedOn()).toEqual(formatUpdated(iso));
  });
});

describe("renderChangelog", () => {
  test("turns the changelog subset into headings, lists, code, bold, and links", () => {
    const html = renderChangelog(`# Changelog

## 0.4.0

- **Contract v2** — \`<pe-tabs>\` stays.
- **\`pe-focus-group\`** — optional keys.
- See [the repo](https://github.com/Hintzmann/bootstrap-html).

A note.

### Detail

- \`**not bold**\`
- <script>alert(1)</script>
`);

    expect(html).not.toContain("<h1>");
    expect(html).toContain('<h2 id="v0.4.0" class="h4">0.4.0</h2>');
    expect(html).toContain("<h3>Detail</h3>");
    expect(html).toContain("<strong>Contract v2</strong>");
    expect(html).toContain("<strong><code>pe-focus-group</code></strong>");
    expect(html).toContain("<code>&lt;pe-tabs&gt;</code>");
    expect(html).toContain(
      '<a href="https://github.com/Hintzmann/bootstrap-html">the repo</a>',
    );
    expect(html).toContain("<p>A note.</p>");
    expect(html).toContain("<code>**not bold**</code>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  test("renders the package changelog with an id per version", () => {
    const html = renderChangelog(readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf8"));
    expect(html).toContain(`<h2 id="v${packageJson.version}" class="h4">${packageJson.version}</h2>`);
    expect(html).toContain("<strong>Contract v2</strong>");
    expect(html).toContain("<strong><code>pe-focus-group</code></strong>");
    expect(html).not.toContain("**");
    expect(html).not.toContain("<h1>");
  });
});
