import { afterEach, describe, expect, it, vi } from "vitest";
import { commandEvent } from "./setup.js";
import "../src/behaviors/alert.js";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function alertEl(classes = "alert") {
  const el = document.createElement("pe-alert");
  el.className = classes;
  el.id = "a1";
  document.body.append(el);
  return el;
}

function fakeAnimation(endTime) {
  let resolve;
  const finished = new Promise((r) => (resolve = r));
  return {
    animation: { effect: { getComputedTiming: () => ({ endTime }) }, finished },
    finish: () => resolve(),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("pe-alert", () => {
  it("removes the node on --dismiss when nothing animates", () => {
    const el = alertEl();
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(document.getElementById("a1")).toBeNull();
  });

  it("ignores other commands", () => {
    const el = alertEl();
    el.dispatchEvent(commandEvent("close"));
    expect(document.getElementById("a1")).toBe(el);
  });

  it("keeps the alert when pe-dismiss is canceled", () => {
    const el = alertEl();
    document.addEventListener("pe-dismiss", (event) => event.preventDefault(), { once: true });
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(document.getElementById("a1")).toBe(el);
    expect(el.hidden).toBe(false);
  });

  it("hides, then removes after the exit animation finishes", async () => {
    const el = alertEl("alert fade");
    const fade = fakeAnimation(150);
    el.getAnimations = () => [fade.animation];
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(el.hidden).toBe(true);
    expect(document.getElementById("a1")).toBe(el);
    fade.finish();
    await flush();
    expect(document.getElementById("a1")).toBeNull();
  });

  it("does not wait for infinite animations", () => {
    const el = alertEl("alert");
    el.getAnimations = () => [fakeAnimation(Infinity).animation];
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(document.getElementById("a1")).toBeNull();
  });

  it("removes the node by timer when an animation never settles", () => {
    vi.useFakeTimers();
    const el = alertEl("alert fade");
    el.getAnimations = () => [fakeAnimation(150).animation];
    el.dispatchEvent(commandEvent("--dismiss"));
    vi.advanceTimersByTime(249);
    expect(document.getElementById("a1")).toBe(el);
    vi.advanceTimersByTime(1);
    expect(document.getElementById("a1")).toBeNull();
  });

  it("fires pe-dismiss once when dismissed twice", () => {
    const el = alertEl("alert fade");
    el.getAnimations = () => [fakeAnimation(150).animation];
    let count = 0;
    document.addEventListener("pe-dismiss", () => count++);
    el.dispatchEvent(commandEvent("--dismiss"));
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(count).toBe(1);
  });

  it("drops the timer in disconnectedCallback", () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(window, "clearTimeout");
    const el = alertEl("alert fade");
    el.getAnimations = () => [fakeAnimation(5000).animation];
    el.dispatchEvent(commandEvent("--dismiss"));
    el.remove();
    expect(clear).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
