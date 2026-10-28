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
  constructor() {
    super();
    this.addEventListener("click", this);
    this.addEventListener("keydown", this);
    this.addEventListener("beforematch", this, true);
  }

  connectedCallback() {
    const tab = this.#current();
    if (tab) this.#apply(tab);
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
    const tab = this.#ownTab(event.target);
    if (!tab) return;
    if (tab.tagName === "A") event.preventDefault();
    this.#select(tab);
  }

  #onKeydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const tab = this.#ownTab(event.target);
    if (!tab) return;

    const list = tab.closest("[role=tablist]");
    const vertical = list?.getAttribute("aria-orientation") === "vertical";
    const key = event.key;
    const step = {
      Home: 1,
      End: -1,
      [vertical ? "ArrowDown" : "ArrowRight"]: 1,
      [vertical ? "ArrowUp" : "ArrowLeft"]: -1,
    }[key];
    if (!step) return;

    const all = this.#tabs().filter((el) => el.closest("[role=tablist]") === list);
    if (all.every((el) => this.#disabled(el))) return;

    // Home and End start one past the far end, so a disabled end tab is skipped too.
    let index = key === "Home" ? -1 : key === "End" ? all.length : all.indexOf(tab);
    do index = (index + step + all.length) % all.length;
    while (this.#disabled(all[index]));

    event.preventDefault();
    all[index].focus();
    this.#select(all[index]);
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
      el.setAttribute("aria-selected", String(on));
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

  #ownTab(target) {
    const tab = target instanceof Element ? target.closest("[role=tab]") : null;
    return tab?.closest("pe-tabs") === this ? tab : null;
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
