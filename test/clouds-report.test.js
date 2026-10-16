import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// clouds/README.md is written by hand. These checks keep its tables equal
// to clouds/results.json, which scripts/score-clouds.js writes.
const report = readFileSync(new URL('../clouds/README.md', import.meta.url), 'utf8');
const results = JSON.parse(readFileSync(new URL('../clouds/results.json', import.meta.url)));
const row = (label) => {
  const line = report.split('\n').find((l) => l.startsWith(`| ${label} |`));
  assert.ok(line, `no row for ${label}`);
  return line.split('|').slice(2, -1).map((c) => c.trim()).filter((c) => c !== '').map(Number);
};

test('report: twilight skill table equals results.json', () => {
  const t = results.tests.lead.below12000ft.twilight;
  for (const [label, model] of [['NBM', 'ncep_nbm_conus'], ['Blend', 'blend'], ['ECMWF', 'ecmwf_ifs025'], ['GFS', 'gfs_global']]) {
    assert.deepEqual(row(label), [1, 2, 3, 4, 5, 6, 7].map((d) => t[model][d].skillPct), label);
  }
  assert.deepEqual(row('HRRR'), [t.gfs_hrrr[1].skillPct]);
});

test('report: low-cloud table equals results.json', () => {
  const t = results.tests.layers.lowVsBelow10000ft.all;
  // The low-cloud table follows the twilight table, so take the second
  // row of each label.
  const rows = (label) => report.split('\n').filter((l) => l.startsWith(`| ${label} |`));
  for (const [label, model] of [['HRRR', 'gfs_hrrr'], ['GFS', 'gfs_global'], ['ECMWF', 'ecmwf_ifs025']]) {
    const cells = rows(label)[1].split('|').slice(2, -1).map((c) => Number(c.trim()));
    const s = t[model][0];
    assert.deepEqual(cells, [s.skillPct, s.hitPct, s.falsePct], label);
  }
});

test('report: hour counts in the text equal results.json', () => {
  const below = results.tests.lead.below12000ft;
  const full = results.tests.lead.fullSky;
  const fmt = (n) => n.toLocaleString('en-US');
  assert.ok(report.includes(fmt(below.all.ncep_nbm_conus[1].n)) || report.includes(fmt(below.all.ecmwf_ifs025[1].n)));
  assert.ok(report.includes(fmt(full.all.ecmwf_ifs025[1].n)));
  assert.ok(report.includes(fmt(below.twilight.ecmwf_ifs025[1].n)));
  assert.ok(report.includes(fmt(full.twilight.ecmwf_ifs025[1].n)));
});
