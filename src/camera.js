const clamp = (n, low, high) => Math.min(high, Math.max(low, n));

// Logical world pixels keep the authored 24px tiles at an approximately integer
// display scale. The camera may show a little authored boundary terrain beyond
// the collision map to keep a cornered avatar clear of the touch controls.
export function worldCamera(width, height, playerX, playerY, { mapWidth = 480, mapHeight = 312, touch = false, dialogue = false } = {}) {
  const scale = Math.max(2, Math.ceil(width / mapWidth), Math.ceil(height / mapHeight));
  const viewWidth = Math.ceil(width / scale), viewHeight = Math.ceil(height / scale);
  const actorX = playerX * 24 + 12, actorY = playerY * 24 + 12;
  let x = clamp(actorX - viewWidth / 2, 0, Math.max(0, mapWidth - viewWidth));
  let y = clamp(actorY - viewHeight / 2, 0, Math.max(0, mapHeight - viewHeight));
  const side = touch ? Math.min(158, width * .26) : 32;
  const top = 58, bottom = dialogue ? Math.min(height - 80, 220) : touch ? 150 : 38;
  const screenX = (actorX - x) * scale, screenY = (actorY - y) * scale;
  x += (screenX - clamp(screenX, side, width - side)) / scale;
  y += (screenY - clamp(screenY, top, Math.max(top, height - bottom))) / scale;
  return { x: Math.round(x), y: Math.round(y), width: viewWidth, height: viewHeight, scale };
}
