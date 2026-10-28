/**
 * `scroll-target-group` polyfill (visual `:target-current`).
 *
 * Load only when `CSS.supports('scroll-target-group: auto')` is false.
 * Observes `[data-polyfill-scrollspy]` hosts and toggles a class named
 * `:target-current` on matching fragment links. Style with
 * `:is(:target-current, .\:target-current)`.
 *
 * Optional attribute value is a scroller selector; empty uses the overflow
 * ancestor of the first target.
 *
 * Reads scroll geometry on scroll and resize (never writes it): without
 * scroll markers the platform has no way to ask which target is current,
 * and IntersectionObserver cannot see a target's offset from the scroll
 * position or the end of the scroll range. The choice follows Chromium's
 * scroll marker chooser on the block axis: targets beyond either end of the
 * range are packed into the outer eighth of the scrollport, then the last
 * target at or before the scroll position wins, unless a target less than
 * half a scrollport ahead is closer.
 */

const CLASS = ':target-current';
const SEL = '[data-polyfill-scrollspy]';
const observed = new WeakSet();

if (!CSS.supports('scroll-target-group: auto')) {
  scan();
  new MutationObserver(scan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function scan() {
  for (const host of document.querySelectorAll(SEL)) {
    if (!host.parentElement?.closest(SEL)) observe(host);
  }
}

function observe(host) {
  if (observed.has(host)) return;

  const links = [...host.querySelectorAll('a')].filter(hrefId);
  const scroller = resolveScroller(host, links);
  const targets = links.map((l) => sectionFor(l, scroller));
  if (!targets.some(Boolean)) return;

  const doc = isDoc(scroller);
  const update = () => {
    const current = links[chooseTarget(doc ? document.scrollingElement : scroller, doc, targets)];
    for (const link of links) link.classList.toggle(CLASS, link === current);
  };
  (doc ? window : scroller).addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  new ResizeObserver(update).observe(doc ? document.body : scroller);
  observed.add(host);
}

/** Index of the current target; `targets` holds `null` for a link without one. */
function chooseTarget(el, doc, targets) {
  const pos = el.scrollTop;
  const view = el.clientHeight;
  const range = el.scrollHeight - view;
  if (range <= 0) return targets.findLastIndex(Boolean);

  const offset = pos - (doc ? 0 : el.getBoundingClientRect().top + el.clientTop) - px(el, 'scrollPaddingTop');
  const raw = targets.map((t) => (t ? t.getBoundingClientRect().top + offset - px(t, 'scrollMarginTop') : NaN));
  const known = raw.filter((x) => !isNaN(x));
  const low = Math.min(...known);
  const high = Math.max(...known);
  const edge = view / 8;
  const end = range - edge;
  const at = raw.map((x) =>
    x < edge ? ((x - low) / (edge - low)) * edge : x > end ? ((x - end) / (high - end)) * edge + end : x,
  );

  let before = raw.indexOf(low);
  let after = -1;
  at.forEach((x, i) => {
    if (x <= pos) {
      if (x >= at[before]) before = i;
    } else if (x < pos + view / 2 && (after < 0 || x <= at[after])) after = i;
  });
  return after >= 0 && at[after] - pos < pos - at[before] ? after : before;
}

function px(el, property) {
  return parseFloat(getComputedStyle(el)[property]) || 0;
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
    if (/^(auto|scroll|overlay)$/.test(getComputedStyle(n).overflowY)) return n;
  }
}

function hrefId(link) {
  const href = link.getAttribute('href') ?? '';
  return href.startsWith('#') ? href.slice(1) : '';
}

function sectionFor(link, scroller) {
  const id = hrefId(link);
  if (!id) return null;
  return scroller?.querySelector(`#${CSS.escape(id)}`) ?? document.getElementById(id);
}

function isDoc(s) {
  return s === document.documentElement || s === document.body;
}
