import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../src/polyfills/interestfor.js";

afterEach(() => {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
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

  it("links a hint with a control through aria-details", () => {
    const { btn, tip } = hintPair();
    tip.innerHTML = '<a href="#more">More</a>';
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.runAllTimers();
    expect(btn.getAttribute("aria-details")).toBe("tip");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(btn.hasAttribute("aria-describedby")).toBe(false);
    expect(tip.getAttribute("role")).toBe("tooltip");
  });

  it("keeps a hint with a presentational role plain, but not another role", () => {
    const { btn, tip } = hintPair();
    tip.innerHTML = '<span role="presentation">Saved</span>';
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.runAllTimers();
    expect(btn.getAttribute("aria-describedby")).toBe("tip");

    const other = hintPair();
    other.tip.id = "tip2";
    other.btn.setAttribute("interestfor", "tip2");
    other.tip.innerHTML = '<span role="button">Undo</span>';
    other.btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.runAllTimers();
    expect(other.btn.getAttribute("aria-details")).toBe("tip2");
  });

  it("waits for --interest-delay-start in ms", () => {
    const { btn, tip } = hintPair();
    btn.style.setProperty("--interest-delay-start", "200ms");
    const show = vi.spyOn(tip, "showPopover");
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(199);
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalled();
  });

  it("uses the default start delay for normal", () => {
    const { btn, tip } = hintPair();
    btn.style.setProperty("--interest-delay-start", "normal");
    const show = vi.spyOn(tip, "showPopover");
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(499);
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalled();
  });

  it("reads both delays from the --interest-delay shorthand", () => {
    const { btn, tip } = hintPair();
    btn.style.removeProperty("--interest-delay-start");
    btn.style.removeProperty("--interest-delay-end");
    btn.style.setProperty("--interest-delay", "100ms 1s");
    const show = vi.spyOn(tip, "showPopover");
    const hide = vi.spyOn(tip, "hidePopover");
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    vi.advanceTimersByTime(100);
    expect(show).toHaveBeenCalled();
    btn.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    vi.advanceTimersByTime(999);
    expect(hide).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(hide).toHaveBeenCalled();
  });
});
