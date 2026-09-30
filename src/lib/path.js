/** Prefix a site path with Astro's `base` (for GitHub project pages). */
export function sitePath(path, base = import.meta.env.BASE_URL) {
  const root = String(base ?? "/").replace(/\/?$/, "/");
  if (path === "/" || path === "") return root;
  const hashAt = path.indexOf("#");
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const pathname = (hashAt >= 0 ? path.slice(0, hashAt) : path).replace(/^\//, "");
  return `${root}${pathname}${hash}`;
}

export function isCurrent(pathname, path, base) {
  const strip = (value) => (value.length > 1 ? value.replace(/\/$/, "") : value);
  return strip(pathname) === strip(sitePath(path, base));
}
