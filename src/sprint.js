// Keyboard and touch own separate holds. Reset discards both, so a suspended
// finger or repeated Shift event cannot silently re-arm sprint after a menu.
export function bindSprint(element, { enabled, change = () => {} }) {
  const held = new Set();
  let pointer = null;
  const paint = () => {
    element.setAttribute('aria-pressed', String(held.size > 0));
    change(held.size > 0);
  };
  const sprint = {
    get active() { return held.size > 0; },
    press(source) {
      if (!enabled() || held.has(source)) return false;
      held.add(source); paint(); return true;
    },
    release(source) { held.delete(source); paint(); },
    reset() { pointer = null; held.clear(); paint(); },
  };
  element.addEventListener('pointerdown', event => {
    if (event.button !== 0 || pointer !== null || !sprint.press('pointer')) return;
    pointer = event.pointerId;
    event.preventDefault();
    element.setPointerCapture(pointer);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    element.addEventListener(name, event => {
      if (event.pointerId !== pointer) return;
      pointer = null;
      sprint.release('pointer');
    });
  }
  // A keyboard-focused button can be held with Space/Enter as well as Shift.
  element.addEventListener('keydown', event => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) sprint.press('button-key');
  });
  element.addEventListener('keyup', event => {
    if ([' ', 'Enter'].includes(event.key)) {
      event.preventDefault(); sprint.release('button-key');
    }
  });
  element.addEventListener('blur', () => sprint.release('button-key'));
  return sprint;
}
