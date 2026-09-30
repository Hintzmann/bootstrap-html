import { afterEach, describe, expect, it, vi } from "vitest";
import { keydown } from "./setup.js";
import "../src/behaviors/focus-group.js";

afterEach(() => {
  document.body.replaceChildren();
});

function mount() {
  document.body.innerHTML = `
    <pe-focus-group>
      <button type="button" class="dropdown-toggle">Open</button>
      <div class="dropdown-menu" popover="auto">
        <a class="dropdown-item" href="#one">One</a>
        <a class="dropdown-item disabled" href="#skip">Skip</a>
        <a class="dropdown-item" href="#two">Two</a>
      </div>
    </pe-focus-group>
  `;
  const menu = document.querySelector("[popover]");
  menu.showPopover = vi.fn();
  return {
    group: document.querySelector("pe-focus-group"),
    toggle: document.querySelector(".dropdown-toggle"),
    one: document.querySelector("[href='#one']"),
    two: document.querySelector("[href='#two']"),
    menu,
  };
}

describe("pe-focus-group", () => {
  it("moves from the first item to the next with ArrowDown", () => {
    const { one, two } = mount();
    one.focus();
    keydown(one, "ArrowDown");
    expect(document.activeElement).toBe(two);
  });

  it("wraps with ArrowUp from the first item", () => {
    const { one, two } = mount();
    one.focus();
    keydown(one, "ArrowUp");
    expect(document.activeElement).toBe(two);
  });

  it("opens a closed popover from the toggle", () => {
    const { toggle, menu, one } = mount();
    const orig = menu.matches.bind(menu);
    menu.matches = (sel) => (sel === ":popover-open" ? false : orig(sel));
    toggle.focus();
    keydown(toggle, "ArrowDown");
    expect(menu.showPopover).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(one);
  });

  it("leaves arrow keys to a text field", () => {
    const { group, one } = mount();
    const field = document.createElement("input");
    group.append(field);
    field.focus();
    keydown(field, "ArrowDown");
    expect(document.activeElement).toBe(field);
    expect(document.activeElement).not.toBe(one);
  });
});
