import { afterEach, describe, expect, it, vi } from "vitest";
import { commandEvent } from "./setup.js";
import "../src/behaviors/alert.js";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function alertEl(classes = "alert") {
  const el = document.createElement("pe-alert");
  el.className = classes;
  el.id = "a1";
  document.body.append(el);
  return el;
}

describe("pe-alert", () => {
  it("removes the node on --dismiss when there is no fade", () => {
    const el = alertEl();
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(document.getElementById("a1")).toBeNull();
  });

  it("ignores other commands", () => {
    const el = alertEl();
    el.dispatchEvent(commandEvent("close"));
    expect(document.getElementById("a1")).toBe(el);
  });

  it("waits for the fade when .fade.show is set", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      transitionDuration: "150ms",
    });
    const el = alertEl("alert fade show");
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(el.classList.contains("show")).toBe(false);
    expect(document.getElementById("a1")).toBe(el);
    el.dispatchEvent(Object.assign(new Event("transitionend"), { propertyName: "opacity" }));
    expect(document.getElementById("a1")).toBeNull();
  });

  it("skips the wait when reduced motion is preferred", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true });
    const el = alertEl("alert fade show");
    el.dispatchEvent(commandEvent("--dismiss"));
    expect(document.getElementById("a1")).toBeNull();
  });

  it("drops the timer in disconnectedCallback", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      transitionDuration: "5s",
    });
    const el = alertEl("alert fade show");
    el.dispatchEvent(commandEvent("--dismiss"));
    el.remove();
    expect(document.getElementById("a1")).toBeNull();
  });
});
