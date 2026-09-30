import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commandEvent } from "./setup.js";
import "../src/behaviors/carousel.js";

beforeEach(() => {
  const proto = Object.getPrototypeOf(CSS);
  proto.supports = () => false;
});

afterEach(() => {
  document.body.replaceChildren();
});

function mount() {
  const host = document.createElement("pe-carousel");
  host.className = "carousel";
  host.innerHTML = `
      <div class="carousel-inner" id="inner">
        <div class="carousel-item">A</div>
        <div class="carousel-item">B</div>
        <div class="carousel-item">C</div>
      </div>
      <button type="button" command="--prev" commandfor="inner">Prev</button>
      <button type="button" command="--next" commandfor="inner">Next</button>
      <div class="carousel-indicators">
        <button type="button" command="--slide" commandfor="inner">1</button>
        <button type="button" command="--slide" commandfor="inner">2</button>
        <button type="button" command="--slide" commandfor="inner">3</button>
      </div>
  `;
  document.body.append(host);
  const inner = document.getElementById("inner");
  const items = [...inner.querySelectorAll(".carousel-item")];
  items.forEach((item, i) => {
    item.getBoundingClientRect = () => ({ left: i * 100, right: i * 100 + 100, top: 0, bottom: 80 });
  });
  inner.getBoundingClientRect = () => ({ left: 0, right: 100, top: 0, bottom: 80 });
  return {
    inner,
    items,
    prev: document.querySelector('[command="--prev"]'),
    next: document.querySelector('[command="--next"]'),
    pips: [...document.querySelectorAll('[command="--slide"]')],
  };
}

describe("pe-carousel", () => {
  it("scrolls to the next item on --next", () => {
    const { inner, items } = mount();
    const spy = vi.spyOn(items[1], "scrollIntoView");
    inner.dispatchEvent(commandEvent("--next"));
    expect(spy).toHaveBeenCalledOnce();
  });

  it("disables prev at the start and next at the end", async () => {
    const { inner, items, prev, next } = mount();
    inner.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    items[0].getBoundingClientRect = () => ({ left: -200, right: -100, top: 0, bottom: 80 });
    items[2].getBoundingClientRect = () => ({ left: 0, right: 100, top: 0, bottom: 80 });
    inner.dispatchEvent(new Event("scroll"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(next.disabled).toBe(true);
  });

  it("jumps to a pip with --slide", () => {
    const { inner, items, pips } = mount();
    const spy = vi.spyOn(items[2], "scrollIntoView");
    inner.dispatchEvent(commandEvent("--slide", pips[2]));
    expect(spy).toHaveBeenCalledOnce();
  });
});
