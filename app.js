// The page: fetch upcoming Cape and KSC launches from Launch Library 2, run
// the geometry engine on each, and show the result. No framework.
import { evaluateLaunch } from './engine/visibility.js';

// LL2 allows 15 unauthenticated requests per hour for each address. The
// page keeps the last answer and asks again only when it is this old.
const CACHE_KEY = 'spacejellyfish.ll2.upcoming.v1';
const CACHE_MS = 20 * 60 * 1000;
const HORIZON_KEY = 'spacejellyfish.horizonDeg';
const LL2_URL =
  'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?location__ids=12,27&limit=30&mode=normal&ordering=net';
// A launch gets a full forecast only when LL2 gives its time to the hour or better.
const PRECISE = ['Second', 'Minute', 'Hour'];
const SLIP_STEP_MIN = 10;
const SLIP_RANGE_MIN = 120;

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) node.append(child);
  return node;
};
const svgEl = (tag, attrs = {}, text) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
};

const getJson = async (path) => (await fetch(path)).json();
const [observer, profiles, config] = await Promise.all([
  getJson('config/observer.json'),
  getJson('config/profiles.json'),
  getJson('config/visibility.json'),
]);

const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: observer.timeZone, ...opts });
const dayFmt = fmt({ weekday: 'long', month: 'long', day: 'numeric' });
const timeFmt = fmt({ hour: 'numeric', minute: '2-digit' });
const secFmt = fmt({ hour: 'numeric', minute: '2-digit', second: '2-digit' });
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = (deg) => COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

async function loadLaunches(force) {
  const cached = readCache();
  if (cached && !force && Date.now() - cached.fetched < CACHE_MS) return { ...cached, source: 'cache' };
  try {
    const res = await fetch(LL2_URL);
    if (!res.ok) throw new Error(`Launch Library 2 answered ${res.status}`);
    const body = await res.json();
    const fresh = { fetched: Date.now(), results: body.results.map(reduce) };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    } catch {
      // Storage can be off in a private window. The page still works.
    }
    return { ...fresh, source: 'network' };
  } catch (error) {
    if (cached) return { ...cached, source: 'stale', error: error.message };
    throw error;
  }
}

// Keep only the fields the page uses.
function reduce(l) {
  return {
    id: l.id,
    name: l.name,
    net: l.net,
    precision: l.net_precision?.name ?? null,
    status: l.status?.abbrev ?? null,
    statusName: l.status?.name ?? null,
    lastUpdated: l.last_updated ?? null,
    vehicle: l.rocket?.configuration?.name ?? null,
    orbit: l.mission?.orbit?.abbrev ?? null,
    programs: (l.program ?? []).map((p) => p.name),
    padName: l.pad?.name ?? null,
    pad: { latitudeDeg: Number(l.pad?.latitude), longitudeDeg: Number(l.pad?.longitude) },
  };
}

