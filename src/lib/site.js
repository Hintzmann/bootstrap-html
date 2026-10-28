import { execFileSync } from "node:child_process";
import packageJson from "../../package.json";

export const version = packageJson.version;

/**
 * Browse URL for package.json `repository`. npm's form is
 * `git+https://github.com/owner/name.git`; the docs site wants the https URL.
 * @param {string | { url?: string } | undefined} repository
 */
export function repositoryWebUrl(repository = packageJson.repository) {
  const raw = typeof repository === "string" ? repository : repository?.url;
  if (typeof raw !== "string" || raw.length === 0) return null;
  const url = raw.replace(/^git\+/, "").replace(/\.git$/, "");
  if (!/^https:\/\/github\.com\/[^/\s]+\/[^/\s]+$/.test(url)) return null;
  return url;
}

export const repositoryUrl = repositoryWebUrl();

/**
 * @param {string} iso `YYYY-MM-DD` from `git log --format=%cs` (committer calendar day)
 * @returns {{ iso: string, label: string } | null}
 */
export function formatUpdated(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return { iso, label };
}

/** @type {{ iso: string, label: string } | null | undefined} */
let cachedUpdated;

/**
 * Committer date of HEAD. A rebuild that does not change the commit must
 * not stamp "today" on the docs.
 * @returns {{ iso: string, label: string } | null}
 */
export function updatedOn() {
  if (cachedUpdated !== undefined) return cachedUpdated;
  cachedUpdated = readUpdated();
  return cachedUpdated;
}

function readUpdated() {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cs"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return formatUpdated(iso);
  } catch {
    return null;
  }
}
