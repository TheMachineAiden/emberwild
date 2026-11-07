// Canonical editable scores. Quarter-note beats, C4=MIDI60, R=rest.
// Each token is pitch:occupied duration. Gate ends 0.025s before occupied end.
const score = (bpm, lead, bass, answer, loop = true) => ({
  bpm,
  beats: loop ? 32 : 4,
  loop,
  parts: { lead, bass, answer },
});
// The E-pedal warning is composed into each piece. Only the following eight
// bars repeat; the opening resolves directly onto their A-minor downbeat.
const encounter = (bpm, intro, lead, bass, answer) => ({
  ...score(bpm, lead, bass, answer),
  beats: 35,
  loopStart: 3,
  intro: { beats: 3, parts: intro },
});
export const scores = {
  village: score(
    104,
    "A4:1.5 C5:0.5 D5:1 R:1 | E5:2 D5:1 C5:1 | A4:1 C5:1 E5:1 G5:1 | E5:2 R:2 | F5:1.5 E5:0.5 D5:1 C5:1 | E5:2 C5:1 A4:1 | B4:1 D5:1 E5:1 B4:1 | G4:2 R:2",
    "A2:4 | C3:4 | E3:4 | A2:4 | F2:4 | C3:4 | G2:4 | E2:4",
    "R:3 E4:1 | G4:2 R:2 | R:4 | C5:1 B4:1 A4:2 | R:4 | G4:2 E4:2 | R:4 | B3:2 E4:1 R:1",
  ),
  route: score(
    126,
    "A4:0.75 C5:0.25 D5:1 E5:1 R:1 | G5:1 E5:0.5 D5:0.5 C5:1 A4:1 | D5:1 E5:1 G5:1 A5:1 | G5:2 E5:1 R:1 | F5:1 E5:1 D5:1 C5:1 | A4:0.5 C5:0.5 E5:1 D5:2 | B4:1 D5:1 E5:1 G5:1 | E5:1 D5:1 B4:1 R:1",
    "A2:2 E3:2 | C3:2 G3:2 | D3:2 A2:2 | E3:2 B2:2 | F2:2 C3:2 | A2:2 E3:2 | G2:2 D3:2 | E2:2 G2:1 E2:1",
    "R:3 E4:1 | R:4 | R:4 | B4:1 A4:1 G4:2 | R:4 | E4:2 R:2 | R:4 | G4:1 E4:1 R:2",
  ),
  landmark: score(
    76,
    "A4:2 C5:1 D5:1 | E5:3 R:1 | D5:2 C5:2 | B4:3 R:1 | A4:1 C5:1 D5:2 | F5:3 E5:1 | D5:2 B4:1 G4:1 | A4:2 R:2",
    "A2:4 | A2:4 | D3:4 | E3:4 | F2:4 | D3:4 | E3:4 | E2:4",
    "E4:3 R:1 | R:4 | F4:3 R:1 | G4:2 E4:2 | R:4 | A4:2 R:2 | G4:2 R:2 | B3:3 R:1",
  ),
  battle: encounter(
    150,
    { lead: "E5:0.5 R:0.25 E5:0.25 D5:0.5 C5:0.5 B4:0.5 G#4:0.5",
      bass: "E2:1 E3:0.5 B2:0.5 E3:1", answer: "R:1 B4:0.5 R:1 E4:0.5" },
    "A4:0.75 C5:0.25 D5:0.5 E5:1.5 R:1 | G5:0.5 E5:0.5 D5:1 C5:1 R:1 | A4:0.75 C5:0.25 D5:0.5 E5:0.5 A5:1 G5:1 | E5:1.5 D5:0.5 C5:1 R:1 | F5:1 E5:0.5 D5:0.5 C5:1 A4:1 | C5:0.5 E5:0.5 G5:1 E5:1 R:1 | D5:0.75 E5:0.25 G5:1 B5:1 A5:1 | G5:1 E5:1 D5:0.5 B4:0.5 G#4:0.5 R:0.5",
    "A2:1 E3:0.5 A3:0.5 E3:1 A2:1 | C3:1 G3:0.5 C4:0.5 G3:1 B2:1 | A2:1 E3:0.5 A3:0.5 E3:1 G2:1 | C3:1 G3:1 E3:1 G2:1 | F2:1 C3:0.5 F3:0.5 C3:1 E2:1 | C3:1 G3:1 E3:0.5 G3:0.5 C3:1 | G2:1 D3:0.5 G3:0.5 D3:1 F2:1 | E2:1 B2:1 E3:1 B2:0.5 E3:0.5",
    "R:3 E4:0.5 G4:0.5 | R:3 G4:0.5 E4:0.5 | R:4 | R:3 G4:0.5 E4:0.5 | R:4 | R:3 E4:0.5 G4:0.5 | R:4 | R:3 E4:0.5 B3:0.5",
  ),
  boss: encounter(
    160,
    { lead: "E5:0.5 R:0.25 E5:0.25 F5:0.5 E5:0.5 B4:0.5 G#4:0.5",
      bass: "E2:0.5 B2:0.5 E3:0.5 B2:0.5 E2:1", answer: "R:1 B4:0.5 R:1 E4:0.5" },
    "A4:0.75 C5:0.25 D5:0.5 E5:0.5 A5:1 R:1 | G5:1 E5:0.5 D5:0.5 C5:1 R:1 | F5:0.75 E5:0.25 D5:0.5 C5:0.5 A4:1 C5:1 | B4:1 E5:1 G#5:1 R:1 | A5:1 G5:0.5 E5:0.5 F5:1 D5:1 | E5:1 C5:0.5 D5:0.5 E5:1 R:1 | D5:0.5 E5:0.5 G5:1 B5:1 A5:1 | G5:1 E5:1 D5:0.5 B4:0.5 G#4:0.5 R:0.5",
    "A2:0.5 E3:0.5 A3:1 E3:0.5 A2:0.5 E3:1 | C3:0.5 G3:0.5 C4:1 G3:0.5 C3:0.5 E3:1 | F2:0.5 C3:0.5 F3:1 C3:0.5 F2:0.5 D3:1 | E2:1 B2:0.5 E3:0.5 B2:1 E3:1 | D3:0.5 A3:0.5 D4:1 A3:0.5 D3:0.5 F3:1 | A2:0.5 E3:0.5 A3:1 E3:0.5 A2:0.5 C3:1 | G2:0.5 D3:0.5 G3:1 D3:0.5 G2:0.5 F2:1 | E2:1 B2:0.5 E3:0.5 B2:1 E3:1",
    "R:3 E4:0.5 A4:0.5 | R:3 G4:0.5 E4:0.5 | R:4 | R:3 B4:0.5 E5:0.5 | R:4 | R:3 E4:0.5 A4:0.5 | R:4 | R:3 E4:0.5 B3:0.5",
  ),
  victory: score(
    132,
    "A4:0.5 C5:0.5 D5:0.5 E5:0.5 A5:2",
    "A2:2 A3:2",
    "E4:2 C5:2",
    false,
  ),
  capture: score(
    120,
    "A4:0.75 C5:0.25 D5:1 E5:1 A5:1",
    "A2:2 E3:1 A3:1",
    "R:2 C5:1 E5:1",
    false,
  ),
};
export function eventsFor(cue, { includeIntro = true, loops = 1 } = {}) {
  const events = [];
  const sections = [];
  if (cue.intro && includeIntro) sections.push(cue.intro);
  for (let i = 0; i < loops; i++)
    sections.push({ beats: cue.beats - (cue.loopStart || 0), parts: cue.parts });
  let offset = 0;
  for (const section of sections) {
    for (const [part, line] of Object.entries(section.parts)) {
      let beat = 0;
      for (const token of line.replaceAll("|", " ").split(/\s+/).filter(Boolean)) {
        const [note, length] = token.split(":");
        const duration = Number(length);
        if (note !== "R") events.push({ part, note, beat: offset + beat, duration });
        beat += duration;
      }
      if (beat !== section.beats)
        throw new Error(`${part}: ${beat} beats, expected ${section.beats}`);
    }
    offset += section.beats;
  }
  return events.sort((a,b) => a.beat - b.beat);
}

// Audio's 40ms scheduling lead is included in the visual handoff.
export const entryDuration = (id) => scores[id]?.intro
  ? 40 + scores[id].intro.beats * 60000 / scores[id].bpm : 0;
