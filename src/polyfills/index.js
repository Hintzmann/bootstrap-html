/**
 * Site-wide polyfill loader.
 *
 * Feature-detect each API and dynamic-import only the missing modules, and
 * only when the current document actually uses that API. Browsers with full
 * support download this file and make a few cheap checks — no extra chunks,
 * no listeners. Import this module once from the document (Safari: do not
 * import a top-level-await module from multiple sibling scripts at once).
 *
 * Importing it checks the document once. A client-side router also calls
 * the exported loadPolyfills(root) after each render, because markup added
 * later was not there for that first check. import() caches each fallback,
 * so a second call does not reload one that is already in place.
 */

function uses(root, selector) {
  return Boolean(root.matches?.(selector) || root.querySelector(selector));
}

export async function loadPolyfills(root = document) {
  const polyfills = [];

  if (!('commandForElement' in HTMLButtonElement.prototype) && uses(root, '[commandfor]')) {
    polyfills.push(import('./invoker-commands.js'));
  }

  if (!('closedBy' in HTMLDialogElement.prototype) && uses(root, 'dialog[closedby]')) {
    polyfills.push(import('./dialog-closedby.js'));
  }

  if (
    (typeof CSS === 'undefined' || !CSS.supports('scroll-target-group: auto')) &&
    uses(root, '[data-polyfill-scrollspy]')
  ) {
    polyfills.push(import('./scroll-target-group.js'));
  }

  if (
    !Object.prototype.hasOwnProperty.call(HTMLButtonElement.prototype, 'interestForElement') &&
    uses(root, '[interestfor]')
  ) {
    polyfills.push(import('./interestfor.js'));
  }

  await Promise.all(polyfills);
}

await loadPolyfills();
