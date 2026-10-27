/**
 * Headless tab widget. Load it on pages that use <pe-tabs>.
 *
 * Tabs are [role="tab"] in this element. The panel is the element whose id
 * matches aria-controls. State is ARIA and the hidden attribute, nothing
 * else: the selected tab has aria-selected="true" and tabindex="0", the
 * others aria-selected="false" and tabindex="-1". Every other panel has
 * hidden="until-found", so Find in page can still reach its text; the
 * beforematch event selects that panel's tab without moving focus.
 * Styling reads those attributes. There is no class to toggle, no
 * data-bs-toggle, and no data-bs-target.
 *
 * Write the start state in the markup, so the page is right before this
 * module runs. On connect the first enabled tab with aria-selected="true"
 * wins; with none, the first enabled tab.
 *
 * One tab stays selected. Click, or arrow keys, chooses another.
 * Horizontal lists use Left and Right. aria-orientation="vertical" on
 * the tablist uses Up and Down. Home and End jump to the ends. The
 * list wraps. Disabled tabs are skipped.
 *
 * <pe-tabs> owns the selection. select(tabOrId) changes it from script.
 * Each change dispatches a bubbling pe-tab-change with { tab, panel }.
 * A framework renders the start state and calls select() after that,
 * rather than re-rendering aria-selected.
 *
 * Without this module nothing switches; the panel without hidden stays.
 */

class PeTabs extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
    this.addEventListener("beforematch", this, true);
    const tab = this.#current();
    if (tab) this.#apply(tab);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this);
    this.removeEventListener("keydown", this);
    this.removeEventListener("beforematch", this, true);
  }

  handleEvent(event) {
    if (event.type === "click") this.#onClick(event);
    else if (event.type === "keydown") this.#onKeydown(event);
    else this.#onBeforeMatch(event);
  }

  /** Select a tab element, or the tab with that id. */
  select(tabOrId) {
    const tab = typeof tabOrId === "string" ? this.#tabs().find((el) => el.id === tabOrId) : tabOrId;
    if (!tab || !this.#tabs().includes(tab)) return;
    this.#select(tab);
  }

  #onClick(event) {
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest("[role=tab]");
    if (!tab || tab.closest("pe-tabs") !== this) return;
    if (tab.tagName === "A") event.preventDefault();
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

  // The browser removes hidden from the panel right after this event.
  #onBeforeMatch(event) {
    if (!(event.target instanceof Element)) return;
    const tab = this.#tabs().find((el) => {
      const panel = this.#panel(el);
      return panel && panel.contains(event.target);
    });
    if (tab) this.#select(tab);
  }

  #select(next) {
    if (!next || this.#disabled(next)) return;
    const prev = this.#tabs().find((el) => el.getAttribute("aria-selected") === "true");
    if (prev === next && this.#panel(next)?.hidden === false) return;
    this.#apply(next);
    this.dispatchEvent(
      new CustomEvent("pe-tab-change", {
        bubbles: true,
        detail: { tab: next, panel: this.#panel(next) },
      }),
    );
  }

  #apply(next) {
    for (const el of this.#tabs()) {
      const on = el === next;
      el.setAttribute("aria-selected", on ? "true" : "false");
      el.tabIndex = on ? 0 : -1;
      const panel = this.#panel(el);
      if (!panel) continue;
      if (el.id) panel.setAttribute("aria-labelledby", el.id);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "until-found");
    }
  }

  #current() {
    const tabs = this.#tabs().filter((el) => !this.#disabled(el));
    return tabs.find((el) => el.getAttribute("aria-selected") === "true") ?? tabs[0] ?? null;
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
    return el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
  }
}

if (!customElements.get("pe-tabs")) {
  customElements.define("pe-tabs", PeTabs);
}
