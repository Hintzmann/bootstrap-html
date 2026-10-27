import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { buildContract } from "../src/lib/contract.js";

// Every path the contract or package.json exports names must be in the
// tarball an install would get. Run after `npm run build`; scripts are
// skipped so `prepare` does not rebuild.
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const npm = process.env.npm_execpath;
if (!npm) throw new Error("Run through npm: npm run check:pack");
const raw = execFileSync(process.execPath, [npm, "pack", "--dry-run", "--json", "--ignore-scripts"], {
  encoding: "utf8",
});
const [pack] = JSON.parse(raw.slice(raw.indexOf("[")));
const files = new Set(pack.files.map((file) => file.path.replaceAll("\\", "/")));

const missing = [];
const need = (path, from) => {
  const clean = path.replace(/^\.\//, "");
  const ok = clean.endsWith("*") ? [...files].some((file) => file.startsWith(clean.slice(0, -1))) : files.has(clean);
  if (!ok) missing.push(`${clean} (${from})`);
};

const targets = (value) => (typeof value === "string" ? [value] : Object.values(value).flatMap(targets));
for (const [key, value] of Object.entries(packageJson.exports)) {
  for (const target of targets(value)) need(target, `exports ${key}`);
}
need(packageJson.style, "style");
need(packageJson.sass, "sass");

const contract = buildContract(packageJson);
need(contract.polyfillLoader.module, "polyfillLoader");
need("dist/components.json", "contract");
need("dist/llms-full.txt", "contract");
for (const item of contract.components) {
  for (const script of item.scripts) need(script.module, `${item.id} script`);
  for (const polyfill of item.polyfills) need(polyfill.module, `${item.id} polyfill`);
  for (const file of item.pattern?.files ?? []) need(file, `${item.id} pattern`);
}

if (missing.length) {
  console.error(`Missing from the package:\n${missing.map((line) => `  ${line}`).join("\n")}`);
  process.exit(1);
}
console.log(`Package has every contract path (${files.size} files).`);
