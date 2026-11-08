// Contacts are authored in the 480×240 environment raster, on the upper ground
// plane rather than the ledge face. Project the same cover crop as the image.
export const battleScenes = {
  coast: { ally: [115, 176], enemy: [364, 114] },
  meadow: { ally: [115, 178], enemy: [363, 115] },
  crown: { ally: [120, 177], enemy: [363, 125] },
};

export function battleEnvironment(map, x) {
  if (map === "summit") return "crown";
  if (map === "ridge" || (map === "route" && x >= 13)) return "coast";
  return "meadow";
}

export function battleContacts(environment, width, height) {
  const scale = Math.max(width / 480, height / 240);
  const offsetX = (width - 480 * scale) / 2;
  const offsetY = (height - 240 * scale) / 2;
  return Object.fromEntries(Object.entries(battleScenes[environment]).map(
    ([side, [x, y]]) => [side, [offsetX + x * scale, offsetY + y * scale]],
  ));
}
