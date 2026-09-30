/**
 * Optional autohide and stacking for a toast.
 *
 * Show and hide stay on popover="manual" and command/commandfor. Load
 * this module only when a toast should dismiss itself or share a corner
 * with siblings. Without it, one toast still sits in the container corner
 * until it is closed.
 *
 * data-delay is milliseconds. Omit it, or set 0, and the toast stays
 * open. Pointer hover and keyboard focus clear the timer and start a
 * new full delay when both have left.
 *
 * The element is the toast. Add class="toast". On open, open toasts in the
 * same .toast-container are offset from the container corner: this element
 * sets --pe-toast-index (how many open toasts come before this one) and
 * --pe-toast-stack (the sum of their heights). CSS adds one
 * --bs-toast-spacing per toast, so no length is resolved here.
 *
 * offsetHeight is the one measurement this module takes. Toasts have
 * different heights, and top-layer siblings do not share a layout box, so
 * there is no CSS-only way to stack them. Toasts of equal height need no
 * script: see the translate pattern on the Toasts docs page.
 *
 * --pe-toast-delay is this delay as a CSS time. The countdown bar in
 * _toast.scss reads it; there is no CSS path from a data-delay attribute
 * to animation-duration.
 */

class PeToast extends HTMLElement {
  #timer = 0;

  connectedCallback() {
    this.addEventListener("toggle", this);
    this.addEventListener("pointerenter", this);
    this.addEventListener("pointerleave", this);
    this.addEventListener("focusin", this);
    this.addEventListener("focusout", this);
  }

  disconnectedCallback() {
    this.#clear();
    this.removeEventListener("toggle", this);
    this.removeEventListener("pointerenter", this);
    this.removeEventListener("pointerleave", this);
    this.removeEventListener("focusin", this);
    this.removeEventListener("focusout", this);
  }

  handleEvent(event) {
    if (event.type === "toggle") {
      if (event.newState === "open") this.#arm();
      else this.#clear();
      requestAnimationFrame(() => this.#stack());
      return;
    }
    if (!this.matches(":popover-open")) return;
    if (event.type === "pointerenter" || event.type === "focusin") {
      this.#clear();
      return;
    }
    if (event.type === "pointerleave" || event.type === "focusout") {
      queueMicrotask(() => {
        if (!this.matches(":popover-open")) return;
        if (this.matches(":hover") || this.matches(":focus-within")) return;
        this.#arm();
      });
    }
  }

  #delay() {
    const value = Number(this.getAttribute("data-delay"));
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  #arm() {
    this.#clear();
    const delay = this.#delay();
    if (!delay || !this.matches(":popover-open")) {
      this.style.removeProperty("--pe-toast-delay");
      return;
    }
    this.style.setProperty("--pe-toast-delay", `${delay}ms`);
    this.#timer = window.setTimeout(() => {
      if (this.matches(":popover-open")) this.hidePopover();
    }, delay);
  }

  #clear() {
    window.clearTimeout(this.#timer);
    this.#timer = 0;
  }

  #stack() {
    const container = this.closest(".toast-container");
    if (!container) return;
    let index = 0;
    let stack = 0;
    for (const el of container.querySelectorAll(".toast")) {
      if (!el.matches(":popover-open")) {
        el.style.removeProperty("--pe-toast-index");
        el.style.removeProperty("--pe-toast-stack");
        continue;
      }
      el.style.setProperty("--pe-toast-index", String(index));
      el.style.setProperty("--pe-toast-stack", `${stack}px`);
      stack += el.offsetHeight;
      index += 1;
    }
  }
}

if (!customElements.get("pe-toast")) {
  customElements.define("pe-toast", PeToast);
}