function skyChart(result, liftoffMs, horizonDeg) {
  const W = 700;
  const H = 300;
  const M = { l: 34, r: 10, t: 12, b: 26 };
  const tracks = result.tracks.filter((t) => t.samples);
  const up = tracks.flatMap((t) => t.samples.filter((s) => s.elevationDeg > 0));
  // Bearings near north can wrap; this page only expects south and east skies.
  const minB = Math.floor((Math.min(...up.map((s) => s.bearingDeg)) - 10) / 10) * 10;
  const maxB = Math.ceil((Math.max(...up.map((s) => s.bearingDeg)) + 10) / 10) * 10;
  const maxE = Math.max(40, Math.ceil((Math.max(...up.map((s) => s.elevationDeg)) + 5) / 10) * 10);
  const x = (b) => M.l + ((b - minB) / (maxB - minB)) * (W - M.l - M.r);
  const y = (e) => H - M.b - (e / maxE) * (H - M.t - M.b);

  const svg = svgEl('svg', { class: 'sky', viewBox: `0 0 ${W} ${H}`, role: 'img' });
  svg.append(svgEl('title', {}, 'Path of the rocket across the sky: compass bearing against height above the horizon'));
  for (let e = 0; e <= maxE; e += 10) {
    svg.append(svgEl('line', { x1: M.l, x2: W - M.r, y1: y(e), y2: y(e), stroke: '#1c2540' }));
    svg.append(svgEl('text', { x: M.l - 6, y: y(e) + 4, fill: '#98a2bd', 'font-size': 11, 'text-anchor': 'end' }, `${e}°`));
  }
  for (let b = Math.ceil(minB / 22.5) * 22.5; b <= maxB; b += 22.5) {
    svg.append(svgEl('line', { x1: x(b), x2: x(b), y1: y(0), y2: y(maxE), stroke: '#141b30' }));
    svg.append(svgEl('text', { x: x(b), y: H - 8, fill: '#98a2bd', 'font-size': 11, 'text-anchor': 'middle' }, compass(b)));
  }
  if (horizonDeg > 0) {
    svg.append(svgEl('rect', { x: M.l, y: y(horizonDeg), width: W - M.l - M.r, height: y(0) - y(horizonDeg), fill: '#1d3a2a', opacity: 0.75 }));
    svg.append(svgEl('text', { x: W - M.r - 6, y: y(horizonDeg) - 4, fill: '#7fbf95', 'font-size': 11, 'text-anchor': 'end' }, `your trees: ${horizonDeg}°`));
  }
  for (const track of tracks) {
    const shown = track.samples.filter((s) => s.elevationDeg > 0);
    const line = (pts, stroke, width, dash) =>
      pts.length > 1 &&
      svg.append(svgEl('polyline', {
        points: pts.map((s) => `${x(s.bearingDeg).toFixed(1)},${y(s.elevationDeg).toFixed(1)}`).join(' '),
        fill: 'none', stroke, 'stroke-width': width, 'stroke-linecap': 'round', ...(dash ? { 'stroke-dasharray': dash } : {}),
      }));
    line(shown, '#3b4767', 1.5, '3 4');
    line(shown.filter((s) => s.visible), '#ffb347', 3);
  }
  // Clock labels along the first track, once a minute.
  const first = tracks.find((t) => t.visibleS > 0) ?? tracks[0];
  for (const s of first.samples) {
    if (s.tS % 60 !== 0 || s.elevationDeg <= 0 || !s.visible) continue;
    svg.append(svgEl('circle', { cx: x(s.bearingDeg), cy: y(s.elevationDeg), r: 3.5, fill: '#fff' }));
    svg.append(svgEl('text', { x: x(s.bearingDeg), y: y(s.elevationDeg) - 8, fill: '#e8ecf6', 'font-size': 11, 'text-anchor': 'middle' }, timeFmt.format(liftoffMs + s.tS * 1000)));
  }
  return svg;
}

function slipTable(launch) {
  const box = el('div', { class: 'slip' });
  const base = Date.parse(launch.net);
  for (let m = -SLIP_RANGE_MIN; m <= SLIP_RANGE_MIN; m += SLIP_STEP_MIN) {
    const net = new Date(base + m * 60000).toISOString();
    const r = evaluateLaunch({ launch: { ...launch, net }, observer, profiles, config });
    const cell = el('span', { class: `${r.verdict}${m === 0 ? ' now' : ''}`, title: `${r.verdict}${r.prime ? ', prime' : ''}` }, timeFmt.format(base + m * 60000));
    box.append(cell);
  }
  return box;
}

function fact(label, value) {
  return el('div', {}, el('dt', {}, label), el('dd', {}, value));
}

