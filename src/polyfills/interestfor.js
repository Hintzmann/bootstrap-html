/*! interestfor: Copyright (c) 2025, Mason Freed. BSD-3-Clause, see LICENSE. */

/**
 * Interest Invokers polyfill (`interestfor` / `interestForElement` / InterestEvent).
 *
 * Adapted from Mason Freed’s `interestfor` (BSD-3-Clause,
 * https://github.com/mfreed7/interestfor). Load only after
 * feature-detecting `interestForElement` on `HTMLButtonElement.prototype`.
 *
 * Hover, focus, or a long-press on a button with `interestfor` shows the
 * target popover via `showPopover({ source })`. Delay is read from
 * `--interest-delay-start` / `--interest-delay-end` (native `interest-delay-*`
 * is not readable in getComputedStyle where the CSS properties are missing).
 * They are registered as `normal | <time>` and inherit, like the native
 * properties. The `--interest-delay` shorthand has no registrable syntax, so
 * each of its values must be `normal` or a plain time in s or ms.
 * Does not polyfill `popover="hint"` itself.
 */

const ATTR = 'interestfor';
const START_PROP = '--interest-delay-start';
const END_PROP = '--interest-delay-end';
const SHORTHAND_PROP = '--interest-delay';

const RICH_CONTENT = [
  'a[href]',
  'area[href]',
  ':is(input,select,textarea,button):not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
  'h1,h2,h3,h4,h5,h6,ul,ol,li,table,nav,header,footer,main,aside,article,section,form,blockquote,details,summary,dialog',
  '[role]:not([role="presentation" i],[role="none" i],[role="generic" i],[role="image" i])',
].join(',');

/** Invoker → `{ interest, gainTimer, loseTimer, pressTimer, anchorName }`. */
const invokers = new WeakMap();
/** Target → the invoker that has interest in it. */
const sources = new WeakMap();
const invokersWithInterest = new Set();
let touchInProgress = false;
let InterestEvent = globalThis.InterestEvent;

if (!Object.hasOwn(HTMLButtonElement.prototype, 'interestForElement')) {
  defineInterestEvent();
  registerDelayProperties();
  // SVGAElement is missing outside browsers (happy-dom).
  for (const Ctor of [HTMLButtonElement, HTMLAnchorElement, HTMLAreaElement, globalThis.SVGAElement]) {
    if (Ctor) defineInterestForElement(Ctor);
  }
  addEventHandlers();
}

function defineInterestEvent() {
  if (typeof InterestEvent === 'function') return;

  InterestEvent = class InterestEvent extends Event {
    #source;

    constructor(type, { source = null, ...init } = {}) {
      super(type, init);
      if (source != null && !(source instanceof Element)) {
        throw new TypeError('source must be an Element');
      }
      this.#source = source;
    }

    get source() {
      return this.#source;
    }
  };

  Object.defineProperty(globalThis, 'InterestEvent', {
    configurable: true,
    writable: true,
    value: InterestEvent,
  });
}

function defineInterestForElement(Ctor) {
  if (Object.hasOwn(Ctor.prototype, 'interestForElement')) return;

  Object.defineProperty(Ctor.prototype, 'interestForElement', {
    configurable: true,
    enumerable: true,
    get() {
      return getInterestForTarget(this);
    },
    set(element) {
      if (element == null) {
        this.removeAttribute(ATTR);
        return;
      }
      if (!(element instanceof Element)) {
        throw new TypeError('interestForElement must be an Element or null');
      }
      if (!element.id) {
        throw new TypeError('interestForElement target must have an id');
      }
      this.setAttribute(ATTR, element.id);
    },
  });
}

function getInterestForTarget(el) {
  const id = el.getAttribute(ATTR);
  if (!id) return null;
  const root = el.getRootNode();
  return (root.getElementById ? root : document).getElementById(id);
}

