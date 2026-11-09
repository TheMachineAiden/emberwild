export const species = {
  coaldrill: {name: "Coaldrill", type: "ember", color: "#bc7255", hp: 26, attack: 10},
  vesperknot: {name: "Vesperknot", type: "wind", color: "#829daa", hp: 25, attack: 9},
  bractisel: {name: "Bractisel", type: "moss", color: "#a8b67e", hp: 24, attack: 11},
  kelpurl: {name: "Kelpurl", type: "tide", color: "#7fae9f", hp: 32, attack: 8},
  peatuff: {name: "Peatuff", type: "moss", color: "#7d8854", hp: 46, attack: 4},
  siltippet: {name: "Siltippet", type: "tide", color: "#a8a6bf", hp: 40, attack: 5},
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
    name: "Velune",
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
      "Maren: You look after your companions. The vault is open. The keepers left records beside its apparatus.",
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
        "The vault's mechanism keeps these stairs sealed.",
    },
  ],
  npcs: [
    { id: "inscription", label: "Inscription", x: 4, y: 3 },
    { id: "bowl-tide", label: "Tide", x: 6, y: 6 },
    { id: "bowl-moss", label: "Moss", x: 10, y: 6 },
    { id: "bowl-ember", label: "Ember", x: 14, y: 6 },
    { id: "reset", label: "Reset tablet", x: 4, y: 8 },
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
    clue: "Velune folds its wings around a single spark. Once the wind eases, the ember follows you. It needed shelter, not a cage.",
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

// The return route is revealed by the restored beacon; chapter-one flags remain earned.
const shoreRow = [...maps.ridge.rows[8]];
shoreRow[18] = "."; shoreRow[19] = ".";
maps.ridge.rows[8] = shoreRow.join("");
maps.ridge.exits.push({x:19,y:8,map:"wrack",to:[1,8],requires:"complete",
  locked:"The shore path is too dark to follow. Stillglass must shine again."});
maps.wrack = {
  name:"Wrackwater Reach",start:[1,8],
  rows:[
    "####################",
    "#TTTTTTTTTTTTTTTTTT#",
    "#T................T#",
    "#T...ggg..........T#",
    "#T...ggg..........T#",
    "#T................T#",
    "#T.........ggg....T#",
    "#T.........ggg....T#",
    "..................T#",
    "#T................T#",
    "#T................T#",
    "#TTTTTTTTTTTTTTTTTT#",
    "####################"
  ],
  exits:[{x:0,y:8,map:"ridge",to:[18,8]}],
  npcs:[{id:"rest",label:"Camp",x:3,y:6},
    {id:"channel-record",label:"Dry channel",x:10,y:3},
    {id:"wild-silt-pool",label:"Tide pool",x:13,y:6}],
  encounters:["siltippet","daggla"]
};
export const fieldEncounters = {
  "silt-pool": {species:"siltippet",level:4,title:"A pearl in the shallows",
    clue:"Siltippet cradles its spark beneath a folded fin. It follows the damp channel, then stops where the water disappears."}
};

// The shore opens into the causeway, then the sheltered nursery.
const wrackRow = [...maps.wrack.rows[8]];
wrackRow[18] = "."; wrackRow[19] = ".";
maps.wrack.rows[8] = wrackRow.join("");
maps.wrack.exits.push({x:19,y:8,map:"weir",to:[1,8]});
maps.wrack.npcs.push({id:"wild-wrack-burrow",label:"Warm burrow",x:6,y:3});
maps.wrack.encounters = ["siltippet","coaldrill","daggla"];
maps.wrack.encounterLevel = 4;
maps.weir = {
  name:"Bellwether Weir", start:[1,8], ground:"floor",
  rows:[
    "####################",
    "####################",
    "##......####......##",
    "##......####......##",
    "##......####......##",
    "##................##",
    "##......####......##",
    "##......####......##",
    "....................",
    "##......####......##",
    "##................##",
    "####################",
    "####################"
  ],
  exits:[{x:0,y:8,map:"wrack",to:[18,8]},
    {x:19,y:8,map:"basin",to:[1,8],requires:"weir",locked:"The closed crossing overlooks a dry channel. The weir controls its flow."}],
  npcs:[
    {id:"rest",label:"Camp",x:3,y:4},
    {id:"weir-relief",label:"Pipe relief",x:3,y:2,kind:"prop",art:"seal"},
    {id:"weir-record",label:"Keeper's record",x:6,y:4,kind:"prop",art:"seal"},
    {id:"weir-nests",label:"Nest marks",x:15,y:10,kind:"prop",art:"reeds"},
    {id:"gate-cliff",label:"Cliff",x:7,y:6,kind:"prop",art:"bowl"},
    {id:"gate-reed",label:"Reed",x:12,y:6,kind:"prop",art:"bowl"},
    {id:"gate-foam",label:"Foam",x:16,y:6,kind:"prop",art:"bowl"},
    {id:"weir-test",label:"Test flow",x:10,y:5,kind:"prop",art:"stairs"},
    {id:"weir-reset",label:"Reset",x:6,y:9,kind:"prop",art:"seal"},
    {id:"wild-spillway",label:"Quiet arch",x:4,y:10},
    {id:"wild-orchid-bank",label:"Orchid bank",x:15,y:3},
    {id:"gatekeeper",label:"Maren",x:4,y:6}
  ]
};
maps.basin = {
  name:"Glassreed Basin",start:[1,8],
  rows:[
    "####################",
    "#TTTTTTTTTTTTTTTTTT#",
    "#T................T#",
    "#T..ggg...####....T#",
    "#T..ggg...####....T#",
    "#T........####....T#",
    "#T................T#",
    "#T................T#",
    "..................T#",
    "#T............ggg.T#",
    "#T............ggg.T#",
    "#TTTTTTTTTTTTTTTTTT#",
    "####################"
  ],
  exits:[{x:0,y:8,map:"weir",to:[18,8]}],
  npcs:[{id:"rest",label:"Camp",x:4,y:7},
    {id:"basin-record",label:"Sheltered ledges",x:14,y:3,kind:"prop",art:"reeds"},
    {id:"wild-glass-pool",label:"Kelp shallows",x:16,y:9},
    {id:"wild-peat-shelf",label:"Moss shelf",x:5,y:3},
    {id:"haven",label:"Tamsin",x:14,y:6}],
  encounters:["kelpurl","peatuff","siltippet"],encounterLevel:5
};
Object.assign(fieldEncounters,{
  "wrack-burrow":{species:"coaldrill",level:4,title:"A warm hollow",
    clue:"Coaldrill digs a shallow pocket above the tide line. Its broad paws hold the bank firm while the smaller sparkwards pass."},
  "spillway":{species:"vesperknot",level:5,title:"A wing beneath the arch",
    clue:"Vesperknot folds its sail-like wings around a spark. When spray strikes the arch, its long ears turn toward the quietest passage."},
  "orchid-bank":{species:"bractisel",level:5,title:"A patient watch",
    clue:"Bractisel waits among pale flowers. Its leaf forearms cup the light while its slender feet feel the rising water."},
  "glass-pool":{species:"kelpurl",level:5,title:"A curl in the current",
    clue:"Kelpurl hooks its curled tail around a reed. The current can pass without carrying its warm throat-light away."},
  "peat-shelf":{species:"peatuff",level:5,title:"A steady place to rest",
    clue:"Peatuff settles beside the nursery. Smaller sparkwards shelter against its broad mossy back until the water grows quiet."}
});
trainers.gatekeeper = {
  name:"Maren",flag:"weirPractice",team:[["vesperknot",5],["bractisel",5]],
  reward:"Maren: Those two need different kinds of shelter. Keep watching the water marks; the old keepers built this place around the nests."
};
trainers.haven = {
  name:"Tamsin",flag:"chapterTwo",team:[["kelpurl",3],["peatuff",4]],
  reward:"Tamsin: The passage is safe. Let them come home at their own pace. Stillglass will guide them, and these reeds will keep them warm."
};
