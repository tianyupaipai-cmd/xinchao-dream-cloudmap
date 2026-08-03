import test from 'node:test';
import assert from 'node:assert/strict';
import { dreamPosition, normalizeDreams } from '../src/dream-cloudmap.js';

test('normalizes bounded dream data without inventing lucidity', () => {
  const dreams = normalizeDreams([
    { id: 'old', createdAt: '2026-08-01T00:00:00Z', title: '旧梦' },
    { id: 'new', createdAt: '2026-08-03T00:00:00Z', summary: '新梦', lucidity: 1.8 },
  ]);
  assert.equal(dreams[0].id, 'old');
  assert.equal(dreams[0].lucidity, null);
  assert.equal(dreams[1].lucidity, 1);
});

test('older dreams are farther and higher than recent dreams', () => {
  const oldDream = dreamPosition(0, 8);
  const recentDream = dreamPosition(7, 8);
  assert.ok(oldDream.age > recentDream.age);
  assert.ok(oldDream.y < recentDream.y);
  assert.ok(oldDream.size < recentDream.size);
});
