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
 *
 * Load this module only on pages that use <pe-carousel>. Without it,
 * scroll-snap still works. The HTML buttons do not.
 * disconnectedCallback drops the listeners and the scroll frame.
 */

const PAN_THRESHOLD = 4;

class PeCarousel extends HTMLElement {
  #inner = null;
  #raf = 0;
  #pending = false;
  #pointerId = null;
  #startX = 0;
  #startScroll = 0;
  #panning = false;
  #suppressClick = false;

  connectedCallback() {
    if (typeof CSS !== "undefined" && CSS.supports("selector(::scroll-button(inline-start))")) {
      return;
    }
    const inner = this.querySelector(".carousel-inner");
    if (!(inner instanceof HTMLElement)) return;
    this.#inner = inner;
    inner.addEventListener("command", this);
    inner.addEventListener("scroll", this);
    inner.addEventListener("pointerdown", this);
    inner.addEventListener("pointermove", this);
    inner.addEventListener("pointerup", this);
    inner.addEventListener("pointercancel", this);
    inner.addEventListener("click", this, true);
    this.#sync();
  }

  disconnectedCallback() {
    const inner = this.#inner;
    this.#inner = null;
    if (this.#raf) cancelAnimationFrame(this.#raf);
    this.#raf = 0;
    this.#pending = false;
    if (!inner) return;
    inner.removeEventListener("command", this);
    inner.removeEventListener("scroll", this);
    inner.removeEventListener("pointerdown", this);
    inner.removeEventListener("pointermove", this);
    inner.removeEventListener("pointerup", this);
    inner.removeEventListener("pointercancel", this);
    inner.removeEventListener("click", this, true);
    inner.removeAttribute("panning");
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
      default:
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
    const item = items[this.#index(items)];
    item?.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
    this.#sync();
  }

  #step(direction) {
    const items = this.#items();
    const next = items[this.#index(items) + direction];
    if (next) this.#scrollTo(next);
  }

  #slide(source) {
    if (!(source instanceof HTMLButtonElement)) return;
    const index = this.#indicators().indexOf(source);
    const item = this.#items()[index];
    if (item) this.#scrollTo(item);
  }

  #scrollTo(item) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    item.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "start",
      block: "nearest",
    });
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
    const inner = this.#inner;
    if (!inner) return;
    const items = this.#items();
    if (!items.length) return;
    const index = this.#index(items);
    const id = inner.id;
    if (!id) return;
    const start = this.querySelector(
      `button[command="--prev"][commandfor="${CSS.escape(id)}"]`,
    );
    const end = this.querySelector(
      `button[command="--next"][commandfor="${CSS.escape(id)}"]`,
    );
    if (start instanceof HTMLButtonElement) start.disabled = index <= 0;
    if (end instanceof HTMLButtonElement) end.disabled = index >= items.length - 1;
    this.#indicators().forEach((button, i) => {
      if (i === index) {
        if (button.getAttribute("aria-current") !== "true") button.setAttribute("aria-current", "true");
      } else if (button.hasAttribute("aria-current")) {
        button.removeAttribute("aria-current");
      }
    });
  }

  #indicators() {
    const id = this.#inner?.id;
    if (!id) return [];
    return [...this.querySelectorAll(
      `.carousel-indicators button[command="--slide"][commandfor="${CSS.escape(id)}"]`,
    )];
  }
}

if (!customElements.get("pe-carousel")) {
  customElements.define("pe-carousel", PeCarousel);
}
