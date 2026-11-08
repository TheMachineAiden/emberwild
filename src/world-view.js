// Rasterise the final screen-space coordinates once, at physical pixel scale.
// The logical camera/collision grid remains independent of device resolution.
export function rasterSize(width, height, dpr = 1) {
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return {width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio))};
}

export function projectWorldRect(camera, raster, cssWidth, cssHeight, x, y, width, height) {
  const sx = camera.scale * raster.width / cssWidth;
  const sy = camera.scale * raster.height / cssHeight;
  // Algebraically equal half-pixel centers can differ by floating-point dust
  // after camera subtraction. Keep their tie-break stable across frames.
  const pixel = value => Math.round(value + 1e-7);
  const left = pixel((x - camera.x) * sx);
  const top = pixel((y - camera.y) * sy);
  // Shared rounded edges leave no seams between adjacent terrain tiles.
  return [left, top, pixel((x + width - camera.x) * sx) - left,
    pixel((y + height - camera.y) * sy) - top];
}

// Labels are native DOM text, outside the deliberately pixelated art raster.
export class WorldLabels {
  constructor(root) { this.root = root; this.labels = new Map(); }
  begin() { for (const label of this.labels.values()) label.used = false; }
  place(id, text, x, y, viewportWidth, {actor = false, left = false} = {}) {
    let label = this.labels.get(id);
    if (!label) {
      const element = document.createElement('span');
      element.className = 'world-label' + (actor ? ' actor-label' : '');
      element.textContent = text;
      this.root.append(element);
      label = {element, width:element.offsetWidth};
      this.labels.set(id,label);
    }
    label.used = true;
    if (label.element.hidden) label.element.hidden = false;
    const anchor = actor ? (left ? label.width : 0) : label.width / 2;
    const px = Math.max(4,Math.min(viewportWidth-label.width-4,x-anchor));
    const transform = `translate(${px}px, ${y}px)`;
    if (label.transform !== transform) {
      label.element.style.transform = transform;
      label.transform = transform;
    }
  }
  end() { for (const label of this.labels.values()) {
    if (label.element.hidden === label.used) label.element.hidden = !label.used;
  } }
}
