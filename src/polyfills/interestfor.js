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
 * Does not polyfill `popover="hint"` itself.
 */

const ATTR = 'interestfor';
const START_PROP = '--interest-delay-start';
const END_PROP = '--interest-delay-end';
const SHORTHAND_PROP = '--interest-delay';
const INVOKER_DATA = '__interestForData';
const TARGET_DATA = '__interestForTargetData';

const State = { None: 'none', Full: 'full' };
const Source = {
  Hover: 'hover',
  DeHover: 'dehover',
  Focus: 'focus',
  Blur: 'blur',
};

let done = false;
let InterestEvent;
const invokersWithInterest = new Set();
let touchInProgress = false;

if (
  !done &&
  typeof HTMLButtonElement === 'function' &&
  !Object.prototype.hasOwnProperty.call(HTMLButtonElement.prototype, 'interestForElement')
) {
  done = true;
  install();
}

function install() {
  defineInterestEvent();
  for (const Ctor of invokerConstructors()) {
    defineInterestForElement(Ctor);
  }
  registerDelayProperties();
  addEventHandlers();
}

function invokerConstructors() {
  const ctors = [HTMLButtonElement];
  if (typeof HTMLAnchorElement === 'function') ctors.push(HTMLAnchorElement);
  if (typeof HTMLAreaElement === 'function') ctors.push(HTMLAreaElement);
  if (typeof SVGAElement === 'function') ctors.push(SVGAElement);
  return ctors;
}

function defineInterestEvent() {
  if (typeof globalThis.InterestEvent === 'function') {
    InterestEvent = globalThis.InterestEvent;
    return;
  }

  class InterestEventImpl extends Event {
    #source;

    constructor(type, init = {}) {
      const { source = null, ...eventInit } = init;
      super(type, { bubbles: false, cancelable: true, composed: true, ...eventInit });
      if (source != null && !(source instanceof Element)) {
        throw new TypeError('source must be an Element');
      }
      this.#source = source;
    }

    get source() {
      return this.#source;
    }
  }

  InterestEvent = InterestEventImpl;

  Object.defineProperty(globalThis, 'InterestEvent', {
    configurable: true,
    writable: true,
    value: InterestEvent,
  });
}

function defineInterestForElement(Ctor) {
  if (Object.prototype.hasOwnProperty.call(Ctor.prototype, 'interestForElement')) return;

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
  if (typeof root.getElementById === 'function') return root.getElementById(id);
  return document.getElementById(id);
}

function registerDelayProperties() {
  if (!document.head) return;
  const style = document.createElement('style');
  style.textContent = `@property ${START_PROP} { syntax: "normal | <time>"; inherits: false; initial-value: normal; }
@property ${END_PROP} { syntax: "normal | <time>"; inherits: false; initial-value: normal; }
@property ${SHORTHAND_PROP} { syntax: "[ normal | <time> ]{1,2}"; inherits: false; initial-value: normal; }`;
  document.head.appendChild(style);
}

function parseTimeValue(val) {
  const s = String(val).trim();
  const seconds = s.match(/^([\d.]+)s$/);
  if (seconds) return Number.parseFloat(seconds[1]);
  const ms = s.match(/^([\d.]+)ms$/);
  if (ms) return Number.parseFloat(ms[1]) / 1000;
  return Number.parseFloat(s) || 0;
}

function getDelaySeconds(el, prop) {
  const style = getComputedStyle(el);
  const longhand = style.getPropertyValue(prop).trim();

  if (longhand && longhand.toLowerCase() !== 'normal') {
    return parseTimeValue(longhand);
  }

  const shorthand = style.getPropertyValue(SHORTHAND_PROP).trim();
  if (shorthand && shorthand.toLowerCase() !== 'normal') {
    const parts = shorthand.split(/\s+/).filter((part) => part.length > 0);
    if (parts.length > 0) {
      const first = parts[0];
      const second = parts.length > 1 ? parts[1] : first;
      const fromShorthand = prop === START_PROP ? first : second;
      if (fromShorthand.toLowerCase() !== 'normal') {
        return parseTimeValue(fromShorthand);
      }
    }
  }

  return prop === START_PROP ? 0.5 : 0.25;
}

