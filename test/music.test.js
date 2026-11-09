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

test("encounter opening, exact loop clocks and interruptions never replay the warning", async () => {
  const oldSet = globalThis.setTimeout, oldClear = globalThis.clearTimeout;
  const timers = new Map(), voices = [], gains = [];
  let timerId = 0;
  const param = () => ({value:1, setValueAtTime(){}, linearRampToValueAtTime(){}, cancelScheduledValues(){}});
  const context = {
    currentTime:10, destination:{},
    createGain() { const g = {gain:param(),connect(){},disconnect(){}}; gains.push(g); return g; },
    createOscillator() { const v = {frequency:{}, connect(){},disconnect(){}, start(at){this.at=at;},stop(at){this.end=at;}}; voices.push(v); return v; },
  };
  globalThis.setTimeout = (fn,ms) => {timers.set(++timerId,{fn,ms});return timerId;};
  globalThis.clearTimeout = id => timers.delete(id);
  const music = new Music();
  try {
    music.context = context;
    music.setCue("battle", {intro:true});
    assert.equal(voices.length,0); // Sound off schedules nothing, including the opening.
    music.enabled = true;
    music.play();
    const a4 = 440, e5 = 440 * 2 ** (7/12);
    assert.equal(voices[0].frequency.value,a4); // Late enable starts the main section.
    music.setCue("route");
    const before = voices.length;
    music.setCue("battle", {intro:true});
    const entry = voices.slice(before);
    assert.equal(entry[0].frequency.value,e5);
    assert.equal(entry[0].at,10.04);
    assert.ok(entry.some(v => v.frequency.value === a4 && Math.abs(v.at-11.24)<1e-9));
    const bus = music.bus, count = voices.length;
    music.setCue("battle", {intro:true});
    assert.equal(voices.length,count); // Command renders do not retrigger.
    for (let cycle=0; cycle<2; cycle++) {
      const timer = timers.get(music.timer);
      const previousCount = voices.length;
      context.currentTime = 10.04 + (35 + cycle*32)*0.4 - 0.15;
      timer.fn();
      assert.equal(music.bus,bus); // No track/bus restart at the join or repeat.
      const next = voices[previousCount];
      assert.equal(next.frequency.value,a4);
      assert.ok(Math.abs(next.at-(10.04+(35+cycle*32)*0.4))<1e-9);
    }
    music.setHidden(true);
    assert.equal(music.nodes.size,0);
    music.setHidden(false);
    assert.equal(voices.at(-eventsFor(scores.battle,{includeIntro:false}).length).frequency.value,a4);
    music.setCue("route");
    music.setCue("boss", {intro:true});
    const openingBus = music.bus;
    music.finishIntro(true);
    assert.notEqual(music.bus,openingBus);
    assert.equal(voices.at(-eventsFor(scores.boss,{includeIntro:false}).length).frequency.value,a4);
    music.setCue("capture");
    assert.equal(music.timer,null);
    assert.equal(await music.toggle(),false);
    assert.equal(music.nodes.size,0);
  } finally {
    music.stop();
    globalThis.setTimeout = oldSet;
    globalThis.clearTimeout = oldClear;
  }
});

test("intro and two-loop event spans retain three monophonic channels, release gaps and musical joins", () => {
  for (const name of ["battle","boss"]) {
    const cue = scores[name], events = eventsFor(cue,{loops:3});
    const ends = {};
    for (const event of events) {
      assert.ok(event.beat >= (ends[event.part] || 0));
      ends[event.part] = event.beat + event.duration;
      assert.ok(event.duration*60/cue.bpm > 0.04);
    }
    assert.equal(cue.intro.beats,cue.loopStart);
    for (const boundary of [3,35,67]) {
      const leadBefore = events.filter(e => e.part==='lead' && e.beat<boundary).at(-1);
      const leadAfter = events.find(e => e.part==='lead' && e.beat===boundary);
      assert.equal(leadBefore.note,'G#4');
      assert.equal(leadAfter.note,'A4');
      assert.equal(events.find(e => e.part==='bass' && e.beat===boundary).note,'A2');
    }
  }
});

