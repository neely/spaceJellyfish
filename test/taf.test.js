import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseTaf, conditionsAt, describeClouds, describeIndicator } from '../lib/taf.js';

// A real KJZI TAF read from api.weather.gov on 2026-10-16 (TAF KJZI 161120Z 1612/1712).
const xml = readFileSync(new URL('fixtures/clouds/taf-kjzi-2026-10-16-1120.xml', import.meta.url), 'utf8');
const t = (iso) => Date.parse(iso);

test('parseTaf: station, issue time, valid period and five groups', () => {
  const taf = parseTaf(xml);
  assert.equal(taf.station, 'KJZI');
  assert.equal(taf.issueMs, t('2026-10-16T11:20:00Z'));
  assert.deepEqual(taf.valid, { beginMs: t('2026-10-16T12:00:00Z'), endMs: t('2026-10-17T12:00:00Z') });
  assert.equal(taf.forecasts.length, 5);
  assert.equal(taf.forecasts[0].indicator, 'BASE');
  assert.deepEqual(taf.forecasts[0].layers, [{ amount: 'FEW', baseFt: 400 }]);
  assert.deepEqual(taf.forecasts[0].weather, ['MIFG']);
  assert.deepEqual(taf.forecasts[1].layers, [{ amount: 'SKC', baseFt: null }]);
  assert.deepEqual(taf.forecasts[4].layers, [{ amount: 'SCT', baseFt: 4000 }, { amount: 'BKN', baseFt: 15000 }]);
});

test('conditionsAt: the latest FROM group that has begun', () => {
  const taf = parseTaf(xml);
  assert.equal(conditionsAt(taf, t('2026-10-16T13:00:00Z')).prevailing.indicator, 'BASE');
  assert.deepEqual(conditionsAt(taf, t('2026-10-16T15:00:00Z')).prevailing.layers, [{ amount: 'SKC', baseFt: null }]);
  assert.deepEqual(conditionsAt(taf, t('2026-10-17T10:30:00Z')).prevailing.layers.map((l) => l.amount), ['SCT', 'BKN']);
  assert.equal(conditionsAt(taf, t('2026-10-17T12:00:00Z')), null);
  assert.equal(conditionsAt(taf, t('2026-10-16T11:59:00Z')), null);
});

test('conditionsAt: a TEMPO group covering the time is listed apart', () => {
  const taf = parseTaf(xml);
  taf.forecasts.push({ indicator: 'TEMPORARY_FLUCTUATIONS', beginMs: t('2026-10-17T03:00:00Z'), endMs: t('2026-10-17T06:00:00Z'), cavok: false, layers: [{ amount: 'BKN', baseFt: 1500 }], weather: [] });
  const c = conditionsAt(taf, t('2026-10-17T04:00:00Z'));
  assert.equal(c.atTimes.length, 1);
  assert.deepEqual(c.prevailing.layers.map((l) => l.amount), ['FEW', 'SCT']);
  assert.equal(conditionsAt(taf, t('2026-10-17T07:00:00Z')).atTimes.length, 0);
});

test('describeClouds and describeIndicator: plain words', () => {
  const taf = parseTaf(xml);
  assert.equal(describeClouds(taf.forecasts[4]), 'scattered clouds at 4,000 ft, broken clouds at 15,000 ft');
  assert.equal(describeClouds(taf.forecasts[1]), 'clear sky');
  assert.equal(describeIndicator('TEMPORARY_FLUCTUATIONS'), 'At times');
  assert.equal(describeIndicator('PROBABILITY_30'), 'Probability 30');
});
