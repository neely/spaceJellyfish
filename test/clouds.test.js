import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COVER_PCT, ASOS_LIMIT_FT, parseIemCsv, reportCoverPct, highestBaseFt, reportsByHour, openMeteoSeries, sunElevationDeg, score,
} from '../scripts/lib/clouds.js';

const fixture = (name) => readFileSync(new URL(`fixtures/clouds/${name}`, import.meta.url), 'utf8');
const hour = (iso) => Date.parse(iso);

test('COVER_PCT: each code is the middle of its range in eighths', () => {
  assert.equal(COVER_PCT.FEW, (1.5 / 8) * 100);
  assert.equal(COVER_PCT.SCT, (3.5 / 8) * 100);
  assert.equal(COVER_PCT.BKN, (6 / 8) * 100);
  assert.equal(COVER_PCT.OVC, 100);
  assert.equal(COVER_PCT.CLR, 0);
  assert.equal(ASOS_LIMIT_FT, 12000);
});

test('parseIemCsv: the CHS fixture has 24 reports with their layers', () => {
  const r = parseIemCsv(fixture('iem-chs-2025-06-01.csv'));
  assert.equal(r.length, 24);
  assert.equal(r[0].timeMs, hour('2025-06-01T00:56:00Z'));
  assert.deepEqual(r[0].layers, [{ code: 'SCT', baseFt: 25000 }]);
  assert.deepEqual(r[3].layers, [{ code: 'CLR', baseFt: null }]);
  assert.deepEqual(r[19].layers.map((l) => l.code), ['SCT', 'SCT', 'BKN']);
});

test('reportCoverPct: layers above the limit are left out; CLR always counts', () => {
  const [, , , clr] = parseIemCsv(fixture('iem-chs-2025-06-01.csv'));
  assert.equal(reportCoverPct(clr.layers, 12000), 0);
  // 19:56 SCT 6000, SCT 7000, BKN 25000
  const r = parseIemCsv(fixture('iem-chs-2025-06-01.csv'))[19];
  assert.equal(reportCoverPct(r.layers), 75);
  assert.equal(reportCoverPct(r.layers, 12000), 43.75);
  // 00:56 SCT 25000 only: clear below 12,000 ft
  assert.equal(reportCoverPct(parseIemCsv(fixture('iem-chs-2025-06-01.csv'))[0].layers, 12000), 0);
  assert.equal(reportCoverPct([{ code: 'XYZ', baseFt: 1000 }]), null);
  assert.equal(reportCoverPct([{ code: 'VV', baseFt: 200 }]), 100);
  assert.equal(highestBaseFt(r.layers), 25000);
});

test('reportsByHour: a report at :56 is the next hour; the nearest report wins', () => {
  const r = reportsByHour([
    { timeMs: hour('2025-06-01T10:56:00Z'), layers: [{ code: 'CLR', baseFt: null }] },
    { timeMs: hour('2025-06-01T11:20:00Z'), layers: [{ code: 'OVC', baseFt: 500 }] },
    { timeMs: hour('2025-06-01T11:02:00Z'), layers: [{ code: 'FEW', baseFt: 900 }] },
  ]);
  assert.equal(r.get(hour('2025-06-01T11:00:00Z')).layers[0].code, 'FEW');
  assert.equal(r.size, 1);
});

test('openMeteoSeries: keeps values by hour and drops nulls', () => {
  const prev = openMeteoSeries(JSON.parse(fixture('previous-chs-2025-06-01.json')));
  assert.equal(prev.get('cloud_cover_previous_day1_gfs_hrrr').get(hour('2025-06-01T10:00:00Z')), 91);
  assert.equal(prev.get('cloud_cover_previous_day2_gfs_hrrr').size, 0);
  assert.equal(prev.get('cloud_cover_previous_day1_ecmwf_ifs025').size, 24);
  const hist = openMeteoSeries(JSON.parse(fixture('historical-chs-2025-06-01.json')));
  assert.equal(hist.get('cloud_cover_mid_ecmwf_ifs025').get(hour('2025-06-01T21:00:00Z')), 100);
});

test('sunElevationDeg: noon in June is high, local midnight is far below', () => {
  const chs = { latitudeDeg: 32.89889, longitudeDeg: -80.04056 };
  // Local solar noon at -80 degrees is near 17:20 UTC.
  assert.ok(sunElevationDeg(chs, hour('2025-06-21T17:20:00Z')) > 75);
  assert.ok(sunElevationDeg(chs, hour('2025-06-21T05:20:00Z')) < -30);
});

test('score: hit rate, false-alarm rate, skill and the always-clear MAE', () => {
  const s = score([[80, 75], [10, 100], [60, 0], [0, 0]], 50);
  assert.equal(s.n, 4);
  assert.equal(s.cloudy, 2);
  assert.equal(s.hitRate, 0.5);
  assert.equal(s.falseRate, 0.5);
  assert.equal(s.skill, 0);
  assert.equal(s.mae, (5 + 90 + 60 + 0) / 4);
  assert.equal(s.maeClear, (75 + 100) / 4);
  assert.deepEqual(score([], 50), { n: 0 });
});

test('fixture day: ECMWF day-1 forecast against the CHS sky below 12,000 ft', () => {
  // A worked case from real data. 20:56 BKN 6000 is the only cloudy hour
  // below 12,000 ft; it is the 21:00 hour, where ECMWF day 1 said 79.
  const byHour = reportsByHour(parseIemCsv(fixture('iem-chs-2025-06-01.csv')));
  const f = openMeteoSeries(JSON.parse(fixture('previous-chs-2025-06-01.json'))).get('cloud_cover_previous_day1_ecmwf_ifs025');
  const pairs = [];
  for (const [h, r] of byHour) if (f.has(h)) pairs.push([f.get(h), reportCoverPct(r.layers, 12000)]);
  const s = score(pairs, 50);
  // The 24 reports map to 01:00 through 24:00; the last (23:56) is
  // 2025-06-02 00:00, outside the fixture day, so 23 pairs remain.
  assert.equal(s.n, 23);
  assert.equal(s.cloudy, 1);
  assert.equal(s.hitRate, 1);
});
