import { scores, eventsFor } from "../music/scores.js";
export function cueFor(state) {
  if (state.mode === "battle")
    return state.battle.result === "capture"
      ? "capture"
      : state.battle.result === "win"
        ? "victory"
        : state.battle.trainerId === "keeper"
          ? "boss"
          : "battle";
  if (state.mode === "ending") return "village";
  return state.map === "village"
    ? "village"
    : ["cellar", "summit"].includes(state.map)
      ? "landmark"
      : "route";
}
export class Music {
  constructor() {
    this.enabled = false;
    this.current = null;
    this.nodes = new Set();
    this.timer = null;
    this.context = null;
    this.bus = null;
    this.hidden = false;
  }
  async toggle() {
    if (this.pending) return this.enabled;
    if (this.enabled) {
      this.enabled = false;
      this.stop();
      return false;
    }
    this.context ||= new (globalThis.AudioContext ||
      globalThis.webkitAudioContext)();
    this.pending = true;
    try {
      await this.context.resume();
      this.enabled = true;
      this.play();
      return true;
    } finally {
      this.pending = false;
    }
  }
  stop() {
    clearTimeout(this.timer);
    this.timer = null;
    const bus = this.bus;
    this.bus = null;
    const now = this.context?.currentTime || 0,
      end = now + 0.035;
    if (bus) {
      bus.retiring = true;
      bus.node.gain.cancelScheduledValues(now);
      bus.node.gain.setValueAtTime(bus.node.gain.value, now);
      bus.node.gain.linearRampToValueAtTime(0, end);
      if (!bus.voices.size) bus.node.disconnect();
    }
    for (const oscillator of this.nodes) {
      try {
        oscillator.stop(end);
      } catch {}
    }
    this.nodes.clear();
  }
  setCue(id, { intro = false } = {}) {
    if (this.current === id) return;
    this.current = id;
    this.introPending = intro && this.enabled && !this.hidden;
    this.stop();
    this.play();
  }
  setHidden(hidden) {
    this.hidden = hidden;
    this.introPending = false;
    this.stop();
    if (!hidden) this.play();
  }
  finishIntro(interrupted = false) {
    this.introPending = false;
    if (interrupted && this.context && this.context.currentTime < this.introEnd) {
      this.stop();
      this.play();
    }
  }
  play() {
    if (!this.enabled || this.hidden || !this.context || !this.current) return;
    const intro = !!this.introPending;
    this.introPending = false;
    this.schedule(this.context.currentTime + 0.04, intro);
  }
  schedule(start, includeIntro = false) {
    const cue = scores[this.current], seconds = 60 / cue.bpm;
    // Suspended/late timers can resume at a clean main-section entry, never at
    // the warning. Ordinary boundaries use the exact previous musical clock.
    start = Math.max(start, this.context.currentTime + 0.005);
    if (includeIntro) this.introEnd = start + cue.loopStart * seconds;
    if (!this.bus) {
      const node = this.context.createGain();
      node.gain.setValueAtTime(0, start);
      node.gain.linearRampToValueAtTime(1, start + 0.025);
      node.connect(this.context.destination);
      this.bus = { node, voices: new Set(), retiring: false };
    }
    const bus = this.bus;
    scheduleEvents(this.context, bus, eventsFor(cue, {includeIntro}), cue.bpm, start,
      oscillator => this.nodes.add(oscillator), oscillator => this.nodes.delete(oscillator));
    if (cue.loop) {
      const beats = cue.beats - (includeIntro ? 0 : cue.loopStart || 0);
      const next = start + beats * seconds;
      this.timer = setTimeout(() => this.schedule(next),
        Math.max(0, (next - this.context.currentTime - 0.15) * 1000));
    }
  }
}

export function scheduleEvents(context, bus, events, bpm, start,
  onVoice = () => {}, onEnded = () => {}) {
  const seconds = 60 / bpm;
  for (const event of events) {
    const match = /^([A-G])([#b]?)(\d)$/.exec(event.note),
      pitch =
        { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]] +
        (match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0) +
        (Number(match[3]) + 1) * 12;
    const oscillator = context.createOscillator(),
      gain = context.createGain(),
      at = start + event.beat * seconds,
      end = at + event.duration * seconds;
    oscillator.type = event.part === "bass" ? "triangle" : "square";
    oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    const level =
      event.part === "lead" ? 0.035 : event.part === "bass" ? 0.055 : 0.018;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(level, at + 0.006);
    gain.gain.setValueAtTime(level, Math.max(at + 0.006, end - 0.04));
    gain.gain.linearRampToValueAtTime(0, end - 0.025);
    oscillator.connect(gain);
    gain.connect(bus.node);
    oscillator.start(at);
    oscillator.stop(end);
    onVoice(oscillator);
    bus.voices.add(oscillator);
    oscillator.onended = () => {
      onEnded(oscillator);
      bus.voices.delete(oscillator);
      if (bus.retiring && !bus.voices.size) bus.node.disconnect();
      gain.disconnect();
      oscillator.disconnect();
    };
  }
 }

// Same events, instruments, envelopes and levels as live playback. A review
// export contains one opening and two main cycles, without timer uncertainty.
export async function renderMusicDemo(id, OfflineContext = globalThis.OfflineAudioContext) {
  const cue = scores[id];
  if (!cue?.intro) throw new Error("Review exports require an encounter score.");
  const seconds = (cue.loopStart + 2 * (cue.beats - cue.loopStart)) * 60 / cue.bpm;
  const context = new OfflineContext(1, Math.ceil((seconds + 0.1) * 44100), 44100);
  const node = context.createGain();
  node.gain.setValueAtTime(0, 0.04);
  node.gain.linearRampToValueAtTime(1, 0.065);
  node.connect(context.destination);
  const bus = {node, voices: new Set(), retiring:false};
  scheduleEvents(context, bus, eventsFor(cue, {loops:2}), cue.bpm, 0.04);
  return context.startRendering();
}
