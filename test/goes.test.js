import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scanTimes, boxCloudyPct, distanceKm } from '../scripts/lib/goes.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url)));

test('scanTimes: reads day of year and tenths of a second from the file name', () => {
  const t = scanTimes('OR_ABI-L2-ACMC-M6_G19_s20261001101179_e20261001103553_c20261001105128.nc');
  // Day 100 of 2026 is 10 April.
  assert.equal(new Date(t.startMs).toISOString(), '2026-04-10T11:01:17.900Z');
  assert.equal(new Date(t.endMs).toISOString(), '2026-04-10T11:03:55.300Z');
  assert.equal(t.midMs, (t.startMs + t.endMs) / 2);
});

test('boxCloudyPct: counts only good-quality pixels', () => {
  assert.deepEqual(boxCloudyPct('1100', '0000', [0], 2), { pct: 50, good: 4 });
  assert.deepEqual(boxCloudyPct('1100', '0010', [0], 2), { pct: 100 * 2 / 3, good: 3 });
  assert.deepEqual(boxCloudyPct('11FF', '0000', [0], 3), { pct: null, good: 2 });
  assert.deepEqual(boxCloudyPct('1111', '6666', [0], 1), { pct: null, good: 0 });
});

test('distanceKm: one degree of latitude is about 111 km', () => {
  assert.ok(Math.abs(distanceKm(32, -80, 33, -80) - 111.2) < 0.1);
});

test('station pixels: one per cloud station, each within 2 km of the airport', () => {
  const stations = json('config/cloud-stations.json').stations;
  const pixels = json('data/goes/station-pixels.json');
  assert.deepEqual(Object.keys(pixels.stations).sort(), Object.keys(stations).sort());
  assert.equal(pixels.grid.ncSha256, json('config/goes-acm.json').grid.ncSha256);
  for (const [id, p] of Object.entries(pixels.stations)) {
    assert.ok(p.offsetKm < 2, id);
    assert.ok(Math.abs(distanceKm(stations[id].latitudeDeg, stations[id].longitudeDeg, p.pixelLatDeg, p.pixelLonDeg) - p.offsetKm) < 0.01, id);
  }
});

test('extract: every scan has a 5 by 5 box at every station', () => {
  const ex = json('data/goes/acm-stations.json');
  const n = json('config/goes-acm.json').boxPixels ** 2;
  for (const s of ex.scans) {
    assert.match(s.sha256, /^[0-9a-f]{64}$/);
    for (const box of Object.values(s.stations)) {
      assert.equal(box.bcm.length, n);
      assert.equal(box.dqf.length, n);
    }
  }
});

test('report: go/no-go line in clouds/README.md equals goes-results.json', () => {
  const r = json('clouds/goes-results.json');
  const readme = readFileSync(new URL('../clouds/README.md', import.meta.url), 'utf8');
  assert.ok(readme.includes(`twilight skill ${r.goNoGo.skillPct} on ${r.goNoGo.n.toLocaleString('en-US')} pairs`));
  assert.equal(r.goNoGo.pass, r.goNoGo.skillPct >= json('config/goes-acm.json').goNoGo.minSkillPct);
});

test('cloud layers extract: one CCL file for each mask scan', () => {
  const acm = json('data/goes/acm-stations.json');
  const ccl = json('data/goes/ccl-stations.json');
  assert.equal(ccl.unmatchedMaskScans, 0);
  assert.deepEqual(ccl.scans.map((s) => s.acmKey).sort(), acm.scans.map((s) => s.key).sort());
  for (const s of ccl.scans) assert.match(s.sha256, /^[0-9a-f]{64}$/);
});

test('report: test 2 go/no-go line in clouds/README.md equals goes-ccl-results.json', () => {
  const r = json('clouds/goes-ccl-results.json');
  const readme = readFileSync(new URL('../clouds/README.md', import.meta.url), 'utf8');
  assert.ok(readme.includes(`twilight skill ${r.goNoGo.skillPct} on ${r.goNoGo.n.toLocaleString('en-US')} pairs`));
  assert.equal(r.goNoGo.pass, r.goNoGo.skillPct >= json('config/goes-ccl.json').goNoGo.minSkillPct);
  assert.equal(r.dropped.missingValue, 1175);
});

test('relative test: 12 water cells, each at sea and near its place', () => {
  const places = json('config/goes-relative.json').waterPoints.places;
  const water = json('data/goes/water-pixels.json').points;
  assert.deepEqual(Object.keys(water).sort(), Object.keys(places).sort());
  for (const p of Object.values(water)) assert.ok(p.offsetKm < 2);
});

test('report: test 3 numbers in clouds/README.md equal goes-relative-results.json', () => {
  const r = json('clouds/goes-relative-results.json');
  const readme = readFileSync(new URL('../clouds/README.md', import.meta.url), 'utf8');
  const d1 = r.ratio.land[1];
  assert.ok(readme.includes(`(skill ${d1.skillWaterPct} against ${d1.skillLandPct};`));
  assert.ok(readme.includes(`ratio ${d1.q}, 95 percent interval ${d1.qCi95[0]} to ${d1.qCi95[1]}, over ${d1.events.toLocaleString('en-US')} twilight`));
  const n = r.ratio.landNearCharleston[1];
  assert.ok(readme.includes(`${n.q} (${n.qCi95[0]} to ${n.qCi95[1]})`));
  assert.equal(r.verdict.verdict, 'holds');
  assert.ok(readme.includes(`${r.inputs.twilightHours.toLocaleString('en-US')}\nhours; ${r.inputs.scans.toLocaleString('en-US')} with a GOES scan`));
});
