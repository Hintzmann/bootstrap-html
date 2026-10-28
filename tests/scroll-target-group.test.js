import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/polyfills/scroll-target-group.js";

vi.hoisted(() => {
  const proto = Object.getPrototypeOf(CSS);
  const { supports } = proto;
  proto.supports = function (query, ...rest) {
    return !String(query).includes("scroll-target-group") && supports.call(this, query, ...rest);
  };
  globalThis.ResizeObserver ??= class {
    observe() {}
    disconnect() {}
  };
});

afterEach(() => {
  document.body.replaceChildren();
});

const VIEW = 300;
const PANE_TOP = 50;

/** A 300px pane whose targets start at `tops` in its scrolled content. */
async function mount(tops, contentHeight) {
  const links = tops.map((_, i) => `<a href="#s${i}">${i}</a>`).join("");
  document.body.innerHTML = `<nav data-polyfill-scrollspy="#pane">${links}<a href="#missing">x</a></nav>
<div id="pane">${tops.map((_, i) => `<h2 id="s${i}"></h2>`).join("")}</div>`;
  const pane = document.getElementById("pane");
  Object.defineProperties(pane, {
    clientHeight: { value: VIEW },
    clientTop: { value: 0 },
    scrollHeight: { value: contentHeight },
    scrollTop: { value: 0, writable: true },
  });
  pane.getBoundingClientRect = () => new DOMRect(0, PANE_TOP, 300, VIEW);
  tops.forEach((top, i) => {
    document.getElementById(`s${i}`).getBoundingClientRect = () =>
      new DOMRect(0, PANE_TOP + top - pane.scrollTop, 300, 40);
  });
  await new Promise((resolve) => setTimeout(resolve));
  return pane;
}

function currentAt(pane, scrollTop) {
  pane.scrollTop = scrollTop;  pane.dispatchEvent(new Event("scroll"));
  return [...document.querySelectorAll("nav a")]
    .filter((a) => a.classList.contains(":target-current"))
    .map((a) => a.getAttribute("href"));
}

describe("scroll-target-group polyfill", () => {
  it("switches where Chromium does, including targets past the end of the scroll range", async () => {
    const pane = await mount([0, 600, 840, 1280, 1380], 1460);
    expect(currentAt(pane, 0)).toEqual(["#s0"]);
    expect(currentAt(pane, 440)).toEqual(["#s0"]);
    expect(currentAt(pane, 460)).toEqual(["#s1"]);
    expect(currentAt(pane, 710)).toEqual(["#s1"]);
    expect(currentAt(pane, 730)).toEqual(["#s2"]);
    expect(currentAt(pane, 990)).toEqual(["#s2"]);
    expect(currentAt(pane, 1000)).toEqual(["#s3"]);
    expect(currentAt(pane, 1150)).toEqual(["#s3"]);
    expect(currentAt(pane, 1160)).toEqual(["#s4"]);
  });

  it("marks the last target when the scroller cannot scroll", async () => {
    const pane = await mount([0, 50, 100], VIEW);
    expect(currentAt(pane, 0)).toEqual(["#s2"]);
  });
});
