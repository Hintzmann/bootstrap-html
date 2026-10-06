/**
 * Clamp stacked range thumbs and expose their positions to CSS.
 *
 * There is no CSS path from a range input’s live value: `attr()` reads the
 * content attribute, which does not follow the value while dragging.
 * `<rangegroup>`, `::slider-segment`, and `appearance: base` for range have
 * not shipped. This module writes `--bs-range-lower` / `--bs-range-upper`
 * on `.form-range-group` and clamps thumbs so they do not cross (overlap
 * is allowed). It also writes `output[for~=id]`, same as step.js.
 *
 * Not a pe-* element. Do not add pe-range-group. Load this module on pages
 * that use `.form-range-group`. `data-range-group="off"` on the group skips
 * clamp and fill (the CSS stack stays). Without the module the inputs still
 * work; thumbs can cross and there is no fill.
 */

const GROUP = ".form-range-group";
const LIVE = '.form-range-group:not([data-range-group="off"])';
const RANGE = 'input[type="range"]';
const LOWER = "--bs-range-lower";
const UPPER = "--bs-range-upper";

function rangesIn(group) {
  return [...group.querySelectorAll(RANGE)];
}

function percent(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const span = max - min;
  if (!Number.isFinite(span) || span === 0) return 0;
  const value = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : min;
  return ((value - min) / span) * 100;
}

function outputsFor(input) {
  const id = input.id;
  if (!id) return [];
  return [...document.querySelectorAll("output[for]")].filter((output) => {
    const raw = output.getAttribute("for") ?? "";
    return raw.split(/\s+/).includes(id);
  });
}

function announce(input) {
  for (const output of outputsFor(input)) {
    output.textContent = input.value;
  }
}

function clamp(input, ranges) {
  const i = ranges.indexOf(input);
  if (i < 0) return;
  const prev = ranges[i - 1];
  const next = ranges[i + 1];
  const value = input.valueAsNumber;
  if (prev && Number.isFinite(prev.valueAsNumber) && value < prev.valueAsNumber) {
    input.value = prev.value;
  }
  if (next && Number.isFinite(next.valueAsNumber) && value > next.valueAsNumber) {
    input.value = next.value;
  }
}

function paint(group, ranges) {
  const percents = ranges.map(percent);
  const lower = percents.length ? Math.min(...percents) : 0;
  const upper = percents.length ? Math.max(...percents) : 0;
  group.style.setProperty(LOWER, String(lower));
  group.style.setProperty(UPPER, String(upper));
}

function isLive(group) {
  return group instanceof HTMLElement && group.matches(LIVE);
}

export function syncGroup(group) {
  if (!isLive(group)) return;
  const ranges = rangesIn(group);
  for (const input of ranges) {
    if (!input.disabled && !input.readOnly) clamp(input, ranges);
    announce(input);
  }
  paint(group, ranges);
}

export function syncGroups(scope = document) {
  scope.querySelectorAll(LIVE).forEach(syncGroup);
}

function onInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== "range") return;
  const group = target.closest(GROUP);
  if (!isLive(group)) return;
  if (target.disabled || target.readOnly) return;
  const ranges = rangesIn(group);
  clamp(target, ranges);
  announce(target);
  paint(group, ranges);
}

document.addEventListener("input", onInput, true);
syncGroups();