function getInterestInvoker(target) {
  const inv = target[TARGET_DATA]?.invoker || null;
  return inv && inv[INVOKER_DATA]?.state !== State.None ? inv : null;
}

function onPopoverToggle(event) {
  if (event.newState !== 'closed') return;
  const invoker = event.target[TARGET_DATA]?.invoker;
  if (invoker) gainOrLoseInterest(invoker, event.target, State.None);
}

const focusableSelector = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isPlainHint(target) {
  if (target.getAttribute('popover')?.toLowerCase() !== 'hint') return false;
  if (target.querySelector(focusableSelector)) return false;
  if (
    target.querySelector(
      'h1,h2,h3,h4,h5,h6,ul,ol,li,table,nav,header,footer,main,aside,article,section,form,blockquote,details,summary,dialog',
    )
  ) {
    return false;
  }
  for (const el of target.querySelectorAll('[role]')) {
    const role = el.getAttribute('role').toLowerCase();
    if (!['presentation', 'none', 'generic', 'image'].includes(role)) return false;
  }
  return true;
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

function initializeDataField(el) {
  if (el[INVOKER_DATA]) return;
  el[INVOKER_DATA] = {
    state: State.None,
    gainedTimer: null,
    lostTimer: null,
    longPressTimer: null,
    anchorName: null,
    clearGainedTask() {
      clearTimeout(this.gainedTimer);
    },
    clearLostTask() {
      clearTimeout(this.lostTimer);
    },
  };
  const target = getInterestForTarget(el);
  if (target) setupAccessibility(el, target);
}

function applyState(invoker, newState) {
  const data = invoker[INVOKER_DATA];
  const target = getInterestForTarget(invoker);
  if (newState !== State.Full) throw new Error('Invalid state');
  if (data.state !== State.None) throw new Error('Invalid state');

  const shouldContinue = target.dispatchEvent(
    new InterestEvent('interest', { source: invoker }),
  );
  if (!shouldContinue) return false;

  try {
    target.showPopover({ source: invoker });
  } catch {
    try {
      target.showPopover();
    } catch {
      // already open, or popover="hint" is not a popover in this browser
    }
  }

  data.state = State.Full;
  if (!target[TARGET_DATA]) target[TARGET_DATA] = {};
  target[TARGET_DATA].invoker = invoker;
  if (target.hasAttribute('popover')) {
    target[TARGET_DATA].toggleListener = onPopoverToggle;
    target.addEventListener('toggle', onPopoverToggle);
  }
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
    data.anchorName = anchorName;
  }
  return true;
}

function clearState(invoker, force = false) {
  const data = invoker[INVOKER_DATA];
  if (!data) return;
  clearTimeout(data.gainedTimer);
  clearTimeout(data.lostTimer);
  if (data.state === State.None) return;

  const target = getInterestForTarget(invoker);
  const shouldContinue = target.dispatchEvent(
    new InterestEvent('loseinterest', { source: invoker }),
  );
  if (!force && !shouldContinue) return;

  try {
    target.hidePopover();
  } catch {
    // already closed
  }
  if (target[TARGET_DATA]?.toggleListener) {
    target.removeEventListener('toggle', target[TARGET_DATA].toggleListener);
  }
  target[TARGET_DATA] = null;
  invokersWithInterest.delete(invoker);
  invoker.classList.remove('interest-source');
  target.classList.remove('interest-target');
  if (!isPlainHint(target)) invoker.setAttribute('aria-expanded', 'false');
  if (data.anchorName) {
    invoker.style.anchorName = '';
    target.style.positionAnchor = '';
    data.anchorName = null;
  }
  data.state = State.None;
}