function registerDelayProperties() {
  for (const name of [START_PROP, END_PROP]) {
    try {
      CSS.registerProperty({ name, syntax: 'normal | <time>', inherits: true, initialValue: 'normal' });
    } catch {}
  }
}

function getDelaySeconds(el, gain) {
  const style = getComputedStyle(el);
  const longhand = style.getPropertyValue(gain ? START_PROP : END_PROP).trim().toLowerCase();
  const shorthand = style.getPropertyValue(SHORTHAND_PROP).trim().toLowerCase().split(/\s+/);
  const value = longhand && longhand !== 'normal' ? longhand : (shorthand[gain ? 0 : 1] ?? shorthand[0]);
  const time = /^(\d*\.?\d+)(m?s)$/.exec(value);
  if (!time) return gain ? 0.5 : 0.25;
  return time[2] === 'ms' ? time[1] / 1000 : Number(time[1]);
}

function dispatchInterest(type, invoker, target) {
  return target.dispatchEvent(
    new InterestEvent(type, { cancelable: true, composed: true, source: invoker }),
  );
}

function getInterestInvoker(target) {
  const invoker = sources.get(target);
  return invoker && invokers.get(invoker)?.interest ? invoker : null;
}

function onPopoverToggle(event) {
  if (event.newState !== 'closed') return;
  const invoker = sources.get(event.target);
  if (invoker) gainOrLoseInterest(invoker, event.target, false);
}

function isPlainHint(target) {
  return target.getAttribute('popover')?.toLowerCase() === 'hint' && !target.querySelector(RICH_CONTENT);
}

function setupAccessibility(invoker, target) {
  if (isPlainHint(target)) {
    invoker.setAttribute('aria-describedby', target.id);
    return;
  }
  invoker.setAttribute('aria-details', target.id);
  invoker.setAttribute('aria-expanded', 'false');
  if (!target.hasAttribute('role')) target.setAttribute('role', 'tooltip');
}

function initState(el) {
  let state = invokers.get(el);
  if (state) return state;
  state = {};
  invokers.set(el, state);
  const target = getInterestForTarget(el);
  if (target) setupAccessibility(el, target);
  return state;
}

function gainInterest(invoker) {
  const state = invokers.get(invoker);
  const target = getInterestForTarget(invoker);
  if (state.interest || !dispatchInterest('interest', invoker, target)) return false;

  try {
    target.showPopover({ source: invoker });
  } catch {
    try {
      target.showPopover();
    } catch {
      // already open, or popover="hint" is not a popover in this browser
    }
  }

  state.interest = true;
  sources.set(target, invoker);
  if (target.hasAttribute('popover')) target.addEventListener('toggle', onPopoverToggle);
  invokersWithInterest.add(invoker);
  invoker.classList.add('interest-source');
  target.classList.add('interest-target');
  if (!isPlainHint(target)) invoker.setAttribute('aria-expanded', 'true');

  if (
    getComputedStyle(invoker).anchorName === 'none' &&
    getComputedStyle(target).positionAnchor === 'auto'
  ) {
    const anchorName = `--interest-anchor-${Math.random().toString(36).slice(2)}`;
    invoker.style.anchorName = anchorName;
    target.style.positionAnchor = anchorName;
    state.anchorName = anchorName;
  }
  return true;
}

function clearState(invoker, force = false) {
  const state = invokers.get(invoker);
  if (!state) return;
  clearTimeout(state.gainTimer);
  clearTimeout(state.loseTimer);
  if (!state.interest) return;

  const target = getInterestForTarget(invoker);
  if (!dispatchInterest('loseinterest', invoker, target) && !force) return;

  try {
    target.hidePopover();
  } catch {
    // already closed
  }
  target.removeEventListener('toggle', onPopoverToggle);
  sources.delete(target);
  invokersWithInterest.delete(invoker);
  invoker.classList.remove('interest-source');
  target.classList.remove('interest-target');
  if (!isPlainHint(target)) invoker.setAttribute('aria-expanded', 'false');
  if (state.anchorName) {
    invoker.style.anchorName = '';
    target.style.positionAnchor = '';
    state.anchorName = null;
  }
  state.interest = false;
}

