import { scores, eventsFor } from "../music/scores.js";
import { SoundEffects } from "./sfx.js";
const explorationCues = new Set(["village", "route", "landmark"]);
const ZONE_FADE = 0.42;
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
    this.retiring = new Set();
    this.effects = new SoundEffects(() => this.context, () => this.enabled && !this.hidden);
  }
  async toggle() {
    if (this.pending) return this.enabled;
    if (this.enabled) {
      this.enabled = false;
      this.effects.stop();
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
    for (const prior of this.retiring) this.retire(prior, 0.035);
    if (bus) this.retire(bus, 0.035);
  }
  retire(bus, fade) {
    const now = this.context.currentTime, end = now + fade;
    bus.retiring = true;
    const gain = bus.node.gain;
    if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(now);
    else { const value = gain.value; gain.cancelScheduledValues(now); gain.setValueAtTime(value, now); }
    gain.linearRampToValueAtTime(0, end);
    for (const voice of bus.voices) {
      try { voice.stop(end); } catch {}
      this.nodes.delete(voice);
    }
    this.retiring.add(bus);
    clearTimeout(bus.cleanup);
    // Wall-clock disposal also retires future scheduled voices if a browser
    // suspends its audio clock and onended cannot arrive until a later resume.
    bus.cleanup = setTimeout(() => {
      for (const voice of [...bus.voices]) voice.onended?.();
      bus.node.disconnect();
      this.retiring.delete(bus);
      // Rapid exploration changes coalesce to the latest zone. The audible
      // bus retains its own score/loop clock while this fade finishes.
      if (!this.retiring.size && this.enabled && !this.hidden && this.bus &&
          this.bus.id !== this.current) this.replace(ZONE_FADE);
    }, fade * 1000 + 20);
  }
  replace(fade = 0.025) {
    if (fade === ZONE_FADE && this.bus) {
      clearTimeout(this.timer); this.timer = null;
      const prior = this.bus; this.bus = null;
      this.retire(prior, fade);
    } else this.stop();
    this.play(fade);
  }
  setCue(id, { intro = false } = {}) {
    if (this.current === id) return;
    this.current = id;
    this.introPending = intro && this.enabled && !this.hidden;
    const zoneChange = this.bus && explorationCues.has(this.bus.id) && explorationCues.has(id);
    if (zoneChange && this.retiring.size) return;
    this.replace(zoneChange ? ZONE_FADE : 0.025);
  }
  setHidden(hidden) {
    if (this.hidden === hidden) return;
    this.hidden = hidden;
    this.introPending = false;
    this.effects.stop();
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
  play(fade = 0.025) {
    if (!this.enabled || this.hidden || !this.context || !this.current) return;
    if (this.bus && !this.bus.retiring) return;
    const intro = !!this.introPending;
    this.introPending = false;
    const start = this.context.currentTime + 0.04;
    const node = this.context.createGain();
    node.gain.setValueAtTime(0, start);
    node.gain.linearRampToValueAtTime(1, start + fade);
    node.connect(this.context.destination);
    this.bus = { id: this.current, node, voices: new Set(), retiring: false };
    this.schedule(start, intro, this.bus);
  }
  schedule(start, includeIntro = false, bus = this.bus) {
    if (!bus || bus !== this.bus || bus.retiring) return;
    const cue = scores[bus.id], seconds = 60 / cue.bpm;
    // Suspended/late timers can resume at a clean main-section entry, never at
    // the warning. Ordinary boundaries use the exact previous musical clock.
    start = Math.max(start, this.context.currentTime + 0.005);
    if (includeIntro) this.introEnd = start + cue.loopStart * seconds;
    scheduleEvents(this.context, bus, eventsFor(cue, {includeIntro}), cue.bpm, start,
      oscillator => this.nodes.add(oscillator), oscillator => this.nodes.delete(oscillator));
    if (cue.loop) {
      const beats = cue.beats - (includeIntro ? 0 : cue.loopStart || 0);
      const next = start + beats * seconds;
      this.timer = setTimeout(() => this.schedule(next, false, bus),
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
    let cleaned = false;
    oscillator.onended = () => {
      if (cleaned) return;
      cleaned = true;
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
