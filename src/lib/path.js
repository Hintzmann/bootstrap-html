/** Prefix a site path with Astro's `base` (for GitHub project pages). */
export function sitePath(path, base = import.meta.env.BASE_URL) {
  const root = String(base ?? "/").replace(/\/?$/, "/");
  if (path === "/" || path === "") return root;
  const hashAt = path.indexOf("#");
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const pathname = (hashAt >= 0 ? path.slice(0, hashAt) : path).replace(/^\//, "");
  return `${root}${pathname}${hash}`;
}

/**
 * A module under src/polyfills or src/behaviors as a plain URL, so Vite
 * does not bundle it. `npm run build` writes the minified copy to dist/js/
 * after `astro build`; the dev server serves the source.
 */
export function jsPath(file, dev = import.meta.env.DEV, base = import.meta.env.BASE_URL) {
  return sitePath(`${dev ? "/src/" : "/js/"}${file}`, base);
}

export function polyfillLoaderPath(dev = import.meta.env.DEV, base = import.meta.env.BASE_URL) {
  return jsPath("polyfills/index.js", dev, base);
}

export function behaviorPath(name, dev = import.meta.env.DEV, base = import.meta.env.BASE_URL) {
  return jsPath(`behaviors/${name}.js`, dev, base);
}

export function isCurrent(pathname, path, base) {
  const strip = (value) => (value.length > 1 ? value.replace(/\/$/, "") : value);
  return strip(pathname) === strip(sitePath(path, base));
}
