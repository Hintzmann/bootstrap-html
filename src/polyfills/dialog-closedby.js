/**
 * `<dialog closedby>` polyfill (`closedBy` + light-dismiss).
 *
 * Load only after feature-detecting `'closedBy' in HTMLDialogElement.prototype`.
 *
 * - `any`: backdrop click requests close (cancel, then close).
 * - `none`: Esc / close-request is cancelled.
 * - `closerequest` and missing Auto already match native modal Esc.
 */

const KNOWN = new Set(['any', 'closerequest', 'none']);

let done = false;

if (!done && !('closedBy' in HTMLDialogElement.prototype)) {
  done = true;

  Object.defineProperty(HTMLDialogElement.prototype, 'closedBy', {
    configurable: true,
    enumerable: true,
    get() {
      const v = (this.getAttribute('closedby') ?? '').trim().toLowerCase();
      return KNOWN.has(v) ? v : '';
    },
    set(v) {
      if (v == null || v === '') this.removeAttribute('closedby');
      else this.setAttribute('closedby', String(v));
    },
  });

  document.addEventListener(
    'click',
    (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const dialog = event.target;
      if (!(dialog instanceof HTMLDialogElement) || !dialog.open || dialog.closedBy !== 'any')
        return;

      const r = dialog.getBoundingClientRect();
      if (
        r.top <= event.clientY &&
        event.clientY <= r.bottom &&
        r.left <= event.clientX &&
        event.clientX <= r.right
      )
        return;

      if (typeof dialog.requestClose === 'function') dialog.requestClose();
      else if (dialog.dispatchEvent(new Event('cancel', { cancelable: true })) && dialog.open)
        dialog.close();
    },
    true,
  );

  document.addEventListener(
    'cancel',
    (event) => {
      const dialog = event.target;
      if (dialog instanceof HTMLDialogElement && dialog.closedBy === 'none') event.preventDefault();
    },
    true,
  );
}
