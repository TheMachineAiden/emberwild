// Evaluate this function on a same-origin source preview, saving its JSON
// result to a file. Decode each `wav` field to retain the review WAVs.
async () => {
  const {renderMusicDemo} = await import('/src/audio.js');
  const {scores,eventsFor} = await import('/music/scores.js');
  const output = {};
  for (const id of ['battle','boss']) {
    const buffer = await renderMusicDemo(id);
    const data = buffer.getChannelData(0);
    const bytes = new Uint8Array(44 + data.length * 2);
    const view = new DataView(bytes.buffer);
    const string = (offset,value) => [...value].forEach((c,i) => view.setUint8(offset+i,c.charCodeAt(0)));
    string(0,'RIFF'); view.setUint32(4,bytes.length-8,true); string(8,'WAVE');
    string(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true);
    view.setUint16(22,1,true); view.setUint32(24,buffer.sampleRate,true);
    view.setUint32(28,buffer.sampleRate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
    string(36,'data'); view.setUint32(40,data.length*2,true);
    let peak=0, energy=0;
    for (let i=0; i<data.length; i++) {
      peak=Math.max(peak,Math.abs(data[i])); energy+=data[i]*data[i];
      view.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,data[i]))*32767),true);
    }
    let binary='';
    for (let i=0; i<bytes.length; i+=16384) binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
    output[id]={wav:btoa(binary),seconds:buffer.duration,sampleRate:buffer.sampleRate,
      peak,rms:Math.sqrt(energy/data.length),bpm:scores[id].bpm,loopStart:scores[id].loopStart,
      events:eventsFor(scores[id],{loops:2})};
  }
  return output;
}
