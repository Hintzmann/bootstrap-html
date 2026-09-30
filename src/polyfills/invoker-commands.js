/**
 * Invoker Commands polyfill (`command` / `commandfor` / CommandEvent).
 *
 * Native support is Baseline Newly available (2025-12). Load only after
 * feature-detecting `'commandForElement' in HTMLButtonElement.prototype`.
 *
 * Built-ins: show-modal, close, request-close, show-picker, toggle/show/hide-
 * popover (plus open/close-popover aliases). Custom `--*` commands only
 * dispatch `command` on the target. The native event does not bubble.
 */

const BUILTIN =
  ' show-modal close request-close show-picker toggle-popover show-popover hide-popover open-popover close-popover ';

let done = false;

if (!done && !('commandForElement' in HTMLButtonElement.prototype)) {
  done = true;

  if (typeof globalThis.CommandEvent !== 'function') {
    class CommandEvent extends Event {
      constructor(type, init = {}) {
        const { source = null, command = '', ...rest } = init;
        super(type, { bubbles: false, cancelable: true, composed: true, ...rest });
        Object.defineProperties(this, {
          source: { get: () => source },
          command: { get: () => String(command) },
        });
      }
    }
    globalThis.CommandEvent = CommandEvent;
  }

  Object.defineProperties(HTMLButtonElement.prototype, {
    commandForElement: {
      configurable: true,
      enumerable: true,
      get() {
        const id = this.getAttribute('commandfor');
        if (!id) return null;
        const root = this.getRootNode();
        return (root.getElementById?.(id) ?? document.getElementById(id));
      },
      set(el) {
        if (el == null) this.removeAttribute('commandfor');
        else this.setAttribute('commandfor', el.id);
      },
    },
    command: {
      configurable: true,
      enumerable: true,
      get() {
        return this.getAttribute('command') ?? '';
      },
      set(v) {
        this.setAttribute('command', v);
      },
    },
  });

  document.addEventListener(
    'click',
    (event) => {
      if (event.defaultPrevented || event.button !== 0) return;

      const button = event.composedPath().find(
        (n) => n instanceof HTMLButtonElement && n.hasAttribute('commandfor'),
      );
      if (!button || button.disabled) return;

      const raw = button.getAttribute('command');
      const lower = raw?.toLowerCase() ?? '';
      const command = !raw
        ? ''
        : raw.startsWith('--')
          ? raw
          : BUILTIN.includes(` ${lower} `)
            ? lower
            : '';
      const target = button.commandForElement;
      if (!command || !target) return;

      const ev = new CommandEvent('command', {
        cancelable: true,
        composed: true,
        command,
        source: button,
      });
      target.dispatchEvent(ev);
      if (ev.defaultPrevented) return;

      if (command === 'show-modal') {
        if (target instanceof HTMLDialogElement && !target.open) target.showModal?.();
      } else if (command === 'close') {
        target.close?.();
      } else if (command === 'request-close') {
        if (!(target instanceof HTMLDialogElement) || !target.open) return;
        if (typeof target.requestClose === 'function') target.requestClose();
        else if (target.dispatchEvent(new Event('cancel', { cancelable: true }))) target.close();
      } else if (command === 'show-picker') {
        try {
          target.showPicker?.();
        } catch {}
      } else if (
        command.endsWith('-popover') &&
        !(
          button.hasAttribute('popovertarget') &&
          'popoverTargetElement' in HTMLButtonElement.prototype
        ) &&
        typeof target.togglePopover === 'function'
      ) {
        try {
          if (command === 'toggle-popover') target.togglePopover();
          else if (command === 'show-popover' || command === 'open-popover') target.showPopover();
          else target.hidePopover();
        } catch {}
      }
    },
    true,
  );
}
