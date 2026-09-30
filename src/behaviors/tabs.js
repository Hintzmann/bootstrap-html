/**
 * Headless tab widget. Load it on pages that use <pe-tabs>.
 *
 * Authors write the Bootstrap classes and the ARIA roles. This element
 * only keeps selection in sync. Tabs are [role="tab"] in this element.
 * The pane is the element whose id matches aria-controls. There is no
 * data-bs-toggle and no data-bs-target.
 *
 * One tab stays selected. Click, or arrow keys, chooses another.
 * Horizontal lists use Left and Right. aria-orientation="vertical" on
 * the tablist uses Up and Down. Home and End jump to the ends. The
 * list wraps. Disabled tabs are skipped.
 *
 * .active on the tab and .active / .show on the pane follow the
 * selection, so Bootstrap's tab CSS can show the pane. A pane with
 * .fade loses .show first and waits for the opacity transition.
 *
 * Without this module the .active pane stays visible and nothing switches.
 */

class PeTabs extends HTMLElement {
  #token = 0;
  #timer = 0;
  #wait = null;

  connectedCallback() {
    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
    const tab = this.#current();
    if (!tab) return;
    this.#markTabs(tab);
    this.#markPanels(tab);
  }

  disconnectedCallback() {
    this.#clearWait();
    this.removeEventListener("click", this);
    this.removeEventListener("keydown", this);
  }

  handleEvent(event) {
    if (event.type === "click") this.#onClick(event);
    else this.#onKeydown(event);
  }

  #onClick(event) {
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest("[role=tab]");
    if (!tab || tab.closest("pe-tabs") !== this) return;
    if (tab.tagName === "A") event.preventDefault();
    if (this.#disabled(tab)) return;
    this.#select(tab);
  }

  #onKeydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest("[role=tab]");
    if (!tab || tab.closest("pe-tabs") !== this) return;

    const list = tab.closest("[role=tablist]");
    const vertical = list?.getAttribute("aria-orientation") === "vertical";
    const key = event.key;
    let step = 0;
    if (key === "Home") step = "first";
    else if (key === "End") step = "last";
    else if (!vertical && key === "ArrowRight") step = 1;
    else if (!vertical && key === "ArrowLeft") step = -1;
    else if (vertical && key === "ArrowDown") step = 1;
    else if (vertical && key === "ArrowUp") step = -1;
    else return;

    const all = this.#tabs().filter((el) => el.closest("[role=tablist]") === list);
    const items = all.filter((el) => !this.#disabled(el));
    if (!items.length) return;

    let index = items.indexOf(tab);
    if (index === -1) {
      const at = all.indexOf(tab);
      if (step === "first") index = 0;
      else if (step === "last") index = items.length - 1;
      else if (step === 1) {
        index = items.findIndex((el) => all.indexOf(el) > at);
        if (index === -1) index = 0;
      } else {
        index = items.findLastIndex((el) => all.indexOf(el) < at);
        if (index === -1) index = items.length - 1;
      }
    } else if (step === "first") index = 0;
    else if (step === "last") index = items.length - 1;
    else index = (index + step + items.length) % items.length;

    event.preventDefault();
    items[index].focus();
    this.#select(items[index]);
  }

  #select(next) {
    if (!next || this.#disabled(next)) return;
    const prev = this.#tabs().find((el) => el.getAttribute("aria-selected") === "true");
    if (prev === next) return;

    this.#markTabs(next);
    const outgoing = prev ? this.#panel(prev) : null;
    const ms = this.#fadeMs(outgoing);
    if (!ms) {
      this.#markPanels(next);
      return;
    }

    this.#clearWait();
    const token = ++this.#token;
    const finish = (event) => {
      if (event && (event.target !== outgoing || event.propertyName !== "opacity")) return;
      if (token !== this.#token) return;
      this.#token++;
      this.#clearWait();
      this.#markPanels(next);
    };
    outgoing.addEventListener("transitionend", finish);
    this.#wait = { el: outgoing, fn: finish };
    this.#timer = window.setTimeout(finish, ms + 20);
    outgoing.classList.remove("show");
  }

  #current() {
    const tabs = this.#tabs();
    return (
      tabs.find((el) => el.getAttribute("aria-selected") === "true" && !this.#disabled(el)) ??
      tabs.find((el) => el.classList.contains("active") && !this.#disabled(el)) ??
      tabs.find((el) => !this.#disabled(el)) ??
      null
    );
  }

  #markTabs(next) {
    for (const el of this.#tabs()) {
      const on = el === next;
      el.setAttribute("aria-selected", on ? "true" : "false");
      el.tabIndex = on ? 0 : -1;
      el.classList.toggle("active", on);
    }
  }

  #markPanels(next) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const el of this.#tabs()) {
      const panel = this.#panel(el);
      if (!panel) continue;
      if (el.id) panel.setAttribute("aria-labelledby", el.id);
      if (el !== next) {
        panel.classList.remove("active", "show");
        continue;
      }
      panel.classList.add("active");
      if (reduce || !panel.classList.contains("fade") || panel.classList.contains("show")) {
        panel.classList.add("show");
        continue;
      }
      void panel.offsetWidth;
      panel.classList.add("show");
    }
  }

  #tabs() {
    return [...this.querySelectorAll("[role=tab]")].filter((el) => el.closest("pe-tabs") === this);
  }

  #panel(tab) {
    const id = tab.getAttribute("aria-controls");
    if (!id) return null;
    const panel = this.querySelector(`#${CSS.escape(id)}`);
    return panel && panel.closest("pe-tabs") === this ? panel : null;
  }

  #disabled(el) {
    return el.classList.contains("disabled") || el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
  }

  #fadeMs(panel) {
    if (!panel?.classList.contains("fade")) return 0;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
    if (!panel.classList.contains("show")) return 0;
    const raw = getComputedStyle(panel).transitionDuration.split(",")[0].trim();
    const n = Number.parseFloat(raw);
    if (!n) return 0;
    return raw.endsWith("ms") ? n : n * 1000;
  }

  #clearWait() {
    window.clearTimeout(this.#timer);
    this.#timer = 0;
    this.#wait?.el.removeEventListener("transitionend", this.#wait.fn);
    this.#wait = null;
  }
}

if (!customElements.get("pe-tabs")) {
  customElements.define("pe-tabs", PeTabs);
}
