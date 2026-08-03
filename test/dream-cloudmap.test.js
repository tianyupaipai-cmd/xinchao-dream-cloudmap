import test from 'node:test';
import assert from 'node:assert/strict';
import { dreamPosition, jitter, normalizeDreams, skyAt } from '../src/dream-cloudmap.js';

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

test('jitter is deterministic and stays in range', () => {
  const a = jitter('dream-42', 7);
  const b = jitter('dream-42', 7);
  assert.equal(a, b, '同一个梦每次都该落在同一处');
  assert.notEqual(jitter('dream-42', 7), jitter('dream-43', 7));
  for (const seed of ['', 'x', '很长的中文梦境标题', '0']) {
    const value = jitter(seed, 11);
    assert.ok(value >= 0 && value < 1, `${seed} 越界`);
  }
});

test('wobble keeps the older-is-higher trend', () => {
  // 相邻两朵允许偶尔互换——真实的云不排队。
  // 要守住的是整体趋势：最旧的一批明显高于最新的一批。
  for (const count of [3, 8, 20, 50]) {
    const all = Array.from({ length: count }, (_, i) => dreamPosition(i, count, `dream-${i}`));
    const slice = Math.max(1, Math.round(count * .25));
    const avg = (list) => list.reduce((sum, p) => sum + p.y, 0) / list.length;
    const oldest = avg(all.slice(0, slice));
    const newest = avg(all.slice(-slice));
    assert.ok(oldest < newest, `count=${count}：最旧的一批该明显更高`);
    assert.ok(all[0].age > all[count - 1].age, `count=${count}：年龄顺序`);
  }
});

test('positions differ between neighbours (no marching in a line)', () => {
  const count = 12;
  const spread = new Set();
  for (let i = 0; i < count; i += 1) spread.add(Math.round(dreamPosition(i, count, `d${i}`).y));
  assert.ok(spread.size >= count - 1, '高度不该整齐排列');
});

test('sky follows real time: night is dark, noon is bright', () => {
  const night = skyAt(new Date('2026-08-03T03:00:00'));
  const noon = skyAt(new Date('2026-08-03T12:00:00'));
  const dawn = skyAt(new Date('2026-08-03T06:00:00'));
  assert.ok(night.day < 0.2, '凌晨该是夜');
  assert.ok(noon.day > 0.9, '正午该最亮');
  assert.ok(dawn.dusk > noon.dusk, '日出的晨昏感该高于正午');
  assert.ok(noon.elevation > night.elevation);
});

test('sun never reaches the zenith, so direction stays readable', () => {
  for (let h = 0; h < 24; h += 1) {
    const sky = skyAt(new Date(`2026-08-03T${String(h).padStart(2, '0')}:00:00`));
    assert.ok(Math.abs(sky.elevation) <= 0.75, `${h} 点太阳过顶就没有方位差了`);
  }
});
