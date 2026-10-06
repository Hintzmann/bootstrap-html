import { afterEach, describe, expect, it } from "vitest";
import { syncGroup, syncGroups } from "../src/behaviors/range-group.js";

afterEach(() => {
  document.body.replaceChildren();
});

function mount({
  min = "200",
  max = "800",
  extra = "",
  attrs = 'min="0" max="1000" step="10"',
} = {}) {
  document.body.innerHTML = `
    <fieldset class="form-range-group" id="price">
      <legend>Price</legend>
      <div class="form-range-track">
        <input type="range" class="form-range" id="price-min" name="price-min" ${attrs} value="${min}">
        <input type="range" class="form-range" id="price-max" name="price-max" ${attrs} value="${max}">
      </div>
      <output for="price-min">0</output>
      <output for="price-max">0</output>
    </fieldset>
    ${extra}
  `;
  return {
    group: document.getElementById("price"),
    min: document.getElementById("price-min"),
    max: document.getElementById("price-max"),
    minOut: document.querySelector('output[for="price-min"]'),
    maxOut: document.querySelector('output[for="price-max"]'),
  };
}

function setValue(input, value) {
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("range-group.js", () => {
  it("writes custom props and outputs on syncGroups", () => {
    const { group, minOut, maxOut } = mount();
    syncGroups();
    expect(group.style.getPropertyValue("--bs-range-lower")).toBe("20");
    expect(group.style.getPropertyValue("--bs-range-upper")).toBe("80");
    expect(minOut.textContent).toBe("200");
    expect(maxOut.textContent).toBe("800");
  });

  it("clamps the lower thumb against the next", () => {
    const { min, max, minOut, group } = mount();
    syncGroups();
    setValue(min, 900);
    expect(min.value).toBe(max.value);
    expect(minOut.textContent).toBe(max.value);
    expect(Number(group.style.getPropertyValue("--bs-range-lower"))).toBe(
      Number(group.style.getPropertyValue("--bs-range-upper")),
    );
  });

  it("clamps the upper thumb against the previous", () => {
    const { min, max, maxOut } = mount();
    syncGroups();
    setValue(max, 50);
    expect(max.value).toBe(min.value);
    expect(maxOut.textContent).toBe(min.value);
  });

  it("ignores ranges outside a group", () => {
    const { min } = mount({
      extra: `<input type="range" id="outsider" min="0" max="100" value="10">
              <output for="outsider">10</output>`,
    });
    syncGroups();
    const outsider = document.getElementById("outsider");
    outsider.value = "40";
    outsider.dispatchEvent(new Event("input", { bubbles: true }));
    expect(document.querySelector('output[for="outsider"]').textContent).toBe("10");
    expect(min.value).toBe("200");
  });

  it("still clamps against a disabled neighbour", () => {
    const { min, max } = mount();
    min.disabled = true;
    syncGroups();
    setValue(max, 50);
    expect(max.value).toBe("200");
  });

  it("skips a group with data-range-group=off", () => {
    document.body.innerHTML = `
      <fieldset class="form-range-group" data-range-group="off" id="year">
        <input type="range" id="year-min" min="1900" max="2026" value="1980">
        <input type="range" id="year-max" min="1900" max="2026" value="2010">
      </fieldset>
    `;
    const group = document.getElementById("year");
    const min = document.getElementById("year-min");
    syncGroups();
    expect(group.style.getPropertyValue("--bs-range-lower")).toBe("");
    min.value = "2020";
    min.dispatchEvent(new Event("input", { bubbles: true }));
    expect(min.value).toBe("2020");
    expect(document.getElementById("year-max").value).toBe("2010");
    expect(group.style.getPropertyValue("--bs-range-lower")).toBe("");
  });

  it("syncGroup no-ops on a node that is not a group", () => {
    document.body.innerHTML = `<div id="nope"><input type="range" value="10"></div>`;
    expect(() => syncGroup(document.getElementById("nope"))).not.toThrow();
    expect(document.getElementById("nope").style.getPropertyValue("--bs-range-lower")).toBe("");
  });

  it("matches output for when the id is one of several", () => {
    const { min } = mount({
      extra: `<output id="shared" for="price-min other">0</output>`,
    });
    syncGroups();
    setValue(min, 300);
    expect(document.getElementById("shared").textContent).toBe("300");
  });
});
