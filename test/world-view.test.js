import test from 'node:test';
import assert from 'node:assert/strict';
import {worldCamera} from '../src/camera.js';
import {rasterSize,projectWorldRect} from '../src/world-view.js';

test('a following actor stays on one physical screen coordinate at 60/120Hz in every direction', () => {
  for(const [w,h] of [[844,390],[667,375],[1280,800]])
    for(const dpr of [1,2])for(const hz of [60,120])for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const values=[];
      for(let frame=0;frame<Math.ceil(hz*.28);frame++) {
        const p=frame/hz/.28,x=9+dx*p,y=6+dy*p;
        const c=worldCamera(w,h,x,y,{touch:true});
        // Only inspect the following portion; the actor may move normally at
        // the logical map boundary where the camera deliberately stops.
        if(c.x<=0||c.x>=480-c.width||c.y<=0||c.y>=312-c.height)continue;
        const rect=projectWorldRect(c,rasterSize(w,h,dpr),w,h,x*24+4,y*24,16,24);
        values.push(rect[dx?0:1]);
      }
      assert.ok(new Set(values).size<=1,`${w}x${h} DPR${dpr} ${hz}Hz direction${dx},${dy}: ${values}`);
    }
});

test('camera boundary transitions move monotonically, without reversing the walking foot anchor', () => {
  for(const dpr of [1,2])for(const hz of [60,120]) {
    let previous=Infinity;
    for(let frame=0;frame<=hz;frame++) {
      const y=5-frame/hz*3,c=worldCamera(844,390,9,y,{touch:true});
      const rect=projectWorldRect(c,rasterSize(844,390,dpr),844,390,9*24+4,y*24,16,24);
      assert.ok(rect[1]<=previous,'northbound actor must not jump south at a camera threshold');
      previous=rect[1];
    }
  }
});

test('native raster covers the viewport and shared terrain edges have no fractional-DPR gaps', () => {
  for(const dpr of [1,1.25,1.5,2]) {
    const r=rasterSize(667,375,dpr),c=worldCamera(667,375,9.13,6.29,{touch:true});
    assert.equal(r.width,Math.round(667*dpr));assert.equal(r.height,Math.round(375*dpr));
    for(let x=0;x<20;x++) {
      const a=projectWorldRect(c,r,667,375,x*24,24,24,24);
      const b=projectWorldRect(c,r,667,375,(x+1)*24,24,24,24);
      assert.equal(a[0]+a[2],b[0]);
    }
  }
});

test('retained matrix human frames preserve their head and contact anchors', async () => {
  const {readFile}=await import('node:fs/promises');
  const {characters}=JSON.parse(await readFile(new URL('../assets/source/world/humans-compact.json',import.meta.url),'utf8'));
  for(const actor of ['player','healer','perrin','rowan','maren','alder','tamsin'])
  for(const direction of ['north','south','east','west']) {
    const standing=characters[`${actor}-${direction}`];
    for(const suffix of ['','-1','-2']) {
      const rows=characters[`${actor}-${direction}${suffix}`];
      assert.equal(rows.length,24);
      assert.ok(rows.every(r=>r.length===16));
      assert.deepEqual(rows.slice(0,11),standing.slice(0,11), 'head never bobs with the gait');
      assert.ok(rows[23].includes('o'),'boots keep their bottom contact row');
    }
    assert.notDeepEqual(characters[`${actor}-${direction}-1`].slice(13,18),
      characters[`${actor}-${direction}-2`].slice(13,18), 'opposed arm poses are visible above the legs');
  }
});

test('reused world labels reflect changed counters and resets without replacing unchanged nodes', async () => {
  const {WorldLabels}=await import('../src/world-view.js');
  const prior=globalThis.document,children=[];let writes=0;
  globalThis.document={createElement(){return {hidden:false,style:{},
    get textContent(){return this.text;},set textContent(v){this.text=v;writes++;},
    get offsetWidth(){return this.hidden?0:this.text.length*8;}};}};
  try {
    const labels=new WorldLabels({append:e=>children.push(e)});
    const draw=text=>{labels.begin();labels.place('bowl-tide',text,50,20,100);labels.end();};
    draw('Tide 1/3');const element=children[0];
    draw('Tide 0/3');assert.equal(element.textContent,'Tide 0/3');
    for(let i=0;i<20;i++)draw('Tide 0/3');
    assert.equal(children.length,1);assert.equal(writes,2);
    labels.begin();labels.end();assert.equal(element.hidden,true);
    draw('Reset tablet');assert.equal(element.hidden,false);assert.equal(element.textContent,'Reset tablet');
    assert.equal(element.style.transform,'translate(4px, 20px)');
  } finally {globalThis.document=prior;}
});
