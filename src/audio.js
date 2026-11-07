import {scores,eventsFor} from '../music/scores.js';
export function cueFor(state){
 if(state.mode==='battle')return state.battle.result==='capture'?'capture':state.battle.result==='win'?'victory':state.battle.trainerId==='keeper'?'boss':'battle';
 if(state.mode==='ending')return 'village';
 return state.map==='village'?'village':['cellar','summit'].includes(state.map)?'landmark':'route';
}
export class Music {
 constructor(){this.enabled=false;this.current=null;this.nodes=new Set();this.timer=null;this.context=null;this.hidden=false;}
 async toggle(){
  if(this.pending)return this.enabled;
  if(this.enabled){this.enabled=false;this.stop();return false;}
  this.context ||= new (globalThis.AudioContext||globalThis.webkitAudioContext)();
  this.pending=true;
  try{await this.context.resume();this.enabled=true;this.play();return true;}finally{this.pending=false;}
 }
 stop(){clearTimeout(this.timer);this.timer=null;for(const oscillator of this.nodes){try{oscillator.stop();}catch{}}this.nodes.clear();}
 setCue(id){if(this.current===id)return;this.current=id;this.stop();this.play();}
 setHidden(hidden){this.hidden=hidden;this.stop();if(!hidden)this.play();}
 play(){
  if(!this.enabled||this.hidden||!this.context||!this.current)return;
  const cue=scores[this.current],seconds=60/cue.bpm,start=this.context.currentTime+0.04;
  for(const event of eventsFor(cue)){
   const match=/^([A-G])([#b]?)(\d)$/.exec(event.note),pitch={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[match[1]]+(match[2]==='#'?1:match[2]==='b'?-1:0)+(Number(match[3])+1)*12;
   const oscillator=this.context.createOscillator(),gain=this.context.createGain(),at=start+event.beat*seconds,end=at+event.duration*seconds;
   oscillator.type=event.part==='bass'?'triangle':'square';oscillator.frequency.value=440*2**((pitch-69)/12);
   const level=event.part==='lead'?0.035:event.part==='bass'?0.055:0.018;
   gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(level,at+0.006);gain.gain.setValueAtTime(level,Math.max(at+0.006,end-0.04));gain.gain.linearRampToValueAtTime(0,end-0.025);
   oscillator.connect(gain);gain.connect(this.context.destination);oscillator.start(at);oscillator.stop(end);this.nodes.add(oscillator);oscillator.onended=()=>{this.nodes.delete(oscillator);gain.disconnect();oscillator.disconnect();};
  }
  if(cue.loop)this.timer=setTimeout(()=>this.play(),Math.max(0,(start+cue.beats*seconds-this.context.currentTime)*1000-40));
 }
}
