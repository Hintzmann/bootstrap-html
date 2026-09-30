import { afterEach, describe, expect, it } from "vitest";
import { syncCounts } from "../src/behaviors/count.js";

afterEach(() => {
  document.body.replaceChildren();
});

function mount({ checked = ["email"], extra = "" } = {}) {
  document.body.innerHTML = `
    <fieldset>
      <legend>
        Notify
        <output id="notify-count" data-controls="notify">0<span class="visually-hidden"> selected</span></output>
      </legend>
      <div id="notify">
        <input type="checkbox" value="email" id="n-email"${checked.includes("email") ? " checked" : ""}>
        <input type="checkbox" value="sms" id="n-sms"${checked.includes("sms") ? " checked" : ""}>
      </div>
    </fieldset>
    ${extra}
  `;
  syncCounts();
  return {
    output: document.getElementById("notify-count"),
    email: document.getElementById("n-email"),
    sms: document.getElementById("n-sms"),
  };
}

describe("output[data-controls] count", () => {
  it("writes the initial checked count", () => {
    const { output } = mount({ checked: ["email"] });
    expect(output.textContent).toBe("1 selected");
  });

  it("writes 0 when nothing is checked", () => {
    const { output } = mount({ checked: [] });
    expect(output.textContent).toBe("0 selected");
  });

  it("updates on change and ignores checks outside the container", () => {
    const { output, email, sms } = mount({
      checked: ["email"],
      extra: `<input type="checkbox" id="outsider" checked>`,
    });
    expect(output.textContent).toBe("1 selected");

    sms.checked = true;
    sms.dispatchEvent(new Event("change", { bubbles: true }));
    expect(output.textContent).toBe("2 selected");
    expect(output.querySelector(".visually-hidden")?.textContent).toBe(" selected");

    document.getElementById("outsider").dispatchEvent(new Event("change", { bubbles: true }));
    expect(output.textContent).toBe("2 selected");

    email.checked = false;
    email.dispatchEvent(new Event("change", { bubbles: true }));
    sms.checked = false;
    sms.dispatchEvent(new Event("change", { bubbles: true }));
    expect(output.textContent).toBe("0 selected");
  });

  it("accepts a leading hash on data-controls", () => {
    document.body.innerHTML = `
      <output data-controls="#box">0</output>
      <div id="box"><input type="checkbox" checked></div>
    `;
    syncCounts();
    expect(document.querySelector("output").textContent).toBe("1");
  });
});
