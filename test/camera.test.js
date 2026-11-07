import test from 'node:test';
import assert from 'node:assert/strict';
import { worldCamera } from '../src/camera.js';

test('world viewport covers the complete display at readable pixel scale', () => {
  for (const [width,height,touch] of [[667,375,true],[844,390,true],[1280,800,false],[1920,1080,false]]) {
    const c=worldCamera(width,height,9,6,{touch});
    assert.ok(c.width*c.scale>=width); assert.ok(c.height*c.scale>=height);
    assert.ok(c.scale>=2); assert.ok(c.width<=480&&c.height<=312);
  }
});
test('corner and lower-edge avatars stay clear of touch controls and menu area', () => {
  for(const [width,height] of [[667,375],[844,390]]) {
    for(const [x,y] of [[2,2],[17,2],[2,10],[17,10],[0,8],[19,8]]) {
      const c=worldCamera(width,height,x,y,{touch:true});
      const sx=(x*24+12-c.x)*c.scale,sy=(y*24+12-c.y)*c.scale;
      assert.ok(sx>=156&&sx<=width-156, `${x},${y} screen x${sx}`);
      assert.ok(sy>=56&&sy<=height-148,`${x},${y} screen y${sy}`);
    }
  }
});
test('camera follows interpolated tile travel without affecting logical coordinates', () => {
  const a=worldCamera(667,375,9,6,{touch:true}), b=worldCamera(667,375,9.5,6,{touch:true});
  assert.equal(b.x-a.x,12); assert.equal(b.y,a.y);
});
test('dialogue shifts the avatar above the paused conversation overlay', () => {
  for(const [width,height] of [[667,375],[844,390]]) {
    const c=worldCamera(width,height,5,6,{touch:true,dialogue:true});
    const center=(6*24+12-c.y)*c.scale;
    assert.ok(center+24<height*.56-16,'avatar clears the tallest conversation pane');
  }
});

test('landmark approach reveals the crown without snapping between tiles', () => {
  assert.equal(worldCamera(667,375,9,5,{touch:true,landmarkTop:1}).y,0);
  let previous=worldCamera(667,375,9,5,{touch:true,landmarkTop:1}).y;
  for(let y=5.1;y<=7.01;y+=.1) {
    const next=worldCamera(667,375,9,y,{touch:true,landmarkTop:1}).y;
    assert.ok(Math.abs(next-previous)<=8); previous=next;
  }
  assert.ok(worldCamera(667,375,9,5,{touch:true,landmarkTop:1,dialogue:true}).y>0);
});