function gainOrLoseInterest(invoker, target, gain) {
  if (
    !target ||
    !invoker.isConnected ||
    getInterestForTarget(invoker) !== target ||
    (!gain && getInterestInvoker(target) !== invoker)
  ) {
    return false;
  }

  if (gain) {
    const existing = getInterestInvoker(target);
    if (existing) {
      if (existing === invoker) {
        clearTimeout(invokers.get(existing).loseTimer);
        return false;
      }
      if (!gainOrLoseInterest(existing, target, false)) return false;
      if (!invoker.isConnected || getInterestForTarget(invoker) !== target) return false;
    }
    return gainInterest(invoker);
  }

  clearState(invoker);
  return true;
}

function scheduleInterest(invoker, gain) {
  const state = invokers.get(invoker);
  const timer = gain ? 'gainTimer' : 'loseTimer';
  clearTimeout(state[timer]);
  state[timer] = setTimeout(() => {
    gainOrLoseInterest(invoker, getInterestForTarget(invoker), gain);
  }, getDelaySeconds(invoker, gain) * 1000);
}

function handleInterest(el, gain, blur) {
  if (touchInProgress || !el.isConnected) return;

  if (!getInterestForTarget(el)) {
    const containingTarget = el.closest('.interest-target');
    if (!containingTarget) return;
    const upstreamInvoker = getInterestInvoker(containingTarget);
    if (!upstreamInvoker) return;
    if (gain) clearTimeout(invokers.get(upstreamInvoker).loseTimer);
    else if (blur || !el.matches(':hover')) scheduleInterest(upstreamInvoker, false);
    return;
  }

  const state = initState(el);
  const upstreamInvoker = getInterestInvoker(el);
  const upstream = upstreamInvoker && invokers.get(upstreamInvoker);

  if (gain) {
    clearTimeout(state.loseTimer);
    if (upstream) clearTimeout(upstream.loseTimer);
    scheduleInterest(el, true);
    return;
  }

  clearTimeout(state.gainTimer);
  if (state.interest) scheduleInterest(el, false);
  if (upstream) {
    clearTimeout(upstream.gainTimer);
    if (blur || !el.matches(':hover')) scheduleInterest(upstreamInvoker, false);
  }
}

function addEventHandlers() {
  const onHoverOrFocus = (event) => {
    const gain = event.type === 'mouseover' || event.type === 'focusin';
    const blur = event.type === 'focusout';
    for (let node = event.target; node && node !== document; node = node.parentElement) {
      if (node instanceof Element) handleInterest(node, gain, blur);
    }
  };
  for (const type of ['mouseover', 'mouseout', 'focusin', 'focusout']) {
    document.addEventListener(type, onHoverOrFocus, true);
  }

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return;
      for (const invoker of [...invokersWithInterest]) clearState(invoker, true);
    },
    true,
  );

  document.addEventListener(
    'touchstart',
    (event) => {
      touchInProgress = true;
      const invoker = event.target.closest?.('button[interestfor]');
      if (!invoker) return;
      const state = initState(invoker);
      state.pressTimer = setTimeout(() => {
        gainOrLoseInterest(invoker, getInterestForTarget(invoker), true);
        state.pressTimer = null;
      }, 500);
    },
    true,
  );

  const cancelLongPress = (event) => {
    const state = invokers.get(event.target.closest?.('button[interestfor]'));
    if (state?.pressTimer) {
      clearTimeout(state.pressTimer);
      state.pressTimer = null;
    }
  };
  document.addEventListener('touchend', (event) => {
    cancelLongPress(event);
    touchInProgress = false;
  }, true);
  document.addEventListener('touchmove', cancelLongPress, true);
}
