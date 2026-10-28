import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { transform } from "esbuild";

// One file in, one file out: no bundling, so the polyfill loader's relative
// import('./x.js') still fetches each fallback on demand, and a page loads
// only the behaviors it names. No source maps: each output maps 1:1 to the
// readable file in src/, and a sourceMappingURL line would cost bytes on
// every page.
for (const folder of ["polyfills", "behaviors"]) {
  const src = new URL(`../src/${folder}/`, import.meta.url);
  const out = new URL(`../dist/js/${folder}/`, import.meta.url);

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  for (const file of readdirSync(src).filter((name) => name.endsWith(".js"))) {
    const { code } = await transform(readFileSync(new URL(file, src), "utf8"), {
      loader: "js",
      format: "esm",
      target: "esnext",
      minify: true,
      legalComments: "inline",
    });
    writeFileSync(new URL(file, out), code);
  }
}
