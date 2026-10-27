import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPolyfills } from "../src/polyfills/index.js";

const loaded = vi.hoisted(() => []);

vi.mock("../src/polyfills/invoker-commands.js", () => {
  loaded.push("invoker");
  return {};
});
vi.mock("../src/polyfills/dialog-closedby.js", () => {
  loaded.push("closedby");
  return {};
});
afterEach(() => {
  document.body.replaceChildren();
});

describe("polyfill loader", () => {
  it("checks nothing it does not find on first import", () => {
    expect(loaded).toEqual([]);
  });

  it("loads a fallback for markup a router renders later", async () => {
    const main = document.createElement("main");
    main.innerHTML = `<button commandfor="d" command="show-modal">Open</button><dialog id="d" closedby="any"></dialog>`;
    document.body.append(main);

    await loadPolyfills(main);

    const missing = [
      !("commandForElement" in HTMLButtonElement.prototype) && "invoker",
      !("closedBy" in HTMLDialogElement.prototype) && "closedby",
    ].filter(Boolean);
    expect(loaded).toEqual(missing);
  });

  it("does not re-run a fallback that is already loaded", async () => {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("closedby", "any");
    document.body.append(dialog);
    const before = loaded.length;

    await loadPolyfills(dialog);

    expect(loaded.length).toBe(before);
  });

  it("skips a subtree that uses none of the APIs", async () => {
    const before = loaded.length;
    const section = document.createElement("section");
    section.innerHTML = "<p>Plain text</p>";

    await loadPolyfills(section);

    expect(loaded.length).toBe(before);
  });
});
