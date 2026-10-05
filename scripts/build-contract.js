import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { buildContract } from "../src/lib/contract.js";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const out = new URL("../dist/components.json", import.meta.url);

mkdirSync(new URL(".", out), { recursive: true });
writeFileSync(out, `${JSON.stringify(buildContract(packageJson), null, 2)}\n`);
