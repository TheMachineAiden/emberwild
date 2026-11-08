// Evaluate on the same-origin source preview. Outputs PCM16 mono WAV data and
// a reproducible event timeline. This is an OfflineAudioContext render, not an
// audition or a recording of normal gameplay.
async () => {
  // A source preview may have been open across edits. Fresh module URLs keep
  // the rendered score consistent with the source hashes retained afterward.
  const revision = Date.now();
  const {effects, effectDuration, scheduleEffect} = await import(`/src/sfx.js?review=${revision}`);
  const {scheduleEvents} = await import(`/src/audio.js?review=${revision}`);
  const {scores, eventsFor} = await import(`/music/scores.js?review=${revision}`);
  const output = {};
  for (const mode of ['palette','battle-mix']) {
    const timeline = [];
    if (mode === 'palette') {
      let at=.1;
      for (const id of Object.keys(effects)) {
        timeline.push({at,id}); at+=effectDuration(id)+.12;
      }
    } else timeline.push(
      {at:.6,id:'sendout'}, {at:1.7,id:'attack-neutral'},
      {at:2.35,id:'attack-moss'}, {at:3,id:'guard'},
      {at:3.65,id:'attack-ember'}, {at:3.83,id:'defeat'},
      {at:4,id:'xp'}, {at:4.52,id:'level-up'},
      {at:4.94,id:'xp'}, {at:5.46,id:'victory'});
    const seconds = mode === 'palette'
      ? timeline.at(-1).at + effectDuration(timeline.at(-1).id) + .15 : 9;
    const context = new OfflineAudioContext(1,Math.ceil(seconds*44100),44100);
    const effectBus=context.createGain();effectBus.gain.value=.75;effectBus.connect(context.destination);
    for (const event of timeline) scheduleEffect(context,effectBus,event.id,event.at + .005);
    if (mode === 'battle-mix') {
      const node=context.createGain();node.gain.setValueAtTime(0,.04);
      node.gain.linearRampToValueAtTime(1,.065);
      node.gain.setValueAtTime(1,5.46);node.gain.linearRampToValueAtTime(0,5.495);
      node.connect(context.destination);
      const bus={node,voices:new Set(),retiring:false};
      scheduleEvents(context,bus,eventsFor(scores.battle),scores.battle.bpm,.04);
      for(const voice of bus.voices)voice.stop(5.495);
      const victory=context.createGain();victory.gain.setValueAtTime(0,5.5);
      victory.gain.linearRampToValueAtTime(1,5.525);victory.connect(context.destination);
      scheduleEvents(context,{node:victory,voices:new Set(),retiring:false},
        eventsFor(scores.victory),scores.victory.bpm,5.5);
    }
    const buffer=await context.startRendering(),data=buffer.getChannelData(0);
    const bytes=new Uint8Array(44+data.length*2),view=new DataView(bytes.buffer);
    const string=(offset,value)=>[...value].forEach((c,i)=>view.setUint8(offset+i,c.charCodeAt(0)));
    string(0,'RIFF');view.setUint32(4,bytes.length-8,true);string(8,'WAVE');
    string(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);
    view.setUint16(22,1,true);view.setUint32(24,buffer.sampleRate,true);
    view.setUint32(28,buffer.sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
    string(36,'data');view.setUint32(40,data.length*2,true);
    let peak=0,energy=0,binary='';
    for(let i=0;i<data.length;i++){
      peak=Math.max(peak,Math.abs(data[i]));energy+=data[i]*data[i];
      view.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,data[i]))*32767),true);
    }
    for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
    output[mode]={wav:btoa(binary),seconds:buffer.duration,sampleRate:buffer.sampleRate,
      peak,rms:Math.sqrt(energy/data.length),scheduleLead:.005,
      scoreProof:{healMiddleHz:effects.heal[0].pulses[1].from},timeline};
  }
  return output;
}
