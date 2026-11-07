// Pointer ownership stays separate from the action button. A disabled gesture
// cannot resume until a new pointerdown, even if that finger is still touching.
export function joystickVector(dx, dy, radius = 40, deadZone = 12) {
  const length = Math.hypot(dx, dy);
  const scale = length > radius ? radius / length : 1;
  return {
    x: dx * scale,
    y: dy * scale,
    direction: length <= deadZone ? null : Math.abs(dx) >= Math.abs(dy)
      ? [Math.sign(dx), 0] : [0, Math.sign(dy)],
  };
}
export class ThumbJoystick {
  constructor({ change, paint = () => {}, enabled = () => true }) {
    Object.assign(this, { change, paint, enabled });
    this.pointer = null;
    this.direction = null;
  }
  start(id, x, y) {
    if (this.pointer !== null || !this.enabled()) return false;
    this.pointer = id;
    this.move(id, x, y);
    return true;
  }
  move(id, x, y) {
    if (id !== this.pointer || this.pointer === null) return;
    if (!this.enabled()) return this.reset();
    const v = joystickVector(x, y);
    this.paint(v.x, v.y);
    if (String(v.direction) !== String(this.direction)) {
      this.direction = v.direction;
      this.change(v.direction);
    }
  }
  end(id) {
    if (id === this.pointer) this.reset();
  }
  reset() {
    this.pointer = null;
    this.direction = null;
    this.change(null);
    this.paint(0, 0);
  }
}
export function bindJoystick(element, options) {
  const joystick = new ThumbJoystick({
    ...options,
    paint: (x, y) => {
      element.style.setProperty('--thumb-x', `${x}px`);
      element.style.setProperty('--thumb-y', `${y}px`);
    },
  });
  const offset = (event) => {
    const r = element.getBoundingClientRect();
    return [event.clientX - r.left - r.width / 2, event.clientY - r.top - r.height / 2];
  };
  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !joystick.start(event.pointerId, ...offset(event))) return;
    event.preventDefault();
    element.setPointerCapture(event.pointerId);
  });
  element.addEventListener('pointermove', (event) => {
    if (event.pointerId === joystick.pointer) event.preventDefault();
    joystick.move(event.pointerId, ...offset(event));
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
    element.addEventListener(name, (event) => joystick.end(event.pointerId));
  return joystick;
}
