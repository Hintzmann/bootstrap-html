/**
 * Invoker Commands polyfill (`command` / `commandfor` / CommandEvent).
 *
 * Native support is Baseline Newly available (2025-12). Load only after
 * feature-detecting `'commandForElement' in HTMLButtonElement.prototype`.
 *
 * Built-ins: show-modal, close, request-close, toggle-popover, show-popover,
 * hide-popover. `close` and `request-close` pass the button's `value` to the
 * dialog's `returnValue`. Custom `--*` commands only dispatch `command` on
 * the target. The native event does not bubble.
 */

const BUILTIN = /^(show-modal|close|request-close|(toggle|show|hide)-popover)$/;

if (!('commandForElement' in HTMLButtonElement.prototype)) {
  globalThis.CommandEvent ??= class CommandEvent extends Event {
    #source;
    #command;

    constructor(type, { source = null, command = '', ...init } = {}) {
      super(type, init);
      this.#source = source;
      this.#command = String(command);
    }

    get source() {
      return this.#source;
    }

    get command() {
      return this.#command;
    }
  };

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

      const raw = button.getAttribute('command') ?? '';
      const lower = raw.toLowerCase();
      const command = raw.startsWith('--') ? raw : BUILTIN.test(lower) ? lower : '';
      const target = button.commandForElement;
      if (!command || !target) return;

      const ev = new CommandEvent('command', {
        cancelable: true,
        composed: true,
        command,
        source: button,
      });
      if (!target.dispatchEvent(ev)) return;

      const dialog = target instanceof HTMLDialogElement ? target : null;
      const value = button.getAttribute('value') ?? undefined;

      switch (command) {
        case 'show-modal':
          if (dialog && !dialog.open) dialog.showModal();
          break;
        case 'close':
          dialog?.close(value);
          break;
        case 'request-close':
          if (!dialog?.open) break;
          if (typeof dialog.requestClose === 'function') dialog.requestClose(value);
          else if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) dialog.close(value);
          break;
        case 'toggle-popover':
        case 'show-popover':
        case 'hide-popover':
          if (typeof target.togglePopover !== 'function' || button.hasAttribute('popovertarget')) break;
          try {
            if (command === 'toggle-popover') target.togglePopover();
            else if (command === 'show-popover') target.showPopover();
            else target.hidePopover();
          } catch {}
      }
    },
    true,
  );
}