function gainOrLoseInterest(invoker, target, newState) {
  if (!invoker || !target) return false;
  if (
    !invoker.isConnected ||
    getInterestForTarget(invoker) !== target ||
    (newState === State.None && getInterestInvoker(target) !== invoker)
  ) {
    return false;
  }

  if (newState !== State.None) {
    const existing = getInterestInvoker(target);
    if (existing) {
      if (existing === invoker) {
        existing[INVOKER_DATA].clearLostTask();
        return false;
      }
      if (!gainOrLoseInterest(existing, target, State.None)) return false;
      if (!invoker.isConnected || getInterestForTarget(invoker) !== target) return false;
    }
    return applyState(invoker, newState);
  }

  clearState(invoker);
  return true;
}

function scheduleInterestGainedTask(invoker, newState) {
  const delay = getDelaySeconds(invoker, START_PROP) * 1000;
  if (!Number.isFinite(delay) || delay < 0) return;
  invoker[INVOKER_DATA].clearGainedTask();
  invoker[INVOKER_DATA].gainedTimer = setTimeout(() => {
    gainOrLoseInterest(invoker, getInterestForTarget(invoker), newState);
  }, delay);
}

function scheduleInterestLostTask(invoker) {
  const delay = getDelaySeconds(invoker, END_PROP) * 1000;
  if (!Number.isFinite(delay) || delay < 0) return;
  invoker[INVOKER_DATA].clearLostTask();
  invoker[INVOKER_DATA].lostTimer = setTimeout(() => {
    gainOrLoseInterest(invoker, getInterestForTarget(invoker), State.None);
  }, delay);
}

function handleInterestHoverOrFocus(el, source) {
  if (touchInProgress || !el.isConnected) return;

  const target = getInterestForTarget(el);
  if (!target) {
    const containingTarget = el.closest('.interest-target');
    if (!containingTarget) return;
    const upstreamInvoker = getInterestInvoker(containingTarget);
    if (!upstreamInvoker) return;
    if (source === Source.Hover || source === Source.Focus) {
      upstreamInvoker[INVOKER_DATA].clearLostTask();
    } else if (source === Source.Blur || !el.matches(':hover')) {
      scheduleInterestLostTask(upstreamInvoker);
    }
    return;
  }

  initializeDataField(el);
  const data = el[INVOKER_DATA];
  const upstreamInvoker = getInterestInvoker(el);

  if (source === Source.Hover || source === Source.Focus) {
    data.clearLostTask();
    if (upstreamInvoker) upstreamInvoker[INVOKER_DATA].clearLostTask();
    scheduleInterestGainedTask(el, State.Full);
    return;
  }

  data.clearGainedTask();
  if (data.state !== State.None) scheduleInterestLostTask(el);
  if (upstreamInvoker) {
    upstreamInvoker[INVOKER_DATA].clearGainedTask();
    if (source === Source.Blur || !el.matches(':hover')) {
      scheduleInterestLostTask(upstreamInvoker);
    }
  }
}

function addEventHandlers() {
  const handler = (event, source) => {
    for (let node = event.target; node && node !== document; node = node.parentElement) {
      if (node instanceof Element) handleInterestHoverOrFocus(node, source);
    }
  };

  document.addEventListener('mouseover', (event) => handler(event, Source.Hover), true);
  document.addEventListener('mouseout', (event) => handler(event, Source.DeHover), true);
  document.addEventListener('focusin', (event) => handler(event, Source.Focus), true);
  document.addEventListener('focusout', (event) => handler(event, Source.Blur), true);
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape' && event.key !== 'Esc') return;
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
      initializeDataField(invoker);
      invoker[INVOKER_DATA].longPressTimer = setTimeout(() => {
        gainOrLoseInterest(invoker, getInterestForTarget(invoker), State.Full);
        invoker[INVOKER_DATA].longPressTimer = null;
      }, 500);
    },
    true,
  );

  const cancelLongPress = (event) => {
    const invoker = event.target.closest?.('button[interestfor]');
    if (invoker && invoker[INVOKER_DATA]?.longPressTimer) {
      clearTimeout(invoker[INVOKER_DATA].longPressTimer);
      invoker[INVOKER_DATA].longPressTimer = null;
    }
  };
  document.addEventListener('touchend', (event) => {
    cancelLongPress(event);
    touchInProgress = false;
  }, true);
  document.addEventListener('touchmove', cancelLongPress, true);
}
