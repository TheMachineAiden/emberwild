// Original short chip gestures. Frequencies, pulse spacing and envelopes are
// editable score data; all live and exported effects use the same renderer.
const pulse = (at, duration, from, to = from, level = .025) => ({at, duration, from, to, level});
const square = (...pulses) => ({type: "square", pulses});
const triangle = (...pulses) => ({type: "triangle", pulses});
export const effects = {
  navigate: [square(pulse(0,.025,659,659,.008))],
  confirm: [square(pulse(0,.035,440,659,.011))],
  back: [triangle(pulse(0,.055,440,330,.018))],
  unavailable: [square(pulse(0,.035,147,147,.01),pulse(.055,.035,139,139,.008))],
  save: [triangle(pulse(0,.045,659,659,.023),pulse(.06,.06,880,880,.018))],
  interact: [triangle(pulse(0,.055,440,523,.02))],
  light: [square(pulse(0,.04,659,659,.016),pulse(.065,.07,988,988,.012))],
  reset: [triangle(pulse(0,.09,330,220,.021))],
  reward: [triangle(pulse(0,.05,659,659,.024),pulse(.075,.07,988,988,.02))],
  notice: [square(pulse(0,.035,988,1319,.017))],
  sendout: [triangle(pulse(0,.12,147,659,.027))],
  switch: [triangle(pulse(0,.055,330,220,.022),pulse(.075,.09,220,659,.025))],
  guard: [triangle(pulse(0,.11,220,196,.032)),square(pulse(.015,.045,659,659,.009))],
  heal: [triangle(pulse(0,.05,440),pulse(.065,.05,523),pulse(.13,.075,659,659,.02))],
  "attack-neutral": [square(pulse(0,.045,659,440,.02)),triangle(pulse(.08,.085,165,82,.04))],
  "attack-ember": [square(pulse(0,.025,659,880,.02),pulse(.03,.025,988,1319,.018)),square(pulse(.08,.075,220,110,.028))],
  "attack-tide": [triangle(pulse(0,.035,880,659,.03),pulse(.04,.035,659,587,.025)),triangle(pulse(.09,.095,220,110,.04))],
  "attack-moss": [triangle(pulse(0,.035,330,294,.035),pulse(.045,.035,294,220,.03)),square(pulse(.09,.075,131,98,.018))],
  "attack-wind": [square(pulse(0,.022,1319,988,.012),pulse(.03,.025,988,659,.012)),triangle(pulse(.085,.08,294,147,.035))],
  defeat: [triangle(pulse(0,.15,220,55,.03))],
  "capture-attempt": [square(pulse(0,.04,440,659,.012),pulse(.065,.04,659,880,.012)),triangle(pulse(.12,.11,880,220,.025))],
  "capture-miss": [square(pulse(0,.04,587,440,.016),pulse(.07,.07,330,220,.014))],
  // Capture/victory already have authored music cues. These are small physical
  // closure/contact sounds, never a second celebratory melody.
  capture: [triangle(pulse(0,.075,330,165,.03))],
  victory: [triangle(pulse(0,.08,165,110,.022))],
  loss: [triangle(pulse(0,.18,196,65,.025))],
  flee: [triangle(pulse(0,.12,440,110,.023))],
  xp: [square(pulse(0,.035,880,988,.012),pulse(.055,.04,988,1319,.011))],
  "level-up": [square(pulse(0,.045,659,659,.017),pulse(.06,.045,880,880,.017),pulse(.12,.09,1319,1319,.014))],
};

export const effectDuration = id => Math.max(...effects[id].flatMap(v => v.pulses.map(p => p.at + p.duration)));

export function scheduleEffect(context, destination, id, start) {
  const voices = [];
  for (const part of effects[id]) {
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = part.type;
    gain.gain.setValueAtTime(0, start);
    for (const p of part.pulses) {
      const at = start + p.at, end = at + p.duration;
      oscillator.frequency.setValueAtTime(p.from, at);
      oscillator.frequency.exponentialRampToValueAtTime(p.to, end);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(p.level, at + .003);
      gain.gain.setValueAtTime(p.level, Math.max(at + .003, end - .012));
      gain.gain.linearRampToValueAtTime(0, end);
    }
    oscillator.connect(gain); gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + Math.max(...part.pulses.map(p => p.at + p.duration)) + .005);
    voices.push({oscillator, gain});
  }
  return voices;
}

export class SoundEffects {
  constructor(context, enabled) {
    this.context = context; this.enabled = enabled;
    this.groups = new Set(); this.nodes = new Set(); this.last = new Map();
  }
  play(id, {delay = 0} = {}) {
    const context = this.context();
    if (!effects[id] || !this.enabled() || !context ||
        (context.state && context.state !== "running")) return false;
    const now = context.currentTime;
    if (now - (this.last.get(id) ?? -Infinity) < .06 ||
        this.nodes.size + effects[id].length > 8) return false;
    this.last.set(id, now);
    const node = context.createGain(); node.gain.value = .75; node.connect(context.destination);
    const group = {node, voices: scheduleEffect(context, node, id, now + .005 + delay)};
    this.groups.add(group);
    const dispose = () => {
      if (!this.groups.delete(group)) return;
      clearTimeout(group.timer);
      for (const {oscillator, gain} of group.voices) {
        try { oscillator.stop(context.currentTime); } catch {}
        this.nodes.delete(oscillator); gain.disconnect(); oscillator.disconnect();
      }
      node.disconnect();
    };
    group.dispose = dispose;
    let ended = 0;
    for (const {oscillator} of group.voices) {
      this.nodes.add(oscillator);
      oscillator.onended = () => { if (++ended === group.voices.length) dispose(); };
    }
    group.timer = setTimeout(dispose, (delay + effectDuration(id) + .04) * 1000);
    return true;
  }
  stop() {
    const now = this.context()?.currentTime || 0;
    for (const group of [...this.groups]) {
      for (const {oscillator} of group.voices) { try { oscillator.stop(now); } catch {} }
      group.dispose();
    }
    this.last.clear();
  }
}

export function battleEffect(frame) {
  if (["player-hit", "enemy-hit"].includes(frame.kind))
    return `attack-${frame.moveType || "neutral"}`;
  return ({notice:"unavailable", "capture-attempt":"capture-attempt", capture:"capture",
    "capture-miss":"capture-miss", guard:"guard", heal:"heal", switch:"switch",
    sendout:"sendout", xp:"xp", "level-up":"level-up", faint:"defeat",
    victory:"victory", loss:"loss", flee:"flee"})[frame.kind];
}
