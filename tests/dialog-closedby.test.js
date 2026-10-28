import { afterEach, describe, expect, it } from "vitest";
import "../src/polyfills/dialog-closedby.js";

afterEach(() => {
  document.body.replaceChildren();
});

function openDialog(closedby) {
  document.body.innerHTML = `<dialog closedby="${closedby}"></dialog>`;
  const dialog = document.querySelector("dialog");
  dialog.showModal();
  return dialog;
}

describe("dialog closedby polyfill", () => {
  it("reflects known values and returns an empty string otherwise", () => {
    const dialog = document.createElement("dialog");
    expect(dialog.closedBy).toBe("");
    dialog.setAttribute("closedby", "ANY");
    expect(dialog.closedBy).toBe("any");
    dialog.closedBy = "bogus";
    expect(dialog.getAttribute("closedby")).toBe("bogus");
    expect(dialog.closedBy).toBe("");
    dialog.closedBy = "";
    expect(dialog.hasAttribute("closedby")).toBe(false);
  });

  it("closes closedby=any on a click outside its box", () => {
    const dialog = openDialog("any");
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 }));
    expect(dialog.open).toBe(false);
  });

  it("keeps closedby=closerequest open on a click outside its box", () => {
    const dialog = openDialog("closerequest");
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 10, clientY: 10 }));
    expect(dialog.open).toBe(true);
  });

  it("cancels the close request for closedby=none", () => {
    const dialog = openDialog("none");
    const cancel = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
  });
});
