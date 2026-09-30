/** Prefix a site path with Astro's `base` (for GitHub project pages). */
export function sitePath(path) {
  const base = import.meta.env.BASE_URL;
  if (path === "/" || path === "") return base;
  const hashAt = path.indexOf("#");
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const pathname = (hashAt >= 0 ? path.slice(0, hashAt) : path).replace(/^\//, "");
  return `${base}${pathname}${hash}`;
}

export function isCurrent(pathname, path) {
  const strip = (value) => (value.length > 1 ? value.replace(/\/$/, "") : value);
  return strip(pathname) === strip(sitePath(path));
}
