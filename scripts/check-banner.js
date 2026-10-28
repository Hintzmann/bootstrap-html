import { readFileSync } from "node:fs";

const banners = [
  ["../dist/css/bootstrap-html.css", ["The Bootstrap Authors", "Licensed under MIT"]],
  ["../dist/js/polyfills/interestfor.js", ["Mason Freed", "BSD-3-Clause"]],
];

for (const [file, needles] of banners) {
  const banner = readFileSync(new URL(file, import.meta.url), "utf8").slice(0, 600);
  for (const needle of needles) {
    if (!banner.includes(needle)) {
      console.error(`${file.slice(3)} banner is missing ${JSON.stringify(needle)}`);
      process.exit(1);
    }
  }
}
