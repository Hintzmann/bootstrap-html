import { readFileSync, writeFileSync } from "node:fs";
import { components } from "../src/data/components.js";
import { contractHash, hashVersion } from "../src/lib/hash.js";

// Records every component's contract hash at the current package version.
// Run after adding the `changes` entry that explains a new hash.
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const snapshot = {
  version: packageJson.version,
  hashVersion,
  hashes: Object.fromEntries(components.map((item) => [item.id, contractHash(item)])),
};

writeFileSync(new URL("../src/data/contract-hashes.json", import.meta.url), `${JSON.stringify(snapshot, null, 2)}\n`);
