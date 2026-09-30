/**
 * Count checked checkboxes for an <output data-controls>.
 *
 * data-controls is a container id, with no hash — the same shape as
 * commandfor. The module queries input[type=checkbox] inside that node
 * and writes how many are checked. It does not take a CSS selector, and
 * :checked does not belong in the attribute: that is a snapshot, not a
 * group.
 *
 * CSS counters cannot count boxes inside a closed popover (display: none).
 * Checks that live in a popover stay there so they are not tab stops when
 * the menu is closed. There is no CSS path for that count. Visible
 * checkboxes can use :has() and counter() without this module.
 *
 * Listen to change, not a MutationObserver. Observer sees the checked
 * attribute, not the .checked property, so a click and el.checked = true
 * would miss it.
 *
 * Not a pe-* element. The output is already a status live region. Load
 * this module on pages that use output[data-controls]. Without it the
 * controls still work; the output stays at whatever was in the markup.
 */

const OUTPUT = "output[data-controls]";
const CHECK = 'input[type="checkbox"]';

function controlsRoot(output) {
  const raw = output.getAttribute("data-controls");
  if (!raw) return null;
  const id = raw.startsWith("#") ? raw.slice(1) : raw;
  return id ? document.getElementById(id) : null;
}

function writeCount(output, n) {
  const sr = output.querySelector(".visually-hidden");
  if (sr) output.replaceChildren(String(n), sr);
  else output.textContent = String(n);
}

export function syncCount(output) {
  if (!(output instanceof HTMLOutputElement)) return;
  const root = controlsRoot(output);
  if (!root) return;
  writeCount(output, root.querySelectorAll(`${CHECK}:checked`).length);
}

export function syncCounts(scope = document) {
  scope.querySelectorAll(OUTPUT).forEach(syncCount);
}

function onChange(event) {
  const target = event.target;
  if (!(target instanceof Element) || !target.matches(CHECK)) return;
  document.querySelectorAll(OUTPUT).forEach((output) => {
    const root = controlsRoot(output);
    if (root?.contains(target)) syncCount(output);
  });
}

document.addEventListener("change", onChange);
syncCounts();
