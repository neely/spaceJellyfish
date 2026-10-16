import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { forecastUrl, valuesAt } from '../lib/openmeteo.js';

const weather = JSON.parse(readFileSync(new URL('../config/weather.json', import.meta.url)));

test('forecastUrl: one request for many places, with the configured model', () => {
  const url = new URL(forecastUrl({
    places: [{ latitudeDeg: 32.718, longitudeDeg: -79.9537 }, { latitudeDeg: 32.35, longitudeDeg: -79.5 }],
    ...weather.forecast.allSky,
  }));
  assert.equal(url.searchParams.get('latitude'), '32.7180,32.3500');
  assert.equal(url.searchParams.get('longitude'), '-79.9537,-79.5000');
  assert.equal(url.searchParams.get('models'), 'ncep_nbm_conus');
  assert.equal(url.searchParams.get('hourly'), 'cloud_cover');
  assert.equal(url.searchParams.get('timezone'), 'GMT');
});

// The shape of a two-place answer, as returned on 2026-10-16 (values made up).
const answer = [
  { latitude: 32.72, longitude: -79.96, hourly: { time: ['2026-10-19T10:00', '2026-10-19T11:00'], cloud_cover: [0, 20] } },
  { latitude: 32.36, longitude: -79.5, hourly: { time: ['2026-10-19T10:00', '2026-10-19T11:00'], cloud_cover: [100, null] } },
];

test('valuesAt: nearest whole hour, one value per place, null where missing', () => {
  assert.deepEqual(valuesAt(answer, 'cloud_cover', Date.parse('2026-10-19T10:29:00Z')), [0, 100]);
  assert.deepEqual(valuesAt(answer, 'cloud_cover', Date.parse('2026-10-19T10:31:00Z')), [20, null]);
  assert.deepEqual(valuesAt(answer, 'cloud_cover', Date.parse('2026-10-20T10:00:00Z')), [null, null]);
  // A one-place answer is a single object, not an array.
  assert.deepEqual(valuesAt(answer[0], 'cloud_cover', Date.parse('2026-10-19T11:00:00Z')), [20]);
});
