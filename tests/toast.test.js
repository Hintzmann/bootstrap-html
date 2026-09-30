import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/behaviors/toast.js";

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});

function open(el) {
  const orig = el.matches.bind(el);
  el.matches = (sel) => (sel === ":popover-open" ? true : orig(sel));
}

function mountPair() {
  document.body.innerHTML = `
    <div class="toast-container">
      <pe-toast class="toast" id="one" data-delay="1000"></pe-toast>
      <pe-toast class="toast" id="two" data-delay="0"></pe-toast>
    </div>
  `;
  return {
    one: document.getElementById("one"),
    two: document.getElementById("two"),
  };
}

describe("pe-toast", () => {
  it("hides after data-delay", () => {
    vi.useFakeTimers();
    const { one } = mountPair();
    open(one);
    const hide = vi.spyOn(one, "hidePopover");
    one.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }));
    expect(hide).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(hide).toHaveBeenCalledOnce();
  });

  it("does not autohide when data-delay is missing or 0", () => {
    vi.useFakeTimers();
    const { two } = mountPair();
    open(two);
    const hide = vi.spyOn(two, "hidePopover");
    two.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }));
    vi.advanceTimersByTime(10_000);
    expect(hide).not.toHaveBeenCalled();
  });

  it("sets stack custom properties on open siblings", async () => {
    const { one, two } = mountPair();
    Object.defineProperty(one, "offsetHeight", { configurable: true, value: 40 });
    Object.defineProperty(two, "offsetHeight", { configurable: true, value: 50 });
    open(one);
    open(two);
    one.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(one.style.getPropertyValue("--pe-toast-index")).toBe("0");
    expect(one.style.getPropertyValue("--pe-toast-stack")).toBe("0px");
    expect(two.style.getPropertyValue("--pe-toast-index")).toBe("1");
    expect(two.style.getPropertyValue("--pe-toast-stack")).toBe("40px");
    expect(one.style.getPropertyValue("--pe-toast-offset")).toBe("");
  });

  it("sets --pe-toast-delay from data-delay", () => {
    const { one, two } = mountPair();
    open(one);
    open(two);
    one.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }));
    two.dispatchEvent(Object.assign(new Event("toggle"), { newState: "open" }));
    expect(one.style.getPropertyValue("--pe-toast-delay")).toBe("1000ms");
    expect(two.style.getPropertyValue("--pe-toast-delay")).toBe("");
  });
});
