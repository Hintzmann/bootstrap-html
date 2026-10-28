/**
 * Optional carousel controls for browsers without ::scroll-button.
 *
 * The element is the carousel. Add class="carousel". Previous and next
 * buttons use command="--prev" or command="--next" and
 * commandfor set to the .carousel-inner id, with no hash. The command
 * event does not bubble, so the listener stays on that scroller.
 *
 * When selector(::scroll-button(inline-start)) is supported, this
 * element does nothing. Native scroll buttons and markers stay.
 * Otherwise one command moves one .carousel-item, end buttons disable,
 * indicator buttons use command="--slide" in slide order, and a mouse
 * drag pans the scroller. Touch scrolling stays native. The current
 * pip is aria-current="true".
 * Links, buttons, and fields are left alone until the pointer has moved.
 * The pan writes scrollLeft and reads getBoundingClientRect to find the
 * current slide. That is the AGENTS.md exception: without ::scroll-button
 * and scroll markers there is no CSS way to do either.
 * Scrolls pass no behavior, so the scroller's scroll-behavior decides
 * between smooth and instant, reduced motion included.
 *
 * carousel.js imports this module only where ::scroll-button is missing.
 * Load carousel.js, not this file. Without it, scroll-snap still works.
 * The HTML buttons do not.
 * disconnectedCallback drops the listeners and the scroll frame.
 */

const PAN_THRESHOLD = 4;

class PeCarousel extends HTMLElement {
  #inner = null;
  #listeners = null;
  #raf = 0;
  #pending = false;
  #pointerId = null;
  #startX = 0;
  #startScroll = 0;
  #panning = false;
  #suppressClick = false;

  connectedCallback() {
    if (CSS.supports("selector(::scroll-button(inline-start))")) return;
    const inner = this.querySelector(".carousel-inner");
    if (!(inner instanceof HTMLElement)) return;
    this.#inner = inner;
    this.#listeners = new AbortController();
    const { signal } = this.#listeners;
    for (const type of ["command", "scroll", "pointerdown", "pointermove", "pointerup", "pointercancel"]) {
      inner.addEventListener(type, this, { signal });
    }
    inner.addEventListener("click", this, { capture: true, signal });
    this.#sync();
  }

  disconnectedCallback() {
    this.#listeners?.abort();
    this.#listeners = null;
    cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#pending = false;
    this.#inner?.removeAttribute("panning");
    this.#inner = null;
  }

  handleEvent(event) {
    switch (event.type) {
      case "command":
        this.#onCommand(event);
        break;
      case "scroll":
        this.#onScroll();
        break;
      case "pointerdown":
        this.#onPointerDown(event);
        break;
      case "pointermove":
        this.#onPointerMove(event);
        break;
      case "pointerup":
      case "pointercancel":
        this.#onPointerUp(event);
        break;
      case "click":
        if (!this.#suppressClick) return;
        this.#suppressClick = false;
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  #onCommand(event) {
    if (event.target !== this.#inner) return;
    if (event.command === "--prev") this.#step(-1);
    else if (event.command === "--next") this.#step(1);
    else if (event.command === "--slide") this.#slide(event.source);
  }

  #onScroll() {
    if (this.#pending) return;
    this.#pending = true;
    this.#raf = requestAnimationFrame(() => {
      this.#pending = false;
      this.#sync();
    });
  }

  #onPointerDown(event) {
    const inner = this.#inner;
    if (!inner || event.pointerType !== "mouse" || event.button !== 0) return;
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("a, button, input, textarea, select, label, summary")) return;
    if (event.target instanceof HTMLImageElement) event.preventDefault();
    this.#pointerId = event.pointerId;
    this.#startX = event.clientX;
    this.#startScroll = inner.scrollLeft;
    this.#panning = false;
  }

  #onPointerMove(event) {
    const inner = this.#inner;
    if (!inner || event.pointerId !== this.#pointerId) return;
    const dx = event.clientX - this.#startX;
    if (!this.#panning) {
      if (Math.abs(dx) < PAN_THRESHOLD) return;
      this.#panning = true;
      inner.setPointerCapture(event.pointerId);
      inner.setAttribute("panning", "");
    }
    event.preventDefault();
    inner.scrollLeft = this.#startScroll - dx;
  }

  #onPointerUp(event) {
    const inner = this.#inner;
    if (!inner || event.pointerId !== this.#pointerId) return;
    this.#pointerId = null;
    if (!this.#panning) return;
    this.#panning = false;
    this.#suppressClick = true;
    inner.removeAttribute("panning");
    if (inner.hasPointerCapture(event.pointerId)) inner.releasePointerCapture(event.pointerId);
    const items = this.#items();
    this.#scrollTo(items[this.#index(items)]);
    this.#sync();
  }

  #step(direction) {
    const items = this.#items();
    this.#scrollTo(items[this.#index(items) + direction]);
  }

  #slide(source) {
    if (!(source instanceof HTMLButtonElement)) return;
    this.#scrollTo(this.#items()[this.#indicators().indexOf(source)]);
  }

  #scrollTo(item) {
    item?.scrollIntoView({ inline: "start", block: "nearest" });
  }

  #items() {
    const inner = this.#inner;
    if (!inner) return [];
    return [...inner.querySelectorAll(":scope > .carousel-item")];
  }

  #index(items) {
    const inner = this.#inner;
    if (!inner || !items.length) return 0;
    const rtl = getComputedStyle(inner).direction === "rtl";
    const box = inner.getBoundingClientRect();
    const edge = rtl ? box.right : box.left;
    let index = 0;
    let best = Infinity;
    items.forEach((item, i) => {
      const itemBox = item.getBoundingClientRect();
      const itemEdge = rtl ? itemBox.right : itemBox.left;
      const dist = Math.abs(itemEdge - edge);
      if (dist < best) {
        best = dist;
        index = i;
      }
    });
    return index;
  }

  #sync() {
    const items = this.#items();
    if (!items.length || !this.#inner.id) return;
    const index = this.#index(items);
    const [start] = this.#controls('button[command="--prev"]');
    const [end] = this.#controls('button[command="--next"]');
    if (start) start.disabled = index <= 0;
    if (end) end.disabled = index >= items.length - 1;
    this.#indicators().forEach((button, i) => {
      if (i === index) {
        if (button.getAttribute("aria-current") !== "true") button.setAttribute("aria-current", "true");
      } else if (button.hasAttribute("aria-current")) {
        button.removeAttribute("aria-current");
      }
    });
  }

  #indicators() {
    return this.#controls('.carousel-indicators button[command="--slide"]');
  }

  #controls(selector) {
    const id = this.#inner?.id;
    return id ? [...this.querySelectorAll(`${selector}[commandfor="${CSS.escape(id)}"]`)] : [];
  }
}

if (!customElements.get("pe-carousel")) {
  customElements.define("pe-carousel", PeCarousel);
}