test('rapid zone requests coalesce behind one crossfade and retire on mute/hide', () => {
  const oldSet=globalThis.setTimeout, oldClear=globalThis.clearTimeout;
  const timers=new Map(), voices=[]; let id=0;
  const param=()=>({value:1,events:[],setValueAtTime(v,t){this.value=v;this.events.push(['set',v,t]);},linearRampToValueAtTime(v,t){this.events.push(['ramp',v,t]);},cancelScheduledValues(){}});
  const context={currentTime:10,destination:{},
    createGain(){return {gain:param(),connect(){},disconnect(){this.disconnected=true;}};},
    createOscillator(){const v={frequency:{},connect(){},disconnect(){this.disconnected=true;},start(at){this.at=at;},stop(at){this.end=at;}};voices.push(v);return v;}};
  globalThis.setTimeout=(fn,ms)=>{timers.set(++id,{fn,ms});return id;};
  globalThis.clearTimeout=handle=>timers.delete(handle);
  const music=new Music(); music.context=context; music.enabled=true;
  const fire=handle=>{const timer=timers.get(handle);assert.ok(timer);timers.delete(handle);timer.fn();};
  try {
    music.setCue('village'); const village=music.bus;
    music.setCue('route'); const route=music.bus, count=voices.length;
    const staleLoop = timers.get(music.timer).fn;
    assert.equal(music.retiring.size,1);
    assert.ok(village.node.gain.events.some(([kind,v,t])=>kind==='ramp'&&v===0&&Math.abs(t-10.42)<1e-9));
    assert.ok(route.node.gain.events.some(([kind,v,t])=>kind==='ramp'&&v===1&&Math.abs(t-10.46)<1e-9));
    for(let i=0;i<100;i++) music.setCue(i%2?'village':'landmark');
    music.setCue('landmark');
    assert.equal(music.bus,route); assert.equal(music.current,'landmark');
    assert.equal(voices.length,count); assert.equal(music.retiring.size,1);
    context.currentTime=10.5; fire(village.cleanup);
    assert.equal(village.voices.size,0); assert.equal(village.node.disconnected,true);
    assert.equal(music.bus.id,'landmark'); assert.equal(music.retiring.size,1);
    const afterReplacement = voices.length, currentTimer = music.timer;
    staleLoop();
    assert.equal(voices.length, afterReplacement);
    assert.equal(music.timer, currentTimer);
    const current=music.bus; music.setHidden(false); assert.equal(music.bus,current,'duplicate visible event does not restart music');
    music.setHidden(true); assert.equal(music.nodes.size,0); assert.equal(music.timer,null);
    for(const bus of [...music.retiring]) fire(bus.cleanup);
    assert.equal(music.retiring.size,0);
    assert.ok(voices.every(v=>v.disconnected));
    music.setHidden(false); const audible=music.bus;
    music.setCue('battle',{intro:true}); assert.notEqual(music.bus,audible);
    const battle=music.bus; music.setCue('battle',{intro:true}); assert.equal(music.bus,battle);
    music.enabled=false; music.stop();
    for(const bus of [...music.retiring]) fire(bus.cleanup);
    assert.equal(music.nodes.size,0); assert.equal(music.retiring.size,0);
  } finally {
    music.enabled=false; music.stop();
    globalThis.setTimeout=oldSet;globalThis.clearTimeout=oldClear;
  }
});

test('persisted music and effects preferences are independent and remain silent before a gesture', async()=>{
  const old=globalThis.AudioContext, values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){}});
  class Context {
    constructor(){this.currentTime=10;this.state='suspended';this.destination={};this.resumes=0;}
    async resume(){this.resumes++;this.state='running';}
    createGain(){return {gain:param(),connect(){},disconnect(){}};}
    createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){},stop(){}};}
  }
  globalThis.AudioContext=Context;const m=new Music({storage});
  try {
    m.setCue('village');assert.equal(m.context,null);assert.equal(m.effectsEnabled,true);
    await m.unlock();assert.equal(m.context.resumes,1);assert.equal(m.nodes.size,0);
    await m.toggle();assert.ok(m.nodes.size>0);
    assert.equal(m.effects.play('guard'),true);const effects=[...m.effects.nodes];
    await m.toggle();assert.equal(m.nodes.size,0);assert.deepEqual([...m.effects.nodes],effects,'music mute leaves SFX alive');
    await m.toggle();const bus=m.bus;
    await m.toggleEffects();assert.equal(m.effects.nodes.size,0);assert.equal(m.bus,bus,'SFX mute does not restart music');
    await m.toggleEffects();assert.equal(m.context.resumes,1);
    const restored=new Music({storage});assert.equal(restored.enabled,true);assert.equal(restored.effectsEnabled,true);
    restored.setCue('village');assert.equal(restored.context,null);assert.equal(restored.timer,null);
    m.setHidden(true);m.setHidden(false);assert.equal(m.effects.nodes.size,0,'visibility resume never replays skipped SFX');
  } finally {m.effects.stop();m.enabled=false;m.stop();globalThis.AudioContext=old;}
});

test('blocked preference storage and rejected audio resume do not claim a successful unmute',async()=>{
  const old=globalThis.AudioContext;
  globalThis.AudioContext=class {constructor(){this.state='suspended';}async resume(){throw new Error('blocked');}};
  const m=new Music({storage:{getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}}});
  try {
    await assert.rejects(m.toggle(),/blocked/);assert.equal(m.enabled,false);assert.equal(m.pending,false);assert.equal(m.unlocking,null);
    assert.equal(m.effects.play('guard'),false);assert.equal(m.timer,null);
  } finally {globalThis.AudioContext=old;}
});

test('a pending gesture resume cannot queue music or replay an intro after the page hides',async()=>{
  const old=globalThis.AudioContext;let resume;
  globalThis.AudioContext=class {
    constructor(){this.currentTime=0;this.state='suspended';}
    resume(){return new Promise(resolve=>{resume=()=>{this.state='running';resolve();};});}
    createGain(){throw new Error('suspended/hidden scheduling');}
  };
  const m=new Music({storage:{getItem:()=> 'on',setItem(){}}});
  try {
    m.setCue('village');const pending=m.unlock();
    m.setCue('battle',{intro:true});assert.equal(m.bus,null);assert.equal(m.nodes.size,0);
    m.setHidden(true);resume();await pending;
    assert.equal(m.bus,null);assert.equal(m.timer,null);assert.equal(m.nodes.size,0);
    assert.equal(m.effects.nodes.size,0);assert.equal(m.introPending,false);
  } finally {m.enabled=false;m.stop();globalThis.AudioContext=old;}
});
