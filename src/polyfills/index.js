/**
 * Site-wide polyfill loader.
 *
 * Feature-detect each API and dynamic-import only the missing modules, and
 * only when the current document actually uses that API. Browsers with full
 * support download this file and make a few cheap checks — no extra chunks,
 * no listeners. Import this module once from the document (Safari: do not
 * import a top-level-await module from multiple sibling scripts at once).
 */

const polyfills = [];

if (
  !('commandForElement' in HTMLButtonElement.prototype) &&
  document.querySelector('[commandfor]')
) {
  polyfills.push(import('./invoker-commands.js'));
}

if (
  !('closedBy' in HTMLDialogElement.prototype) &&
  document.querySelector('dialog[closedby]')
) {
  polyfills.push(import('./dialog-closedby.js'));
}

if (
  (typeof CSS === 'undefined' || !CSS.supports('scroll-target-group: auto')) &&
  document.querySelector('[data-polyfill-scrollspy]')
) {
  polyfills.push(import('./scroll-target-group.js'));
}

if (
  !Object.prototype.hasOwnProperty.call(
    HTMLButtonElement.prototype,
    'interestForElement',
  ) &&
  document.querySelector('[interestfor]')
) {
  polyfills.push(import('./interestfor.js'));
}

await Promise.all(polyfills);
