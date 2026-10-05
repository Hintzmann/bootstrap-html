import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { buildContract } from "../src/lib/contract.js";
import { buildLlmsFull } from "../src/lib/llms.js";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const home = new URL(packageJson.homepage);
const dist = new URL("../dist/", import.meta.url);

mkdirSync(dist, { recursive: true });
writeFileSync(new URL("components.json", dist), `${JSON.stringify(buildContract(packageJson), null, 2)}\n`);
writeFileSync(
  new URL("llms-full.txt", dist),
  buildLlmsFull({ packageJson, site: home.origin, base: home.pathname }),
);
