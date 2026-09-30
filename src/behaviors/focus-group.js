/**
 * Optional roving focus for a group of items.
 *
 * Not a polyfill: the platform has no API for this, and the group still
 * works with Tab when this module is absent. Load it only on pages that
 * opt in with <pe-focus-group>.
 *
 * ArrowUp / ArrowLeft move to the previous item. ArrowDown / ArrowRight
 * move to the next. Home and End move to the ends. The list wraps.
 * Set orientation="vertical" or orientation="horizontal" to ignore the
 * other axis. The default is both.
 *
 * items is a selector for the focusable descendants. It defaults to
 * .dropdown-item, skipping .disabled and aria-disabled="true".
 *
 * When focus is on the trigger and this group's own [popover] is closed,
 * the arrow keys call showPopover() before moving focus. Text fields
 * keep their own arrow keys.
 *
 * A nested <pe-focus-group> owns the keys for its own items. This group
 * ignores keys from inside another panel, such as a summary's body, so
 * a dropdown there is quiet unless it has its own focus group.
 */

const DEFAULT_ITEMS = ".dropdown-item:not(.disabled, [aria-disabled='true'])";

class PeFocusGroup extends HTMLElement {
  connectedCallback() {
    this.addEventListener("keydown", this);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this);
  }

  handleEvent(event) {
    if (event.type === "keydown") this.#onKeydown(event);
  }

  #onKeydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (this.#inTextField(event.target)) return;

    const direction = this.#direction(event.key);
    if (!direction) return;

    if (!(event.target instanceof Element)) return;
    if (event.target.closest("pe-focus-group") !== this) return;

    const onItem = event.target.closest(this.#selector());
    if (!onItem && this.#insideItemPanel(event.target)) return;

    const popover = this.#popover();
    if (!onItem && popover && !popover.matches(":popover-open")) {
      popover.showPopover();
    }

    const items = this.#items();
    if (!items.length) return;

    const current = onItem ? items.indexOf(onItem) : -1;
    const next = this.#nextIndex(items.length, current, direction);
    if (next === current && current !== -1) return;

    event.preventDefault();
    items[next].focus();
  }

  #selector() {
    return this.getAttribute("items") || DEFAULT_ITEMS;
  }

  #orientation() {
    const value = this.getAttribute("orientation");
    return value === "vertical" || value === "horizontal" ? value : "both";
  }

  #direction(key) {
    const orientation = this.#orientation();
    const vertical = orientation !== "horizontal";
    const horizontal = orientation !== "vertical";
    if ((key === "ArrowDown" && vertical) || (key === "ArrowRight" && horizontal)) return "next";
    if ((key === "ArrowUp" && vertical) || (key === "ArrowLeft" && horizontal)) return "prev";
    if (key === "Home") return "first";
    if (key === "End") return "last";
    return "";
  }

  #items() {
    const selector = this.#selector();
    return [...this.querySelectorAll(selector)].filter((el) => {
      if (el.closest("pe-focus-group") !== this) return false;
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return false;
      if (el.closest("[hidden]")) return false;
      if (typeof el.checkVisibility === "function" && !el.checkVisibility()) return false;
      return true;
    });
  }

  #nextIndex(length, current, direction) {
    if (direction === "first") return 0;
    if (direction === "last") return length - 1;
    if (current === -1) return direction === "prev" ? length - 1 : 0;
    if (direction === "prev") return (current - 1 + length) % length;
    return (current + 1) % length;
  }

  #popover() {
    return [...this.querySelectorAll("[popover]")].find((el) => el.closest("pe-focus-group") === this) ?? null;
  }

  // True when the key came from inside a panel that belongs to one of
  // this group's items, for example the body under a summary. Items that
  // only exist inside a popover do not count, so a dropdown toggle still
  // belongs to the focus group wrapped around that menu.
  #insideItemPanel(target) {
    const selector = this.#selector();
    let node = target.parentElement;
    while (node && node !== this) {
      const ownsItem = [...node.querySelectorAll(selector)].some(
        (el) => el.closest("pe-focus-group") === this && !el.closest("[popover]") && !el.contains(target),
      );
      if (ownsItem) return true;
      node = node.parentElement;
    }
    return false;
  }

  #inTextField(target) {
    return (
      target instanceof Element &&
      Boolean(target.closest("input, textarea, select, [contenteditable='true']"))
    );
  }
}

if (!customElements.get("pe-focus-group")) {
  customElements.define("pe-focus-group", PeFocusGroup);
}
