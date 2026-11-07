export const species = {
  glimra: {name:'Glimra', type:'ember', color:'#ed9854', hp:28, attack:8},
  strila: {name:'Strila', type:'tide', color:'#77c5c9', hp:31, attack:7},
  knopp: {name:'Knopp', type:'moss', color:'#aac379', hp:34, attack:6},
  vippa: {name:'Vippa', type:'wind', color:'#d9bad7', hp:22, attack:6},
  kolkrabb: {name:'Kolkrabb', type:'ember', color:'#bd735a', hp:30, attack:7},
  tuvling: {name:'Tuvling', type:'moss', color:'#8f9f68', hp:32, attack:7},
  daggla: {name:'Daggla', type:'tide', color:'#89b3d3', hp:28, attack:6},
  ljuskron: {name:'Ljuskrön', type:'ember', color:'#edd58b', hp:36, attack:9},
};
export const typeNames = {ember:'Glöd',tide:'Vatten',moss:'Mossa',wind:'Vind',neutral:'Neutral'};
export const starters = ['glimra','strila','knopp'];
export const typedMoves = {ember:'Glödstänk',tide:'Vattenstöt',moss:'Rotgrepp',wind:'Vindpust'};
// Fixed coordinates persist when final raster artwork replaces prototype geometry.
export const maps = {
  village: {
    name:'Glödvik', start:[4,8],
    rows:[
      '####################',
      '#TTTTTTTTTTTTTTTTTT#',
      '#T................T#',
      '#T..HHH.....HHH...T#',
      '#T..HHH.....HHH...T#',
      '#T...h.......n....T#',
      '#T................T#',
      '#T................T#',
      '#T..................',
      '#T................T#',
      '#T................T#',
      '#TTTTTTTTTTTTTTTTTT#',
      '####################',
    ],
    exits:[{x:19,y:8,map:'route',to:[1,8]}],
    npcs:[{x:5,y:5,id:'healer',label:'Läkare'},{x:13,y:5,id:'neighbor',label:'Bo'}],
  },
  route:{
    name:'Sävstigen', start:[1,8],
    rows:[
      '####################',
      '#TTTTTTTTTTTTTTTTTT#',
      '#T................T#',
      '#T..ggggg..ggggg..T#',
      '#T..ggggg..ggggg..T#',
      '#T..ggggg..ggggg..T#',
      '#T................T#',
      '#T................T#',
      '..................T#',
      '#T................T#',
      '#T..ggggg.........T#',
      '#TTTTTTTTTTTTTTTTTT#',
      '####################',
    ],
    exits:[{x:0,y:8,map:'village',to:[18,8]}],
    npcs:[{x:16,y:8,id:'liv',label:'Liv'}],
  },
};
