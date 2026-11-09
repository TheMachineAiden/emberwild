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
  place(id, text, x, y, viewportWidth, {actor = false, left = false, notice = false, avoid = []} = {}) {
    let label = this.labels.get(id);
    if (!label) {
      const element = document.createElement('span');
      element.className = 'world-label' + (actor ? ' actor-label' : '') + (notice ? ' notice-label' : '');
      this.root.append(element);
      label = {element, text:null, width:0};
      this.labels.set(id,label);
    }
    label.used = true;
    if (label.element.hidden) label.element.hidden = false;
    if (label.text !== text) {
      label.element.textContent = text;
      label.text = text;
      label.width = label.element.offsetWidth;
    }
    const anchor = actor ? (left ? label.width : 0) : label.width / 2;
    const px = Math.max(4,Math.min(viewportWidth-label.width-4,x-anchor));
    // A four-tile vertical sight line can begin just above the viewport. Keep
    // the notice visible at its edge while the trainer enters the view.
    let py = notice ? Math.max(4, y) : y;
    // Keep interactive apparatus readouts clear of the persistent touch HUD.
    // Use the actual safe-area-aware bounds, leaving the world/camera untouched.
    for (const region of avoid) {
      if (px < region.right + 6 && px + label.width > region.left - 6 &&
          py < region.bottom + 6 && py + 18 > region.top - 6) py = region.bottom + 6;
    }
    const transform = `translate(${px}px, ${py}px)`;
    if (label.transform !== transform) {
      label.element.style.transform = transform;
      label.transform = transform;
    }
  }
  end() { for (const label of this.labels.values()) {
    if (label.element.hidden === label.used) label.element.hidden = !label.used;
  } }
}
