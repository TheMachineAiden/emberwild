// A finite pool-height puzzle: pipe heights and nest marks are separate clues.
export const weirGates = [
  {id:"gate-cliff",label:"Cliff"},
  {id:"gate-reed",label:"Reed"},
  {id:"gate-foam",label:"Foam"},
];
export const weirRecords = {
  "weir-relief": "The carved section follows three pipes: Cliff enters at the pool floor. Reed leaves at a middle sill. Foam leaves through a deeper cut below the sill.",
  "weir-record": "Keeper's record: when water enters a pool, its lowest open outlet sets the level. The sparkwards need a running stream, not a sealed reservoir.",
  "weir-nests": "Reed roots end above the deep cut but below the middle sill. The nest cups sit just above that sill. Keep the roots in a running stream and the cups above water.",
};
export function restoreWeir(saved) {
  if (saved.flags.weir === true) return [true,true,false];
  return Array.isArray(saved.weirGates) && saved.weirGates.length === 3 &&
    saved.weirGates.every(v => typeof v === "boolean") ? [...saved.weirGates] : [false,false,false];
}
export function weirFlow(gates) {
  if (!gates[0]) return "dry";
  if (gates[2]) return "low";
  return gates[1] ? "steady" : "rising";
}
export function touchWeir(s,id) {
  if (weirRecords[id]) return weirRecords[id];
  if (s.flags.weir) return "A gentle stream passes the nest ledges. The way to Glassreed Basin is open.";
  if (id === "weir-reset") {
    s.weirGates = [false,false,false];
    return "The three gates are shut. The test pool settles. No supplies were used.";
  }
  if (id === "weir-test") {
    const flow = weirFlow(s.weirGates);
    if (flow === "dry") return "No fresh water enters. The channel stays dry.";
    if (flow === "low") return "Water rushes out below the reed roots, leaving them exposed. You release the test lever. The gate settings remain.";
    if (flow === "rising") return "The pool rises over the nest cups. You release the test lever. The gate settings remain.";
    s.flags.weir = true;
    return "A steady stream reaches the soot line and spills onward. The roots stay wet and the nest cups stay dry. The eastern crossing opens to Glassreed Basin.";
  }
  const i = weirGates.findIndex(g => g.id === id);
  if (i < 0) return null;
  s.weirGates[i] = !s.weirGates[i];
  return `${weirGates[i].label} gate ${s.weirGates[i] ? "open" : "shut"}. The lever beside the channel tests the flow.`;
}
