import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/polyfills/invoker-commands.js";

afterEach(() => {
  document.body.replaceChildren();
});

function click(el) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));
}

describe("invoker commands polyfill", () => {
  it("defines commandForElement and CommandEvent", () => {
    document.body.innerHTML = `<button commandfor="d">Open</button><dialog id="d"></dialog>`;
    expect(document.querySelector("button").commandForElement).toBe(document.getElementById("d"));
    const event = new CommandEvent("command", { command: "--x" });
    expect([event.command, event.source, event.cancelable]).toEqual(["--x", null, false]);
  });

  it("opens with show-modal and passes the button value to returnValue on close", () => {
    document.body.innerHTML = `
      <button id="open" commandfor="d" command="show-modal">Open</button>
      <dialog id="d"><button id="delete" commandfor="d" command="close" value="delete">Delete</button></dialog>`;
    const dialog = document.getElementById("d");
    click(document.getElementById("open"));
    expect(dialog.open).toBe(true);
    click(document.getElementById("delete"));
    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("delete");
  });

  it("request-close fires cancel, and a cancel listener keeps the dialog open", () => {
    document.body.innerHTML = `
      <dialog id="d"><button commandfor="d" command="request-close" value="done">Done</button></dialog>`;
    const dialog = document.getElementById("d");
    dialog.showModal();
    const keepOpen = (event) => event.preventDefault();
    dialog.addEventListener("cancel", keepOpen);
    click(dialog.querySelector("button"));
    expect(dialog.open).toBe(true);
    dialog.removeEventListener("cancel", keepOpen);
    click(dialog.querySelector("button"));
    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("done");
  });

  it("runs popover commands", () => {
    document.body.innerHTML = `<button commandfor="p" command="show-popover">Show</button><div id="p" popover></div>`;
    const target = document.getElementById("p");
    target.togglePopover = vi.fn();
    target.showPopover = vi.fn();
    click(document.querySelector("button"));
    expect(target.showPopover).toHaveBeenCalledOnce();
  });

  it("only dispatches a custom command, even one that ends in -popover", () => {
    document.body.innerHTML = `<button id="b" commandfor="p" command="--hide-popover">Go</button><div id="p" popover></div>`;
    const target = document.getElementById("p");
    target.togglePopover = vi.fn();
    target.hidePopover = vi.fn();
    const seen = [];
    target.addEventListener("command", (event) => seen.push([event.command, event.source.id]));
    click(document.getElementById("b"));
    expect(seen).toEqual([["--hide-popover", "b"]]);
    expect(target.hidePopover).not.toHaveBeenCalled();
  });

  it("ignores command values the platform does not define", () => {
    document.body.innerHTML = `
      <button commandfor="p" command="open-popover">A</button>
      <button commandfor="p" command="show-picker">B</button>
      <button commandfor="p" command="show-modal close">C</button>
      <div id="p" popover></div>`;
    const listener = vi.fn();
    document.getElementById("p").addEventListener("command", listener);
    for (const button of document.querySelectorAll("button")) click(button);
    expect(listener).not.toHaveBeenCalled();
  });
});
