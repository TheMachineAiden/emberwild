export const species = {
  glimra: {
    name: "Wickit",
    type: "ember",
    color: "#ed9854",
    hp: 28,
    attack: 8,
  },
  strila: {
    name: "Rillfin",
    type: "tide",
    color: "#77c5c9",
    hp: 31,
    attack: 7,
  },
  knopp: { name: "Buddle", type: "moss", color: "#aac379", hp: 34, attack: 6 },
  vippa: {
    name: "Lunamoth",
    type: "wind",
    color: "#d9bad7",
    hp: 22,
    attack: 6,
  },
  kolkrabb: {
    name: "Cinderclaw",
    type: "ember",
    color: "#bd735a",
    hp: 30,
    attack: 7,
  },
  tuvling: {
    name: "Brambleboar",
    type: "moss",
    color: "#8f9f68",
    hp: 32,
    attack: 7,
  },
  daggla: {
    name: "Brinecrest",
    type: "tide",
    color: "#89b3d3",
    hp: 28,
    attack: 6,
  },
  ljuskron: {
    name: "Dawncrest",
    type: "ember",
    color: "#edd58b",
    hp: 36,
    attack: 9,
  },
};
export const typeNames = {
  ember: "Ember",
  tide: "Tide",
  moss: "Moss",
  wind: "Gale",
  neutral: "Neutral",
};
export const starters = ["glimra", "strila", "knopp"];
export const typedMoves = {
  ember: "Wickflare",
  tide: "Rill Rush",
  moss: "Briarbind",
  wind: "Draftlash",
};
// Fixed coordinates persist when final raster artwork replaces prototype geometry.
export const maps = {
  village: {
    name: "Briarwick",
    start: [4, 8],
    rows: [
      "####################",
      "#TTTTTTTTTTTTTTTTTT#",
      "#T................T#",
      "#T..HHH.....HHH...T#",
      "#T..HHH.....HHH...T#",
      "#T...h.......n....T#",
      "#T................T#",
      "#T................T#",
      "#T..................",
      "#T................T#",
      "#T................T#",
      "#TTTTTTTTTTTTTTTTTT#",
      "####################",
    ],
    exits: [{ x: 19, y: 8, map: "route", to: [1, 8] }],
    npcs: [
      { x: 5, y: 5, id: "healer", label: "Mira" },
      { x: 13, y: 5, id: "neighbor", label: "Perrin" },
    ],
  },
  route: {
    name: "Sedgeway",
    start: [1, 8],
    rows: [
      "####################",
      "#TTTTTTTTTTTTTTTTTT#",
      "#T................T#",
      "#T..ggggg..ggggg..T#",
      "#T..ggggg..ggggg..T#",
      "#T..ggggg..ggggg..T#",
      "#T................T#",
      "#T................T#",
      "..................T#",
      "#T................T#",
      "#T..ggggg.........T#",
      "#TTTTTTTTTTTTTTTTTT#",
      "####################",
    ],
    exits: [{ x: 0, y: 8, map: "village", to: [18, 8] }],
    npcs: [{ x: 16, y: 8, id: "liv", label: "Rowan" }],
  },
};

