import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/polyfills/interestfor.js";

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.useFakeTimers();
});

function hintPair() {
  const btn = document.createElement("button");
  btn.setAttribute("interestfor", "tip");
  btn.style.setProperty("--interest-delay-start", "0s");
  btn.style.setProperty("--interest-delay-end", "0s");
  const tip = document.createElement("div");
  tip.id = "tip";
  tip.setAttribute("popover", "hint");
  tip.className = "tooltip";
  document.body.append(btn, tip);
  return { btn, tip };
}

describe("interestfor polyfill", () => {
  it("defines interestForElement on the button prototype", () => {
    expect(
      Object.prototype.hasOwnProperty.call(HTMLButtonElement.prototype, "interestForElement"),
    ).toBe(true);
  });

  it("showPopover receives the invoker as source after hover", () => {
    const { btn, tip } = hintPair();
    const show = vi.spyOn(tip, "showPopover");
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.runAllTimers();
    expect(show).toHaveBeenCalled();
    expect(show.mock.calls[0][0]).toEqual({ source: btn });
    expect(tip.classList.contains("interest-target")).toBe(true);
    expect(btn.getAttribute("aria-describedby")).toBe("tip");
  });

  it("Escape hides the popover", () => {
    const { btn, tip } = hintPair();
    const hide = vi.spyOn(tip, "hidePopover");
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.runAllTimers();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(hide).toHaveBeenCalled();
    expect(tip.classList.contains("interest-target")).toBe(false);
  });
});
