export const species = {
  glimra: {
    name: "Glimra",
    type: "ember",
    color: "#ed9854",
    hp: 28,
    attack: 8,
  },
  strila: { name: "Strila", type: "tide", color: "#77c5c9", hp: 31, attack: 7 },
  knopp: { name: "Knopp", type: "moss", color: "#aac379", hp: 34, attack: 6 },
  vippa: { name: "Vippa", type: "wind", color: "#d9bad7", hp: 22, attack: 6 },
  kolkrabb: {
    name: "Kolkrabb",
    type: "ember",
    color: "#bd735a",
    hp: 30,
    attack: 7,
  },
  tuvling: {
    name: "Tuvling",
    type: "moss",
    color: "#8f9f68",
    hp: 32,
    attack: 7,
  },
  daggla: { name: "Daggla", type: "tide", color: "#89b3d3", hp: 28, attack: 6 },
  ljuskron: {
    name: "Ljuskrön",
    type: "ember",
    color: "#edd58b",
    hp: 36,
    attack: 9,
  },
};
export const typeNames = {
  ember: "Glöd",
  tide: "Vatten",
  moss: "Mossa",
  wind: "Vind",
  neutral: "Neutral",
};
export const starters = ["glimra", "strila", "knopp"];
export const typedMoves = {
  ember: "Glödstänk",
  tide: "Vattenstöt",
  moss: "Rotgrepp",
  wind: "Vindpust",
};
// Fixed coordinates persist when final raster artwork replaces prototype geometry.
export const maps = {
  village: {
    name: "Glödvik",
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
      { x: 5, y: 5, id: "healer", label: "Läkare" },
      { x: 13, y: 5, id: "neighbor", label: "Bo" },
    ],
  },
  route: {
    name: "Sävstigen",
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
    npcs: [{ x: 16, y: 8, id: "liv", label: "Liv" }],
  },
};

export const trainers = {
  liv: {
    name: "Liv",
    flag: "rival",
    team: [["knopp", 4]],
    reward:
      "Liv: Varelserna bär glöden mot fyren. Jag öppnar vägen till Vindryggen!",
  },
  edda: {
    name: "Edda",
    flag: "trainer",
    team: [
      ["vippa", 4],
      ["kolkrabb", 4],
    ],
    reward:
      "Edda: Du tar hand om ditt lag. Källardörren är öppen. Läs inskriften vid skålarna.",
  },
  keeper: {
    name: "Signe",
    flag: "complete",
    team: [
      ["tuvling", 4],
      ["daggla", 4],
      ["ljuskron", 5],
    ],
    reward:
      "Signe: De stal aldrig ljuset. De höll det vid liv. Låt oss öppna fyren tillsammans.",
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
    "Liv vill se hur ni samarbetar innan hon öppnar vägen. Prata med henne.",
});
maps.route.encounters = ["vippa", "daggla", "tuvling"];
maps.ridge = {
  name: "Vindryggen",
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
      locked: "Edda vaktar fyrens nyckel. Prata med henne på stigen.",
    },
  ],
  npcs: [
    { id: "rest", label: "Vila", x: 3, y: 6 },
    { id: "edda", label: "Edda", x: 14, y: 6 },
    { id: "lookout", label: "Utkik", x: 9, y: 3 },
  ],
  encounters: ["kolkrabb", "daggla", "vippa", "ljuskron"],
};
maps.cellar = {
  name: "Fyrkällaren",
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
      locked: "Trappan är förseglad. Tänd skålarna i inskriftens ordning.",
    },
  ],
  npcs: [
    { id: "inscription", label: "Inskrift", x: 4, y: 3 },
    { id: "bowl-tide", label: "Vatten", x: 6, y: 6 },
    { id: "bowl-moss", label: "Mossa", x: 10, y: 6 },
    { id: "bowl-ember", label: "Glöd", x: 14, y: 6 },
    { id: "reset", label: "Återställ", x: 4, y: 8 },
  ],
};
maps.summit = {
  name: "Fyrens krön",
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
    { id: "keeper", label: "Signe", x: 9, y: 4 },
    { id: "rest", label: "Vila", x: 5, y: 8 },
    { id: "beacon", label: "Fyrljus", x: 9, y: 2 },
  ],
};
