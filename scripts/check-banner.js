import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../dist/css/bootstrap-html.css", import.meta.url), "utf8");
const banner = css.slice(0, 600);

for (const needle of ["The Bootstrap Authors", "Licensed under MIT"]) {
  if (!banner.includes(needle)) {
    console.error(`CSS banner is missing ${JSON.stringify(needle)}`);
    process.exit(1);
  }
}
