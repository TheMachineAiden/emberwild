export function portraitGate(width, height, touch) {
  return touch && width < height && width <= 600;
}
// Request only from the explicit Full screen button. Unsupported and rejected
// requests leave the ordinary viewport layout fully usable.
export async function toggleFullscreen(root, doc, orientation) {
  try {
    if (doc.fullscreenElement) {
      await doc.exitFullscreen();
      return 'exited';
    }
    if (!doc.fullscreenEnabled || !root.requestFullscreen) return 'unavailable';
    await root.requestFullscreen();
    if (orientation?.lock) {
      try { await orientation.lock('landscape'); } catch { /* Rotation gate remains available. */ }
    }
    return 'entered';
  } catch {
    return 'denied';
  }
}
