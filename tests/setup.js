if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

if (typeof HTMLElement.prototype.scrollIntoView !== "function") {
  HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}

if (typeof HTMLElement.prototype.hidePopover !== "function") {
  HTMLElement.prototype.hidePopover = function hidePopover() {
    this.dispatchEvent(
      Object.assign(new Event("toggle"), { newState: "closed", oldState: "open" }),
    );
  };
}

if (typeof HTMLElement.prototype.showPopover !== "function") {
  HTMLElement.prototype.showPopover = function showPopover() {
    this.dispatchEvent(
      Object.assign(new Event("toggle"), { newState: "open", oldState: "closed" }),
    );
  };
}

const cssProto = typeof CSS === "object" && CSS ? Object.getPrototypeOf(CSS) : null;
if (cssProto && typeof cssProto.supports === "function") {
  const originalSupports = cssProto.supports;
  cssProto.supports = function supports(query, ...rest) {
    if (String(query).includes("::scroll-button")) return false;
    return originalSupports.call(this, query, ...rest);
  };
}

/** CommandEvent is missing in happy-dom. Behaviors read event.command. */
export function commandEvent(command, source = null) {
  const event = new Event("command", { bubbles: false, cancelable: true, composed: true });
  Object.defineProperty(event, "command", { value: command });
  Object.defineProperty(event, "source", { value: source });
  return event;
}

export function keydown(el, key, extra = {}) {
  el.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...extra,
    }),
  );
}
