/**
 * Dismissible alert. Load it on pages that use <pe-alert>.
 *
 * The element is the alert. A close button inside it uses
 * command="--dismiss" and commandfor set to this element's id. commandfor
 * is the id, with no hash. The command event does not bubble, so the
 * listener stays on this element.
 *
 * Dismiss first dispatches a bubbling, cancelable pe-dismiss; calling
 * preventDefault() keeps the alert. Otherwise the element gets hidden and
 * is removed once its finished animations settle. CSS owns any exit
 * transition (for example opacity and display with allow-discrete on
 * [hidden]); this module only waits for it. Infinite animations are not
 * waited for, and a timer removes the node if an animation never settles.
 * A second dismiss while closing does nothing.
 *
 * Without this module the alert stays. Static alerts do not need it.
 * disconnectedCallback drops the timer.
 */

class PeAlert extends HTMLElement {
  #closing = false;
  #timer = 0;

  constructor() {
    super();
    this.addEventListener("command", this);
  }

  disconnectedCallback() {
    clearTimeout(this.#timer);
    this.#timer = 0;
  }

  handleEvent(event) {
    if (event.command === "--dismiss") this.#close();
  }

  #close() {
    if (this.#closing) return;
    const dismiss = new Event("pe-dismiss", { bubbles: true, cancelable: true });
    if (!this.dispatchEvent(dismiss)) return;
    this.#closing = true;
    this.hidden = true;

    const finite = this.getAnimations().filter(
      (animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime),
    );
    if (!finite.length) {
      this.remove();
      return;
    }
    const longest = Math.max(...finite.map((animation) => animation.effect.getComputedTiming().endTime));
    this.#timer = setTimeout(() => this.remove(), longest + 100);
    Promise.allSettled(finite.map((animation) => animation.finished)).then(() => this.remove());
  }
}

if (!customElements.get("pe-alert")) {
  customElements.define("pe-alert", PeAlert);
}
