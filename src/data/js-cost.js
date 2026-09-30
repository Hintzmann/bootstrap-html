/**
 * Minified gzip sizes for Bootstrap 5.3.8 and this repo's polyfills.
 *
 * Plugins: esbuild bundle of node_modules/bootstrap/js/dist/<name>.js
 * (minify, legalComments: none), then gzip. Each figure includes the
 * modules that plugin imports, so Popper is inside dropdown, tooltip,
 * and popover. Those runtimes overlap. The published whole file is
 * bootstrap.bundle.min.js at bundleGzipKb.
 *
 * Polyfills: esbuild minify of src/polyfills (bundle: false), then gzip.
 *
 * Per-component data lives in ./components.js.
 */

export const bundleGzipKb = 23.3;

/** `anchor` is the heading id for this polyfill on /polyfills. */
export const polyfills = [
  {
    id: "loader",
    file: "index.js",
    kb: 0.3,
    anchor: "",
    when: "Always. A browser that already has the APIs stops here.",
  },
  {
    id: "invoker",
    file: "invoker-commands.js",
    kb: 0.8,
    anchor: "invoker-commands",
    when: "commandForElement is missing and the page has [commandfor].",
  },
  {
    id: "closedby",
    file: "dialog-closedby.js",
    kb: 0.5,
    anchor: "closedby",
    when: "closedBy is missing and the page has dialog[closedby].",
  },
  {
    id: "scrollspy",
    file: "scroll-target-group.js",
    kb: 0.8,
    anchor: "scroll-target-group",
    when: "scroll-target-group is missing and the page has [data-polyfill-scrollspy].",
  },
  {
    id: "interestfor",
    file: "interestfor.js",
    kb: 2.8,
    anchor: "interestfor",
    when: "interestForElement is missing and the page has [interestfor].",
  },
];

export const polyfillById = Object.fromEntries(polyfills.map((item) => [item.id, item]));