function launchCard(launch) {
  const liftoff = Date.parse(launch.net);
  const result = evaluateLaunch({ launch, observer, profiles, config, withSamples: true });
  const card = el('article', { class: `launch ${result.verdict}` });
  card.append(el('h2', {}, launch.name));
  card.append(el('p', { class: 'when' }, `${dayFmt.format(liftoff)}, liftoff ${secFmt.format(liftoff)} · ${launch.padName ?? ''} · status: ${launch.statusName ?? launch.status ?? 'unknown'}`));

  const badges = el('div', { class: 'badges' });
  badges.append(el('span', { class: `badge ${result.verdict}` }, result.verdict === 'no' ? 'No jellyfish' : result.verdict === 'likely' ? 'Likely' : 'Possible'));
  if (result.prime) badges.append(el('span', { class: 'badge prime' }, 'Prime: dark sky'));
  badges.append(el('span', { class: 'badge plain' }, `confidence: ${result.confidence}`));
  card.append(badges);

  if (result.verdict === 'no') {
    card.append(el('p', { class: 'note' }, 'No flight path we tried has a sunlit rocket in a dark sky above 5°. The rocket itself may still show as a moving point of light at night.'));
  } else {
    const peakTracks = result.tracks.filter((t) => t.visibleS >= config.minVisibleS);
    const lead = peakTracks[0];
    const facts = el('dl', { class: 'facts' });
    facts.append(fact('Look between', `${timeFmt.format(liftoff + result.firstVisibleS * 1000)} and ${timeFmt.format(liftoff + result.lastVisibleS * 1000)}`));
    const lo = Math.round(result.peakElevationDeg.min);
    const hi = Math.round(result.peakElevationDeg.max);
    facts.append(fact('Highest point', lo === hi ? `${hi}° up` : `${lo}° to ${hi}° up`));
    facts.append(fact('Direction', result.trajectory === 'fan'
      ? `${compass(result.peakBearingDeg.min)} to ${compass(result.peakBearingDeg.max)} (path not known)`
      : `starts ${compass(lead.firstBearingDeg)}, peaks ${compass(lead.peakBearingDeg)}, ends ${compass(lead.lastBearingDeg)}`));
    facts.append(fact('Sun below horizon', `${Math.abs(result.sunElevationDeg).toFixed(0)}°`));
    card.append(facts);

    card.append(el('h3', {}, 'Where to look'));
    const chartBox = el('div');
    const stored = Number(localStorage.getItem(HORIZON_KEY) ?? 0);
    const draw = (deg) => chartBox.replaceChildren(skyChart(result, liftoff, deg));
    draw(stored);
    card.append(chartBox);
    const input = el('input', { type: 'range', min: 0, max: 40, step: 1, value: stored, 'aria-label': 'Height of trees or buildings in that direction, in degrees' });
    const read = el('span', {}, `${stored}°`);
    input.addEventListener('input', () => {
      read.textContent = `${input.value}°`;
      try { localStorage.setItem(HORIZON_KEY, input.value); } catch { /* storage off */ }
      draw(Number(input.value));
    });
    card.append(el('div', { class: 'slider' }, 'My trees block the sky up to', input, read));
    card.append(el('p', { class: 'note' }, result.trajectory === 'fan'
      ? 'Launch Library 2 does not give the direction of this launch, so each line is one possible path. Orange is the sunlit part in a dark sky.'
      : `The chart is the view when you face southeast: south is on the right and east is on the left. Each line is one past Falcon 9 flight flown on this launch's path. Orange is the sunlit part in a dark sky; the dotted part is before the plume is counted or after it leaves sunlight. The data ends about ${Math.round(lead.samples.at(-1).tS / 60)} minutes after liftoff; the rocket may stay visible longer.`));
  }

  card.append(el('h3', {}, 'If the launch time slips'));
  card.append(slipTable(launch));
  card.append(el('p', { class: 'note' }, 'Each box is a liftoff time. Orange is likely, blue is possible, dark is no. The outlined box is the current time.'));
  return card;
}

function render(data) {
  const status = $('#status');
  const age = Math.round((Date.now() - data.fetched) / 60000);
  const text = data.source === 'stale'
    ? `Could not reach Launch Library 2 (${data.error}). Showing data from ${age} minutes ago.`
    : `Launch data from ${timeFmt.format(data.fetched)} (${age === 0 ? 'just now' : `${age} min ago`}).`;
  const button = el('button', { type: 'button' }, 'Check for changes');
  button.disabled = Date.now() - data.fetched < 5 * 60 * 1000;
  button.title = button.disabled ? 'Launch Library 2 limits requests; try again in a few minutes.' : '';
  button.addEventListener('click', () => start(true));
  status.replaceChildren(text, button);

  const now = Date.now();
  const coming = data.results.filter((l) => Date.parse(l.net) > now - 30 * 60 * 1000);
  const precise = coming.filter((l) => PRECISE.includes(l.precision));
  const vague = coming.filter((l) => !PRECISE.includes(l.precision));
  const box = $('#launches');
  box.replaceChildren();
  if (precise.length === 0) box.append(el('p', { class: 'panel' }, 'No Cape Canaveral or Kennedy Space Center launch has a set time right now.'));
  for (const launch of precise) box.append(launchCard(launch));
  if (vague.length > 0) {
    const list = el('ul');
    for (const l of vague.slice(0, 12)) list.append(el('li', {}, `${l.name} (no earlier than ${fmt({ month: 'short', year: 'numeric' }).format(Date.parse(l.net))})`));
    box.append(el('section', { class: 'panel later' }, el('h2', {}, 'Later, time not set'), list));
  }
}

async function start(force = false) {
  try {
    render(await loadLaunches(force));
  } catch (error) {
    $('#status').textContent = `Could not load launches: ${error.message}. Try again in a few minutes.`;
  }
}

$('#observer-name').textContent = observer.name;
start();
