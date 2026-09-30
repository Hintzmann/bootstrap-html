/**
 * `scroll-target-group` polyfill (visual `:target-current` via IntersectionObserver).
 *
 * Load only when `CSS.supports('scroll-target-group: auto')` is false.
 * Observes `[data-polyfill-scrollspy]` hosts and toggles a class named
 * `:target-current` on matching fragment links. Style with
 * `:is(:target-current, .\:target-current)`.
 *
 * Optional attribute value is a scroller selector; empty uses the overflow
 * ancestor of the first target.
 */

const CLASS = ':target-current';
const SEL = '[data-polyfill-scrollspy]';
const observed = new WeakMap();

if (!(typeof CSS === 'object' && CSS.supports?.('scroll-target-group: auto'))) {
  scan();
  new MutationObserver(scan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function scan() {
  const hosts = [...document.querySelectorAll(SEL)];
  for (const host of hosts) {
    if (hosts.some((o) => o !== host && o.contains(host))) continue;
    observe(host);
  }
}

function observe(host) {
  if (observed.has(host) || typeof IntersectionObserver !== 'function') return;

  const links = [...host.querySelectorAll('a')].filter(hrefId);
  const scroller = resolveScroller(host, links);
  const sections = links.map((l) => sectionFor(l, scroller)).filter(Boolean);
  if (!links.length || !sections.length) return;

  const root = isDoc(scroller) ? null : scroller;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        for (const link of links) link.classList.toggle(CLASS, hrefId(link) === id);
        host.dispatchEvent(new Event('scrolltargetchange', { bubbles: true }));
      }
    },
    { root, rootMargin: '0px 0px -40% 0px', threshold: 0 },
  );

  for (const s of sections) observer.observe(s);
  observed.set(host, observer);
}

function resolveScroller(host, links) {
  const selector = host.getAttribute('data-polyfill-scrollspy')?.trim();
  if (selector) {
    const found =
      (selector.startsWith('#') && document.getElementById(selector.slice(1))) ||
      host.querySelector(selector) ||
      document.querySelector(selector);
    if (found) return found;
  }
  for (const link of links) {
    const overflow = overflowAncestor(sectionFor(link, null));
    if (overflow) return overflow;
  }
  return document.scrollingElement ?? document.documentElement;
}

function overflowAncestor(el) {
  for (let n = el?.parentElement; n; n = n.parentElement) {
    const { overflowY: y, overflow: o } = getComputedStyle(n);
    if (y === 'auto' || y === 'scroll' || y === 'overlay' || o === 'auto' || o === 'scroll' || o === 'overlay')
      return n;
  }
  return null;
}

function hrefId(link) {
  const href = link.getAttribute('href') ?? '';
  return href.startsWith('#') ? href.slice(1) : '';
}

function sectionFor(link, scroller) {
  const id = hrefId(link);
  if (!id) return null;
  const esc = CSS.escape?.(id) ?? id.replace(/([^\w-])/g, '\\$1');
  return scroller?.querySelector(`#${esc}`) ?? document.getElementById(id);
}

function isDoc(s) {
  return (
    !s ||
    s === document ||
    s === document.documentElement ||
    s === document.body ||
    s === document.scrollingElement
  );
}
