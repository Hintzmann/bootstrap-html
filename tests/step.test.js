import { afterEach, describe, expect, it, vi } from "vitest";
import { commandEvent } from "./setup.js";
import { stepInput } from "../src/behaviors/step.js";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function stubStep() {
  const proto = HTMLInputElement.prototype;
  if (typeof proto.stepUp !== "function") {
    proto.stepUp = function stepUp() {};
    proto.stepDown = function stepDown() {};
  }
  vi.spyOn(proto, "stepUp").mockImplementation(function stepUp() {
    this.value = String(Number(this.value) + Number(this.step || 1));
  });
  vi.spyOn(proto, "stepDown").mockImplementation(function stepDown() {
    this.value = String(Number(this.value) - Number(this.step || 1));
  });
}

function mount({ value = "1", extra = "", attrs = 'type="number" min="0" max="8" step="1"' } = {}) {
  document.body.innerHTML = `
    <input id="qty" name="qty" value="${value}" ${attrs}>
    <output for="qty"></output>
    ${extra}
  `;
  return {
    input: document.getElementById("qty"),
    output: document.querySelector("output"),
  };
}

describe("step.js", () => {
  it("steps up, fires input and change, and writes output[for]", () => {
    stubStep();
    const { input, output } = mount();
    const seen = [];
    input.addEventListener("input", () => seen.push("input"));
    input.addEventListener("change", () => seen.push("change"));

    input.dispatchEvent(commandEvent("--step-up"));

    expect(input.stepUp).toHaveBeenCalledOnce();
    expect(input.value).toBe("2");
    expect(seen).toEqual(["input", "change"]);
    expect(output.textContent).toBe("2");
  });

  it("steps down through stepInput", () => {
    stubStep();
    const { input, output } = mount({ value: "3" });
    stepInput(input, "down");
    expect(input.stepDown).toHaveBeenCalledOnce();
    expect(input.value).toBe("2");
    expect(output.textContent).toBe("2");
  });

  it("ignores other commands and leaves the value", () => {
    stubStep();
    const { input, output } = mount();
    input.dispatchEvent(commandEvent("--dismiss"));
    expect(input.stepUp).not.toHaveBeenCalled();
    expect(input.value).toBe("1");
    expect(output.textContent).toBe("");
  });

  it("skips disabled and readonly inputs", () => {
    stubStep();
    const { input } = mount();
    input.disabled = true;
    input.dispatchEvent(commandEvent("--step-up"));
    expect(input.stepUp).not.toHaveBeenCalled();

    input.disabled = false;
    input.readOnly = true;
    input.dispatchEvent(commandEvent("--step-down"));
    expect(input.stepDown).not.toHaveBeenCalled();
    expect(input.value).toBe("1");
  });

  it("swallows InvalidStateError from stepUp", () => {
    stubStep();
    const { input, output } = mount();
    input.stepUp.mockImplementation(() => {
      throw new DOMException("step any", "InvalidStateError");
    });
    expect(() => input.dispatchEvent(commandEvent("--step-up"))).not.toThrow();
    expect(input.value).toBe("1");
    expect(output.textContent).toBe("");
  });

  it("does not fire events when the value does not change", () => {
    stubStep();
    const { input, output } = mount();
    input.stepUp.mockImplementation(() => {});
    const seen = [];
    input.addEventListener("change", () => seen.push("change"));
    input.dispatchEvent(commandEvent("--step-up"));
    expect(seen).toEqual([]);
    expect(output.textContent).toBe("");
  });

  it("matches output for when the id is one of several", () => {
    stubStep();
    const { input } = mount({
      extra: `<output id="shared" for="qty other"></output>`,
    });
    input.dispatchEvent(commandEvent("--step-up"));
    expect(document.getElementById("shared").textContent).toBe("2");
  });
});
