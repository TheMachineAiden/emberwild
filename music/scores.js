// Canonical editable scores. Quarter-note beats, C4=MIDI60, R=rest.
// Each token is pitch:occupied duration. Gate ends 0.025s before occupied end.
const score=(bpm,lead,bass,answer,loop=true)=>({bpm,beats:loop?32:4,loop,parts:{lead,bass,answer}});
export const scores={
 village:score(104,
 'A4:1.5 C5:0.5 D5:1 R:1 | E5:2 D5:1 C5:1 | A4:1 C5:1 E5:1 G5:1 | E5:2 R:2 | F5:1.5 E5:0.5 D5:1 C5:1 | E5:2 C5:1 A4:1 | B4:1 D5:1 E5:1 B4:1 | G4:2 R:2',
 'A2:4 | C3:4 | E3:4 | A2:4 | F2:4 | C3:4 | G2:4 | E2:4',
 'R:3 E4:1 | G4:2 R:2 | R:4 | C5:1 B4:1 A4:2 | R:4 | G4:2 E4:2 | R:4 | B3:2 E4:1 R:1'),
 route:score(126,
 'A4:0.75 C5:0.25 D5:1 E5:1 R:1 | G5:1 E5:0.5 D5:0.5 C5:1 A4:1 | D5:1 E5:1 G5:1 A5:1 | G5:2 E5:1 R:1 | F5:1 E5:1 D5:1 C5:1 | A4:0.5 C5:0.5 E5:1 D5:2 | B4:1 D5:1 E5:1 G5:1 | E5:1 D5:1 B4:1 R:1',
 'A2:2 E3:2 | C3:2 G3:2 | D3:2 A2:2 | E3:2 B2:2 | F2:2 C3:2 | A2:2 E3:2 | G2:2 D3:2 | E2:2 G2:1 E2:1',
 'R:3 E4:1 | R:4 | R:4 | B4:1 A4:1 G4:2 | R:4 | E4:2 R:2 | R:4 | G4:1 E4:1 R:2'),
 landmark:score(76,
 'A4:2 C5:1 D5:1 | E5:3 R:1 | D5:2 C5:2 | B4:3 R:1 | A4:1 C5:1 D5:2 | F5:3 E5:1 | D5:2 B4:1 G4:1 | A4:2 R:2',
 'A2:4 | A2:4 | D3:4 | E3:4 | F2:4 | D3:4 | E3:4 | E2:4',
 'E4:3 R:1 | R:4 | F4:3 R:1 | G4:2 E4:2 | R:4 | A4:2 R:2 | G4:2 R:2 | B3:3 R:1'),
 battle:score(148,
 'A4:0.5 A4:0.5 C5:0.5 D5:0.5 E5:1 R:1 | E5:0.5 G5:0.5 E5:1 D5:1 C5:1 | D5:0.5 D5:0.5 E5:0.5 G5:0.5 A5:1 G5:1 | E5:2 B4:1 R:1 | F5:1 E5:0.5 D5:0.5 C5:1 A4:1 | C5:0.5 D5:0.5 E5:1 G5:1 E5:1 | D5:1 B4:1 G4:1 B4:1 | E5:1 D5:0.5 B4:0.5 A4:1 R:1',
 'A2:1 E3:1 A2:1 E3:1 | C3:1 G3:1 C3:1 G3:1 | D3:1 A3:1 D3:1 A3:1 | E3:1 B2:1 E3:1 B2:1 | F2:1 C3:1 F2:1 C3:1 | C3:1 G3:1 C3:1 G3:1 | G2:1 D3:1 G2:1 D3:1 | E2:1 B2:1 E3:1 G2:1',
 'R:3 E4:1 | G4:2 R:2 | R:4 | G4:1 E4:1 R:2 | R:4 | G4:2 R:2 | R:4 | B3:2 E4:1 R:1'),
 boss:score(156,
 'A4:1 C5:0.5 D5:0.5 E5:1 A5:1 | G5:1 E5:1 D5:1 C5:1 | F5:0.5 E5:0.5 D5:1 A4:1 C5:1 | B4:2 E5:1 R:1 | A5:1 G5:0.5 E5:0.5 F5:1 D5:1 | E5:1 C5:1 A4:1 C5:1 | D5:0.5 E5:0.5 G5:1 B5:1 A5:1 | G5:1 E5:1 B4:1 R:1',
 'A2:1 A3:1 E3:1 A3:1 | C3:1 C4:1 G3:1 C4:1 | F2:1 F3:1 C3:1 F3:1 | E2:1 E3:1 B2:1 E3:1 | D3:1 D4:1 A3:1 D4:1 | A2:1 A3:1 E3:1 A3:1 | G2:1 G3:1 D3:1 G3:1 | E2:1 E3:1 B2:1 G2:1',
 'E4:2 R:2 | G4:2 R:2 | A4:2 R:2 | G4:1 E4:1 R:2 | A4:2 R:2 | E4:2 R:2 | B4:2 R:2 | G4:1 E4:1 R:2'),
 victory:score(132,'A4:0.5 C5:0.5 D5:0.5 E5:0.5 A5:2','A2:2 A3:2','E4:2 C5:2',false),
 capture:score(120,'A4:0.75 C5:0.25 D5:1 E5:1 A5:1','A2:2 E3:1 A3:1','R:2 C5:1 E5:1',false),
};
export function eventsFor(cue){
 const events=[];
 for(const [part,line] of Object.entries(cue.parts)){
  let beat=0;
  for(const token of line.replaceAll('|',' ').split(/\s+/).filter(Boolean)){
   const [note,length]=token.split(':');const duration=Number(length);
   if(note!=='R')events.push({part,note,beat,duration});beat+=duration;
  }
  if(beat!==cue.beats)throw new Error(`${part}: ${beat} beats, expected ${cue.beats}`);
 }
 return events;
}
