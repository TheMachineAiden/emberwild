// Presentation only: paths and small plants do not change walkable tiles.
export function onPath(map, x, y) {
  if (map === "village")
    return (
      y === 8 ||
      ((x === 5 || x === 13) && y >= 5 && y <= 8) ||
      (y === 6 && x >= 4 && x <= 14)
    );
  if (map === "route")
    return (
      y === 8 ||
      (y === 6 && x >= 4 && x <= 17) ||
      (x === 10 && y >= 2 && y <= 8) ||
      (x === 17 && y >= 8 && y <= 10)
    );
  if (map === "ridge")
    return (
      y === 8 ||
      (x === 14 && y >= 5 && y <= 8) ||
      (y === 5 && x >= 14 && x <= 16) ||
      (x === 9 && y >= 4 && y <= 8) ||
      (x === 3 && y === 7)
    );
  if (map === "wrack") return y === 8 || (x === 3 && y >= 6 && y <= 8) ||
    (x === 10 && y >= 3 && y <= 8) || (y === 7 && x >= 10 && x <= 14);
  if (map === "weir") return true;
  if (map === "basin") return y === 8 || (x === 14 && y >= 3 && y <= 8) ||
    (x === 4 && y >= 7 && y <= 8) || (y === 6 && x >= 4 && x <= 16);
  return false;
}
export const decorations = {
  wrack: [["pebbles",5,2],["pebbles",8,4],["reeds",15,4]],
  weir: [["pebbles",6,2],["reeds",16,9]],
  basin: [["flowers",3,3],["flowers",7,4],["reeds",9,3],["reeds",14,4],["flowers",8,9]],
  village: [
    ["flowers", 3, 5],
    ["flowers", 7, 5],
    ["flowers", 11, 5],
    ["flowers", 15, 5],
    ["flowers", 3, 9],
    ["pebbles", 16, 10],
  ],
  route: [
    ["flowers", 3, 3],
    ["flowers", 8, 9],
    ["pebbles", 16, 3],
    ["pebbles", 14, 10],
    ["flowers", 5, 9],
  ],
  ridge: [
    ["pebbles", 10, 10],
    ["pebbles", 13, 4],
    ["pebbles", 17, 7],
    ["flowers", 4, 7],
    ["pebbles", 2, 9],
  ],
};
export const npcArt = {
  rest: "camp",
  neighbor: "perrin",
  liv: "rowan",
  edda: "maren",
  keeper: "alder",
  lookout: "tamsin",
  gatekeeper: "maren",
  haven: "tamsin",
};
