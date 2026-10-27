import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { components } from "../src/data/components.js";
import { buildContract, manifestFile } from "../src/lib/contract.js";
import { canonicalJson, contractHash, hashInput, hashVersion } from "../src/lib/hash.js";
import { buildLlmsFull } from "../src/lib/llms.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const packageJson = readJson("package.json");
const snapshot = readJson("src/data/contract-hashes.json");

const semver = /^(\d+)\.(\d+)\.(\d+)$/;
const newer = (a, b) => {
  const [x, y] = [a, b].map((version) => semver.exec(version).slice(1).map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

describe("contract hashes", () => {
  it("snapshot covers every component at the current hashVersion", () => {
    expect(snapshot.hashVersion).toBe(hashVersion);
    expect(Object.keys(snapshot.hashes).sort()).toEqual(components.map((item) => item.id).sort());
  });

  it("a changed hash comes with a change newer than the snapshot", () => {
    for (const item of components) {
      if (contractHash(item) === snapshot.hashes[item.id]) continue;
      const explained = (item.changes ?? []).some((change) => newer(change.sinceVersion, snapshot.version));
      expect(
        explained,
        `${item.id}: hash changed without a change newer than ${snapshot.version}; add one to components.js, then npm run contract:hashes after the release`,
      ).toBe(true);
    }
  });

  it("is deterministic and ignores line endings and key order", () => {
    for (const item of components) {
      expect(contractHash(item)).toMatch(/^sha256-[0-9a-f]{16}$/);
      expect(contractHash(item)).toBe(contractHash(item));
    }
    const input = hashInput(components[0]);
    expect(canonicalJson({ b: "x\r\ny", a: 1 })).toBe(canonicalJson({ a: 1, b: "x\ny" }));
    expect(canonicalJson(input)).not.toContain("\\r\\n");
  });

  it("differs between components", () => {
    const hashes = components.map(contractHash);
    expect(new Set(hashes).size).toBe(hashes.length);
  });
});

describe("changes", () => {
  it("follow the schema", () => {
    for (const item of components) {
      for (const change of item.changes ?? []) {
        expect(["fix", "feature", "breaking"], item.id).toContain(change.type);
        expect(change.sinceVersion, item.id).toMatch(semver);
        expect(change.note, item.id).toMatch(/\.$/);
        if (change.type === "breaking") expect(change.migration, `${item.id} breaking needs a migration`).toBeTruthy();
      }
    }
  });
});

describe("manifest protocol", () => {
  const contract = buildContract(packageJson);

  it("ships hash, changes, hashVersion, and the manifest rule", () => {
    expect(contract.hashVersion).toBe(hashVersion);
    expect(contract.manifest.file).toBe(manifestFile);
    expect(contract.manifest.rule).toContain("Never overwrite local files without asking");
    expect(contract.manifest.example.contract).toBe(`${packageJson.name}@${packageJson.version}`);
    for (const component of contract.components) {
      const item = components.find((entry) => entry.id === component.id);
      expect(component.hash).toBe(contractHash(item));
      expect(component.changes).toEqual(item.changes ?? []);
    }
  });

  it("llms-full names id, hash, version, and changes per component", () => {
    const text = buildLlmsFull({ packageJson, site: "https://example.org", base: "/bootstrap-html/" });
    expect(text).toContain(manifestFile);
    for (const item of components) {
      expect(text, item.id).toContain(
        `### ${item.name} · id \`${item.id}\` · hash \`${contractHash(item)}\` · version ${packageJson.version}\n`,
      );
      for (const change of item.changes ?? []) expect(text, item.id).toContain(`- ${change.sinceVersion} ${change.type}: ${change.note}`);
    }
  });
});
