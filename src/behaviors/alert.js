/**
 * Dismissible alert. Load it on pages that use <pe-alert>.
 *
 * The element is the alert. Add class="alert". A close button inside it
 * uses command="--dismiss" and commandfor set to this element's id.
 * commandfor is the id, with no hash. The command event does not bubble,
 * so the listener stays on this element.
 *
 * Without .fade the node is removed at once. With .fade, .show is removed
 * first and the node goes after the opacity transition. prefers-reduced-motion
 * skips the wait.
 *
 * Without this module the alert stays. Static alerts do not need it.
 * disconnectedCallback drops the command listener, the transition listener,
 * and the fallback timer.
 */

class PeAlert extends HTMLElement {
  #timer = 0;
  #onEnd = null;

  connectedCallback() {
    this.addEventListener("command", this);
  }

  disconnectedCallback() {
    this.removeEventListener("command", this);
    this.#clear();
  }

  handleEvent(event) {
    if (event.type !== "command" || event.command !== "--dismiss") return;
    this.#close();
  }

  #close() {
    const ms = this.#fadeMs();
    if (!ms) {
      this.remove();
      return;
    }
    this.#clear();
    this.#onEnd = (event) => {
      if (event.target !== this || event.propertyName !== "opacity") return;
      this.remove();
    };
    this.addEventListener("transitionend", this.#onEnd);
    this.#timer = window.setTimeout(() => this.remove(), ms + 20);
    this.classList.remove("show");
  }

  #fadeMs() {
    if (!this.classList.contains("fade") || !this.classList.contains("show")) return 0;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
    const raw = getComputedStyle(this).transitionDuration.split(",")[0].trim();
    const n = Number.parseFloat(raw);
    if (!n) return 0;
    return raw.endsWith("ms") ? n : n * 1000;
  }

  #clear() {
    window.clearTimeout(this.#timer);
    this.#timer = 0;
    if (!this.#onEnd) return;
    this.removeEventListener("transitionend", this.#onEnd);
    this.#onEnd = null;
  }
}

if (!customElements.get("pe-alert")) {
  customElements.define("pe-alert", PeAlert);
}
