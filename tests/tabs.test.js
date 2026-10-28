import { afterEach, describe, expect, it } from "vitest";
import { keydown } from "./setup.js";
import "../src/behaviors/tabs.js";

afterEach(() => {
  document.body.replaceChildren();
});

function mount({ selected = ["t1"], extraTab = "", panels = "" } = {}) {
  const tab = (id, label) =>
    `<button type="button" role="tab" id="${id}" aria-controls="p${id.slice(1)}" aria-selected="${selected.includes(id)}"${selected.includes(id) ? "" : ' tabindex="-1"'}>${label}</button>`;
  const template = document.createElement("template");
  template.innerHTML = `
    <pe-tabs>
      <div role="tablist">
        ${tab("t1", "One")}
        ${tab("t2", "Two")}
        ${extraTab}
      </div>
      <div id="p1" class="tab-pane" role="tabpanel">Pane 1</div>
      <div id="p2" class="tab-pane" role="tabpanel" hidden="until-found">Pane 2</div>
      <div id="p3" class="tab-pane" role="tabpanel" hidden="until-found">Pane 3</div>
      ${panels}
    </pe-tabs>
  `;
  document.body.append(template.content);
  return document.querySelector("pe-tabs");
}

const byId = (id) => document.getElementById(id);

describe("pe-tabs", () => {
  it("selects a tab on click and hides the other panels until found", () => {
    mount();
    byId("t2").click();
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
    expect(byId("t1").getAttribute("aria-selected")).toBe("false");
    expect(byId("t1").tabIndex).toBe(-1);
    expect(byId("t2").tabIndex).toBe(0);
    expect(byId("p2").hasAttribute("hidden")).toBe(false);
    expect(byId("p1").getAttribute("hidden")).toBe("until-found");
    expect(byId("p2").getAttribute("aria-labelledby")).toBe("t2");
  });

  it("writes no state classes", () => {
    mount();
    byId("t2").click();
    for (const el of document.querySelectorAll("[role=tab], [role=tabpanel]")) {
      expect(el.classList.contains("active"), el.id).toBe(false);
      expect(el.classList.contains("show"), el.id).toBe(false);
    }
  });

  it("moves with ArrowRight and wraps", () => {
    mount();
    const second = byId("t2");
    second.focus();
    keydown(second, "ArrowRight");
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
  });

  it("skips a disabled tab", () => {
    mount({
      extraTab: `<button type="button" role="tab" id="t3" aria-disabled="true" aria-controls="p3" aria-selected="false" tabindex="-1">Three</button>`,
    });
    const first = byId("t1");
    first.focus();
    keydown(first, "ArrowRight");
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
    keydown(byId("t2"), "ArrowRight");
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
    byId("t3").click();
    expect(byId("t3").getAttribute("aria-selected")).toBe("false");
  });

  it("uses Up and Down when the list is vertical", () => {
    mount();
    document.querySelector("[role=tablist]").setAttribute("aria-orientation", "vertical");
    const first = byId("t1");
    first.focus();
    keydown(first, "ArrowDown");
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
    keydown(byId("t2"), "ArrowRight");
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
  });

  it("skips disabled tabs at either end with Home and End", () => {
    mount({
      selected: ["t2"],
      extraTab: `<button type="button" role="tab" id="t3" aria-controls="p3" aria-selected="false" tabindex="-1">Three</button>
        <button type="button" role="tab" id="t4" aria-disabled="true" aria-selected="false" tabindex="-1">Four</button>`,
    });
    byId("t1").setAttribute("aria-disabled", "true");
    byId("t2").focus();
    keydown(byId("t2"), "End");
    expect(byId("t3").getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(byId("t3"));
    keydown(byId("t3"), "Home");
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(byId("t2"));
  });

  it("moves from a focused disabled tab to the nearest enabled one", () => {
    mount({
      selected: ["t2"],
      extraTab: `<button type="button" role="tab" id="t3" aria-disabled="true" aria-controls="p3" aria-selected="false" tabindex="-1">Three</button>`,
    });
    byId("t3").focus();
    keydown(byId("t3"), "ArrowRight");
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
    byId("t3").focus();
    keydown(byId("t3"), "ArrowLeft");
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
  });

  it("selects the first tab when none is marked", () => {
    mount({ selected: [] });
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
    expect(byId("p1").hasAttribute("hidden")).toBe(false);
    expect(byId("p2").getAttribute("hidden")).toBe("until-found");
  });

  it("keeps the first when several are marked", () => {
    mount({ selected: ["t1", "t2"] });
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
    expect(byId("t2").getAttribute("aria-selected")).toBe("false");
    expect(byId("p2").getAttribute("hidden")).toBe("until-found");
  });

  it("does not start on a disabled tab", () => {
    mount({
      selected: ["t3"],
      extraTab: `<button type="button" role="tab" id="t3" aria-disabled="true" aria-controls="p3" aria-selected="true">Three</button>`,
    });
    expect(byId("t3").getAttribute("aria-selected")).toBe("false");
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
  });

  it("selects a tab with no panel without touching other panels", () => {
    mount({
      extraTab: `<button type="button" role="tab" id="t9" aria-selected="false" tabindex="-1">Nine</button>`,
    });
    byId("t9").click();
    expect(byId("t9").getAttribute("aria-selected")).toBe("true");
    expect(byId("p1").getAttribute("hidden")).toBe("until-found");
  });

  it("select() takes an element or an id and fires pe-tab-change", () => {
    const tabs = mount();
    const seen = [];
    document.addEventListener("pe-tab-change", (event) => seen.push(event.detail), { once: true });
    tabs.select("t2");
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
    expect(seen).toEqual([{ tab: byId("t2"), panel: byId("p2") }]);
    tabs.select(byId("t1"));
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
    tabs.select("missing");
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
  });

  it("does not fire pe-tab-change when the tab is already selected", () => {
    mount();
    let count = 0;
    document.addEventListener("pe-tab-change", () => count++);
    byId("t1").click();
    expect(count).toBe(0);
  });

  it("selects the tab whose panel Find in page matched, without moving focus", () => {
    mount();
    byId("t1").focus();
    byId("p2").dispatchEvent(new Event("beforematch", { bubbles: true }));
    expect(byId("t2").getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(byId("t1"));
  });

  it("leaves a nested tab set alone", () => {
    mount({
      panels: `
        <pe-tabs id="inner">
          <div role="tablist">
            <button type="button" role="tab" id="i1" aria-controls="ip1" aria-selected="true">A</button>
            <button type="button" role="tab" id="i2" aria-controls="ip2" aria-selected="false" tabindex="-1">B</button>
          </div>
          <div id="ip1" role="tabpanel">A</div>
          <div id="ip2" role="tabpanel" hidden="until-found">B</div>
        </pe-tabs>`,
    });
    byId("i2").click();
    expect(byId("i2").getAttribute("aria-selected")).toBe("true");
    expect(byId("t1").getAttribute("aria-selected")).toBe("true");
  });
});