export const trainers = {
  liv: {
    name: "Rowan",
    flag: "rival",
    team: [["knopp", 4]],
    reward:
      "Rowan: The rise is open! Look for sheltered sparks along the paths. Their guardians may know what happened to Stillglass.",
  },
  edda: {
    name: "Maren",
    flag: "trainer",
    team: [
      ["vippa", 4],
      ["kolkrabb", 4],
    ],
    reward:
      "Maren: You look after your companions. The vault is open. Read the inscription beside the bowls.",
  },
  keeper: {
    name: "Alder",
    flag: "complete",
    team: [
      ["tuvling", 4],
      ["daggla", 4],
      ["ljuskron", 5],
    ],
    reward:
      "Alder: They never stole the light. They kept it alive. Let us open the beacon together.",
  },
};
const routeRow = [...maps.route.rows[8]];
routeRow[18] = ".";
routeRow[19] = ".";
maps.route.rows[8] = routeRow.join("");
maps.route.exits.push({
  x: 19,
  y: 8,
  map: "ridge",
  to: [1, 8],
  requires: "rival",
  locked:
    "Rowan wants to see how your team works together. Speak to them by the eastern path.",
});
maps.route.encounters = ["vippa", "daggla", "tuvling"];
maps.ridge = {
  name: "Saltwind Rise",
  start: [1, 8],
  rows: [
    "####################",
    "#TTTTTTTTTTTTTTTTTT#",
    "#T.............HHHT#",
    "#T..ggggg......HHHT#",
    "#T..ggggg.........T#",
    "#T................T#",
    "#T.....TTTT.......T#",
    "#T.....TTTT.......T#",
    "..................T#",
    "#T....ggggg.......T#",
    "#T....ggggg.......T#",
    "#TTTTTTTTTTTTTTTTTT#",
    "####################",
  ],
  exits: [
    { x: 0, y: 8, map: "route", to: [18, 8] },
    {
      x: 16,
      y: 4,
      map: "cellar",
      to: [3, 10],
      requires: "trainer",
      locked: "Maren carries the vault key. Speak to her on the path.",
    },
  ],
  npcs: [
    { id: "rest", label: "Camp", x: 3, y: 6 },
    { id: "edda", label: "Maren", x: 14, y: 6 },
    { id: "lookout", label: "Tamsin", x: 9, y: 3 },
  ],
  encounters: ["kolkrabb", "daggla", "vippa", "ljuskron"],
};
maps.cellar = {
  name: "Stillglass Vault",
  start: [3, 10],
  rows: [
    "####################",
    "####################",
    "##................##",
    "##................##",
    "##................##",
    "##....##....##....##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "####################",
    "####################",
  ],
  exits: [
    { x: 3, y: 10, map: "ridge", to: [16, 5] },
    {
      x: 16,
      y: 2,
      map: "summit",
      to: [9, 10],
      requires: "puzzle",
      locked:
        "The stairs are sealed. Light the bowls in the order shown by the inscription.",
    },
  ],
  npcs: [
    { id: "inscription", label: "Inscription", x: 4, y: 3 },
    { id: "bowl-tide", label: "Tide", x: 6, y: 6 },
    { id: "bowl-moss", label: "Moss", x: 10, y: 6 },
    { id: "bowl-ember", label: "Ember", x: 14, y: 6 },
    { id: "reset", label: "Reset", x: 4, y: 8 },
  ],
};
maps.summit = {
  name: "Lantern Crown",
  start: [9, 10],
  rows: [
    "####################",
    "####################",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "##................##",
    "####################",
    "####################",
  ],
  exits: [{ x: 9, y: 10, map: "cellar", to: [16, 3] }],
  npcs: [
    { id: "keeper", label: "Alder", x: 9, y: 4 },
    { id: "rest", label: "Camp", x: 5, y: 8 },
    { id: "beacon", label: "Lantern", x: 9, y: 2 },
  ],
};

export const rescues = {
  reed: {
    species: "vippa",
    title: "A spark in the sedge",
    clue: "Lunamoth folds its wings around a single spark. Once the wind eases, the ember follows you. It needed shelter, not a cage.",
  },
  shore: {
    species: "daggla",
    title: "A spark on the shore",
    clue: "Brinecrest shelters a warm spark between its wave-shaped plates. The reef guardian has been carrying the ember above the cold sea spray.",
  },
  cliff: {
    species: "kolkrabb",
    title: "A spark in the stone",
    clue: "Cinderclaw opens a pincer to reveal a steady spark. Stillglass could shine again, if someone dared to set its light free.",
  },
};
maps.route.npcs.push(
  { id: "rescue-reed", label: "Spark", x: 10, y: 2 },
  { id: "rescue-shore", label: "Spark", x: 17, y: 10 },
);
maps.ridge.npcs.push({ id: "rescue-cliff", label: "Spark", x: 12, y: 3 });
