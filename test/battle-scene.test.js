import test from 'node:test';
import assert from 'node:assert/strict';
import {battleEnvironment, battleScenes, battleContacts} from '../src/battle-scene.js';

test('battle environment follows the actual chapter encounter location', () => {
  assert.equal(battleEnvironment('route', 10), 'meadow');
  assert.equal(battleEnvironment('route', 17), 'coast');
  assert.equal(battleEnvironment('ridge', 4), 'coast');
  assert.equal(battleEnvironment('summit', 9), 'crown');
});

test('contacts follow the same centred cover crop at narrow and wide field sizes', () => {
  for (const environment of Object.keys(battleScenes))
    for (const [w,h] of [[368,245],[479,259],[760,400]]) {
      const scale=Math.max(w/480,h/240), contacts=battleContacts(environment,w,h);
      for(const side of ['ally','enemy']) {
        const [x,y]=contacts[side];
        assert.ok(x>40 && x<w-40 && y>80 && y<h-20, `${environment} ${w}x${h} ${side}`);
        assert.ok(Math.abs((x-(w-480*scale)/2)/scale-battleScenes[environment][side][0])<1e-9);
        assert.ok(Math.abs((y-(h-240*scale)/2)/scale-battleScenes[environment][side][1])<1e-9);
      }
    }
});
