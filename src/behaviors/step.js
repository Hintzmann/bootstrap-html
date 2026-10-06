/**
 * Step a numeric or temporal <input> from invoker buttons.
 *
 * Buttons use command="--step-up" or command="--step-down" and commandfor
 * set to the input id, with no hash — the same id as label[for]. There is
 * no declarative step-up / step-down command: it was in the early Invoker
 * Commands proposal and did not ship. HTMLInputElement.stepUp() /
 * stepDown() also fire no input or change events, so :user-invalid,
 * <output for>, and form listeners would miss the new value.
 *
 * The command event does not bubble. This module listens on document in
 * the capture phase so it sees both native CommandEvent and the invoker
 * polyfill, which dispatch on commandForElement.
 *
 * Types that support step: number, range, date, month, week, time,
 * datetime-local. min, max, and step stay on the input. step="any" and
 * types without step throw InvalidStateError; those commands are ignored.
 *
 * Optional <output for="id"> is a status live region. The module writes
 * the new value on a button press so assistive technology announces it
 * while focus stays on the button. Typing does not go through this path.
 *
 * Not a pe-* element. Do not add pe-step. Load this module on pages that
 * use those commands. Without it the input still works; the buttons do
 * nothing.
 */

const UP = "--step-up";
const DOWN = "--step-down";

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

export function stepInput(input, direction) {
  if (!(input instanceof HTMLInputElement)) return;
  if (input.disabled || input.readOnly) return;
  const before = input.value;
  try {
    if (direction === "up") input.stepUp();
    else input.stepDown();
  } catch {
    return;
  }
  if (input.value === before) return;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  announce(input);
}

function onCommand(event) {
  if (event.command !== UP && event.command !== DOWN) return;
  if (!(event.target instanceof HTMLInputElement)) return;
  stepInput(event.target, event.command === UP ? "up" : "down");
}

document.addEventListener("command", onCommand, true);
