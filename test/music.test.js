import test from "node:test";
import assert from "node:assert/strict";
import { scores, eventsFor } from "../music/scores.js";
import { Music, cueFor } from "../src/audio.js";
import { newGame, chooseStarter, startBattle } from "../src/engine.js";
test("all seven canonical scores have valid pitches, matching part lengths and no channel overlaps", () => {
  assert.equal(Object.keys(scores).length, 7);
  for (const cue of Object.values(scores)) {
    const ends = {};
    for (const event of eventsFor(cue)) {
      assert.match(event.note, /^[A-G][#b]?\d$/);
      assert.ok(event.duration > 0);
      assert.ok(event.beat >= (ends[event.part] || 0));
      ends[event.part] = event.beat + event.duration;
      assert.ok(ends[event.part] <= cue.beats);
    }
  }
});
test("audio routing follows gameplay and muted construction creates no context or timer", () => {
  const music = new Music();
  music.setCue("village");
  assert.equal(music.context, null);
  assert.equal(music.timer, null);
  const s = newGame();
  chooseStarter(s, "glimra");
  assert.equal(cueFor(s), "village");
  s.map = "ridge";
  assert.equal(cueFor(s), "route");
  startBattle(s, "knopp", "keeper");
  assert.equal(cueFor(s), "boss");
  s.battle.result = "capture";
  assert.equal(cueFor(s), "capture");
  music.stop();
  assert.equal(music.nodes.size, 0);
});

test("gesture start, cue replacement, hide/resume and mute retire voices after a short fade", async () => {
  const previous = globalThis.AudioContext;
  const gains = [],
    voices = [];
  class Param {
    constructor() {
      this.value = 1;
      this.events = [];
    }
    setValueAtTime(value, time) {
      this.events.push(["set", value, time]);
      this.value = value;
    }
    linearRampToValueAtTime(value, time) {
      this.events.push(["ramp", value, time]);
    }
    cancelScheduledValues(time) {
      this.events.push(["cancel", time]);
    }
  }
  class Context {
    constructor() {
      this.currentTime = 10;
      this.destination = {};
      this.resumes = 0;
    }
    async resume() {
      this.resumes++;
    }
    createGain() {
      const gain = {
        gain: new Param(),
        connect() {},
        disconnect() {
          this.disconnected = true;
        },
      };
      gains.push(gain);
      return gain;
    }
    createOscillator() {
      const voice = {
        frequency: {},
        starts: [],
        stops: [],
        connect() {},
        disconnect() {},
        start(t) {
          this.starts.push(t);
        },
        stop(t) {
          this.stops.push(t);
        },
      };
      voices.push(voice);
      return voice;
    }
  }
  globalThis.AudioContext = Context;
  const music = new Music();
  try {
    music.setCue("village");
    assert.equal(voices.length, 0);
    assert.equal(await music.toggle(), true);
    assert.equal(music.context.resumes, 1);
    const firstBus = music.bus,
      firstVoices = [...music.nodes],
      count = voices.length;
    music.setCue("village");
    assert.equal(voices.length, count);
    music.setCue("battle");
    assert.notEqual(music.bus, firstBus);
    assert.ok(
      firstBus.node.gain.events.some(
        ([kind, value]) => kind === "ramp" && value === 0,
      ),
    );
    for (const voice of firstVoices) {
      assert.equal(voice.stops.at(-1), 10.035);
      voice.onended();
    }
    assert.equal(firstBus.node.disconnected, true);
    assert.ok(music.nodes.size > 0);
    music.setHidden(true);
    assert.equal(music.nodes.size, 0);
    assert.equal(music.timer, null);
    music.setCue("route");
    assert.equal(music.nodes.size, 0);
    music.setHidden(false);
    assert.ok(music.nodes.size > 0);
    assert.equal(await music.toggle(), false);
    assert.equal(music.nodes.size, 0);
    assert.equal(music.timer, null);
    assert.equal(music.bus, null);
  } finally {
    music.stop();
    globalThis.AudioContext = previous;
  }
});
