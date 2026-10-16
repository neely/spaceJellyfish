import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

test('the newest CHANGELOG entry is the version in package.json', () => {
  const { version } = JSON.parse(read('../package.json'));
  assert.match(version, /^\d+\.\d+\.\d+$/);
  const first = read('../CHANGELOG.md').match(/^## (\d+\.\d+\.\d+) · (\d{4}-\d{2}-\d{2}) · ([0-9a-f]{7,40}|pending)$/m);
  assert.ok(first, 'CHANGELOG.md has a "## x.y.z · YYYY-MM-DD · commit" heading');
  assert.equal(first[1], version);
});
