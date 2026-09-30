import { afterEach, describe, expect, it } from "vitest";
import { keydown } from "./setup.js";
import "../src/behaviors/tabs.js";

afterEach(() => {
  document.body.replaceChildren();
});

function mount(extraTab = "") {
  document.body.innerHTML = `
    <pe-tabs>
      <div role="tablist">
        <button type="button" role="tab" id="t1" aria-controls="p1" aria-selected="true">One</button>
        <button type="button" role="tab" id="t2" aria-controls="p2" aria-selected="false" tabindex="-1">Two</button>
        ${extraTab}
      </div>
      <div id="p1" class="tab-pane active show" role="tabpanel">Pane 1</div>
      <div id="p2" class="tab-pane" role="tabpanel">Pane 2</div>
      <div id="p3" class="tab-pane" role="tabpanel">Pane 3</div>
    </pe-tabs>
  `;
  return document.querySelector("pe-tabs");
}

describe("pe-tabs", () => {
  it("selects a tab on click and marks the pane", () => {
    mount();
    document.getElementById("t2").click();
    expect(document.getElementById("t2").getAttribute("aria-selected")).toBe("true");
    expect(document.getElementById("t1").getAttribute("aria-selected")).toBe("false");
    expect(document.getElementById("t1").tabIndex).toBe(-1);
    expect(document.getElementById("t2").tabIndex).toBe(0);
    expect(document.getElementById("p2").classList.contains("active")).toBe(true);
    expect(document.getElementById("p1").classList.contains("active")).toBe(false);
  });

  it("moves with ArrowRight and wraps", () => {
    mount();
    const second = document.getElementById("t2");
    second.focus();
    keydown(second, "ArrowRight");
    expect(document.getElementById("t1").getAttribute("aria-selected")).toBe("true");
  });

  it("skips a disabled tab", () => {
    mount(
      `<button type="button" role="tab" id="t3" class="disabled" aria-disabled="true" aria-controls="p3" aria-selected="false" tabindex="-1">Three</button>`,
    );
    const first = document.getElementById("t1");
    first.focus();
    keydown(first, "ArrowRight");
    expect(document.getElementById("t2").getAttribute("aria-selected")).toBe("true");
    document.getElementById("t2").focus();
    keydown(document.getElementById("t2"), "ArrowRight");
    expect(document.getElementById("t1").getAttribute("aria-selected")).toBe("true");
  });

  it("uses Up and Down when the list is vertical", () => {
    mount();
    document.querySelector("[role=tablist]").setAttribute("aria-orientation", "vertical");
    const first = document.getElementById("t1");
    first.focus();
    keydown(first, "ArrowDown");
    expect(document.getElementById("t2").getAttribute("aria-selected")).toBe("true");
    keydown(document.getElementById("t2"), "ArrowRight");
    expect(document.getElementById("t2").getAttribute("aria-selected")).toBe("true");
  });
});
