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
  return root.matches?.(selector) || root.querySelector(selector);
}

export async function loadPolyfills(root = document) {
  await Promise.all([
    !('commandForElement' in HTMLButtonElement.prototype) &&
      uses(root, '[commandfor]') &&
      import('./invoker-commands.js'),
    !('closedBy' in HTMLDialogElement.prototype) &&
      uses(root, 'dialog[closedby]') &&
      import('./dialog-closedby.js'),
    !CSS.supports('scroll-target-group: auto') &&
      uses(root, '[data-polyfill-scrollspy]') &&
      import('./scroll-target-group.js'),
    !Object.hasOwn(HTMLButtonElement.prototype, 'interestForElement') &&
      uses(root, '[interestfor]') &&
      import('./interestfor.js'),
  ]);
}

await loadPolyfills();
