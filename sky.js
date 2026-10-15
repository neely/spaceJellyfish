// The camera sky view: show the live camera, read the phone's orientation,
// and draw the predicted rocket path for one launch over the picture.
// Add-on page; the main page (index.html, app.js) is not changed by it.
import { evaluateLaunch } from './engine/visibility.js';
import { LL2_UPCOMING_URL, reduceLaunch } from './lib/ll2.js';
import { sunDirectionEcef } from './engine/sun.js';
import { directionAngles } from './engine/geo.js';
import { cameraAxes, project, vectorAngles, compassReferenceAzimuth, angleDiff, focalLengthPx, portraitRollDeg } from './lib/skyproject.js';

const CACHE_KEY = 'spacejellyfish.ll2.upcoming.v1'; // written by app.js
const ERROR_KEY = 'spacejellyfish.sky.compassErrorDeg';
const FOV_KEY = 'spacejellyfish.sky.fovLongDeg';
const PRECISE = ['Second', 'Minute', 'Hour'];
const ROLL_OK = 5; // degrees of side-to-side roll at which the compass is still read
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = (deg) => COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
const COLORS = { sunlit: '#ffb347', dark: '#7fc8ff', grid: 'rgba(232,236,246,.35)', horizon: 'rgba(232,236,246,.85)', sun: '#ffe066' };

const $ = (id) => document.getElementById(id);
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage off */ }
  },
};

const getJson = async (path) => (await fetch(path)).json();
const [observer, profiles, config, sky] = await Promise.all([
  getJson('config/observer.json'),
  getJson('config/profiles.json'),
  getJson('config/visibility.json'),
  getJson('config/skyview.json'),
]);
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: observer.timeZone, hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: observer.timeZone, weekday: 'short', month: 'short', day: 'numeric' });

// ---------- Launch ----------
// Same sources as the main page: the list the main page saved in this
// browser, then Launch Library 2 itself, then the copy in the repo.
async function loadLaunches() {
  const cached = store.get(CACHE_KEY, null);
  if (cached?.results?.length && Date.now() - cached.fetched < 20 * 60 * 1000) return cached.results;
  try {
    const res = await fetch(LL2_UPCOMING_URL);
    if (!res.ok) throw new Error(String(res.status));
    const fresh = { fetched: Date.now(), results: (await res.json()).results.map(reduceLaunch) };
    store.set(CACHE_KEY, fresh);
    return fresh.results;
  } catch {
    if (cached?.results?.length) return cached.results;
    return (await getJson('data/upcoming-fallback.json')).results;
  }
}

function pickLaunch(launches) {
  const id = new URLSearchParams(location.search).get('id');
  if (id) {
    const hit = launches.find((l) => l.id === id);
    if (hit) return hit;
  }
  const now = Date.now();
  const coming = launches.filter((l) => PRECISE.includes(l.precision) && Date.parse(l.net) > now - 30 * 60 * 1000);
  return coming.find((l) => evaluateLaunch({ launch: l, observer, profiles, config }).verdict !== 'no') ?? coming[0] ?? null;
}

const launch = pickLaunch(await loadLaunches());
let result = null;
let liftoff = 0;
if (launch) {
  liftoff = Date.parse(launch.net);
  result = evaluateLaunch({ launch, observer, profiles, config, withSamples: true });
  const word = result.verdict === 'likely' ? 'Likely' : result.verdict === 'possible' ? 'Possible' : 'No jellyfish';
  $('title').textContent = `${launch.name.split('|').pop().trim()} · ${dayFmt.format(liftoff)} ${timeFmt.format(liftoff)} · ${word}`;
  $('start-text').textContent = `${launch.name}, ${dayFmt.format(liftoff)} at ${timeFmt.format(liftoff)}. See its path over your own trees: hold the phone up and look through it.`;
} else {
  $('title').textContent = 'No launch with a set time';
}
const tracks = (result?.tracks ?? []).filter((t) => t.samples);
const lead = tracks.find((t) => t.visibleS > 0) ?? tracks[0];

// ---------- Orientation ----------
const state = {
  ori: null, // { alpha, beta, gamma }
  compassDeg: null, // magnetic heading from the phone, if any
  compassAccDeg: null,
  absolute: false,
  liveCorrDeg: 0, // compass-based heading correction, smoothed
  haveLive: false,
  errorDeg: store.get(ERROR_KEY, 0), // learned compass error from Sun calibration
  fov: store.get(FOV_KEY, sky.defaultFovLongDeg),
  frozen: false,
  drag: null, // { az, el } when there are no sensors
};

function onOrientation(e) {
  if (state.frozen || e.alpha === null) return;
  // Android sends both events; once absolute ones arrive, use only those.
  if (e.type === 'deviceorientation' && state.absolute && typeof e.webkitCompassHeading !== 'number') return;
  state.ori = { alpha: e.alpha, beta: e.beta, gamma: e.gamma };
  const raw = cameraAxes({ alphaDeg: e.alpha, betaDeg: e.beta, gammaDeg: e.gamma, screenAngleDeg: screenAngle() });
  let target = null;
  // The gyro (alpha, beta, gamma) gives smooth, consistent motion. The
  // compass only fixes which way is north. On iOS the compass heading does
  // not follow side-to-side roll the way our camera model does, so a rolled
  // phone gave a wrong heading and the picture slid sideways (Ben,
  // 2026-10-15). We now read the compass only while the phone is held level
  // (portrait, roll under ROLL_OK) and otherwise keep the last good value.
  let good = true;
  if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) {
    // iOS: alpha has no fixed reference; the compass heading gives one.
    state.compassDeg = e.webkitCompassHeading;
    state.compassAccDeg = e.webkitCompassAccuracy;
    target = e.webkitCompassHeading + sky.magneticDeclinationDeg - compassReferenceAzimuth(raw);
    const view = vectorAngles(raw.forward);
    good = Math.abs(portraitRollDeg(e.alpha, e.beta, e.gamma)) < ROLL_OK && Math.abs(view.elevationDeg) < 60;
  } else if (e.absolute || e.type === 'deviceorientationabsolute') {
    // Android: alpha is already measured from magnetic north and stays
    // consistent with beta and gamma, so roll does not upset it.
    state.absolute = true;
    target = sky.magneticDeclinationDeg;
  }
  state.compassHeld = !good;
  if (target === null) return;
  if (!state.haveLive) {
    // First reading: take it so something shows, even if not level.
    state.liveCorrDeg = target;
    state.haveLive = true;
    state.locked = good;
  } else if (good && !state.locked) {
    state.liveCorrDeg = target;
    state.locked = true;
  } else if (good) {
    // The compass is noisy and the gyro is not: follow the compass slowly.
    state.liveCorrDeg += 0.02 * angleDiff(target, state.liveCorrDeg);
  }
}

function screenAngle() {
  return screen.orientation?.angle ?? window.orientation ?? 0;
}

function currentAxes() {
  if (state.drag) {
    // No sensors: a virtual camera that the user drags.
    return cameraAxes({ alphaDeg: -state.drag.az, betaDeg: 90 + state.drag.el, gammaDeg: 0 });
  }
  if (!state.ori) return null;
  return cameraAxes({
    alphaDeg: state.ori.alpha,
    betaDeg: state.ori.beta,
    gammaDeg: state.ori.gamma,
    screenAngleDeg: screenAngle(),
    headingCorrectionDeg: state.liveCorrDeg + state.errorDeg,
  });
}

function sunNow() {
  return directionAngles(observer, sunDirectionEcef(new Date()));
}

// ---------- Drawing ----------
const video = $('video');
const canvas = $('overlay');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize);
resize();

function focal() {
  const vw = video.videoWidth || innerWidth;
  const vh = video.videoHeight || innerHeight;
  return focalLengthPx({ videoW: vw, videoH: vh, screenW: innerWidth, screenH: innerHeight, fovLongDeg: state.fov });
}

function label(text, x, y, color = '#fff', align = 'left') {
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = align;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,.75)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function polyline(points, style, width, dash = []) {
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  let pen = false;
  for (const p of points) {
    if (!p) { pen = false; continue; }
    if (pen) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
    pen = true;
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

// Directions are right only in portrait: the compass is read only then
// (see onOrientation). In landscape the page hides the drawing and asks the
// user to turn the phone upright.
function isLandscape() {
  const a = Math.abs(screenAngle()) % 180;
  return a === 90 || innerWidth > innerHeight * 1.1;
}

function draw() {
  const W = innerWidth;
  const H = innerHeight;
  ctx.clearRect(0, 0, W, H);
  const sideways = isLandscape() && !state.drag;
  $('rotate').hidden = !sideways;
  if (sideways) return;
  const axes = currentAxes();
  if (!axes) return;
  const f = focal();
  const cx = W / 2;
  const cy = H / 2;
  const P = (az, el) => project(axes, az, el, f, cx, cy);
  const view = vectorAngles(axes.forward);
  const onScreen = (p) => p && p.x > -40 && p.x < W + 40 && p.y > -40 && p.y < H + 40;

  // Elevation lines every 10 degrees, and the horizon.
  for (let el = 0; el <= 80; el += 10) {
    const pts = [];
    for (let d = -100; d <= 100; d += 2) pts.push(P(view.azimuthDeg + d, el));
    polyline(pts, el === 0 ? COLORS.horizon : COLORS.grid, el === 0 ? 1.5 : 1, el === 0 ? [] : [4, 6]);
    const tag = pts.filter(onScreen).find((p) => p.x > 8);
    if (tag && el > 0) label(`${el}°`, tag.x + 4, tag.y - 4, 'rgba(232,236,246,.8)');
  }
  // Compass ticks along the horizon.
  for (let az = 0; az < 360; az += 10) {
    const a = P(az, 0);
    const b = P(az, az % 30 === 0 ? 2 : 1);
    if (!onScreen(a) || !b) continue;
    polyline([a, b], COLORS.horizon, 1.5);
    // Portrait shows only about 35 degrees across, so label every tick.
    label(az % 45 === 0 ? `${compass(az)} ${az}°` : `${az}°`, a.x, a.y + 16, '#fff', 'center');
  }

  // Rocket paths. Orange: sunlit plume in a dark sky. Blue dashed: the rest.
  for (const track of tracks) {
    const isLead = track === lead;
    const ss = track.samples.filter((s) => s.elevationDeg > -1);
    for (let i = 1; i < ss.length; i++) {
      const a = P(ss[i - 1].bearingDeg, ss[i - 1].elevationDeg);
      const b = P(ss[i].bearingDeg, ss[i].elevationDeg);
      if (!a || !b) continue;
      const lit = ss[i].visible;
      polyline([a, b], lit ? COLORS.sunlit : COLORS.dark, lit ? (isLead ? 5 : 2.5) : 2, lit ? [] : [6, 5]);
    }
  }
  if (lead) {
    for (const s of lead.samples) {
      if (s.tS % 60 !== 0 || s.tS === 0 || s.elevationDeg < 0) continue;
      const p = P(s.bearingDeg, s.elevationDeg);
      if (!onScreen(p)) continue;
      ctx.fillStyle = s.visible ? COLORS.sunlit : COLORS.dark;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      const text = `+${s.tS / 60}m ${timeFmt.format(liftoff + s.tS * 1000).replace(/\s?[AP]M$/, '')}`;
      if (p.x > W - 100) label(text, p.x - 8, p.y - 6, '#fff', 'right');
      else label(text, p.x + 8, p.y - 6);
    }
  }

  // The Sun, for calibration.
  const sun = sunNow();
  if (sun.elevationDeg > -3) {
    const p = P(sun.azimuthDeg, sun.elevationDeg);
    if (onScreen(p)) {
      ctx.strokeStyle = COLORS.sun;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      label('Sun (predicted)', p.x + 20, p.y + 4, COLORS.sun);
    }
  }

  // Centre circle for Sun alignment.
  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.stroke();

  // Readout and a hint when the path is off screen.
  const err = state.compassHeld && state.haveLive
    ? ' · compass held (hold the phone level to update)'
    : state.compassAccDeg != null && state.compassAccDeg >= 0 ? ` · compass ±${Math.round(state.compassAccDeg)}°` : '';
  $('reading').textContent = `Facing ${Math.round(view.azimuthDeg)}° ${compass(view.azimuthDeg)} · ${Math.round(view.elevationDeg)}° up${err}${state.drag ? ' · drag to look around (no motion sensors)' : ''}`;
  const hint = $('hint');
  const peak = lead?.samples.reduce((a, b) => (b.elevationDeg > a.elevationDeg ? b : a));
  const anyShown = lead?.samples.some((s) => s.elevationDeg > 0 && onScreen(P(s.bearingDeg, s.elevationDeg)));
  if (state.flash) {
    hint.textContent = state.flash;
    hint.hidden = false;
  } else if (peak && !anyShown) {
    const turn = angleDiff(peak.bearingDeg, view.azimuthDeg);
    const lift = peak.elevationDeg - view.elevationDeg;
    hint.textContent = Math.abs(turn) > 15
      ? `The path peaks at ${Math.round(peak.bearingDeg)}° ${compass(peak.bearingDeg)}. Turn ${turn > 0 ? 'right' : 'left'} ${Math.round(Math.abs(turn))}°.`
      : `Tilt ${lift > 0 ? 'up' : 'down'} about ${Math.round(Math.abs(lift))}°.`;
    hint.hidden = false;
  } else {
    hint.hidden = true;
  }
}

function loop() {
  if (!state.frozen) draw();
  requestAnimationFrame(loop);
}

// ---------- Controls ----------
function setError(deg) {
  state.errorDeg = ((deg + 540) % 360) - 180;
  store.set(ERROR_KEY, state.errorDeg);
  $('corr-read').textContent = `${state.errorDeg >= 0 ? '+' : ''}${state.errorDeg.toFixed(1)}°`;
}
setError(state.errorDeg);

$('nudge-left').addEventListener('click', () => {
  if (state.drag) state.drag.az += 1;
  else setError(state.errorDeg + 1);
});
$('nudge-right').addEventListener('click', () => {
  if (state.drag) state.drag.az -= 1;
  else setError(state.errorDeg - 1);
});

$('align-sun').addEventListener('click', () => {
  const sun = sunNow();
  if (sun.elevationDeg < -1) {
    flash('The Sun is below the horizon now. Calibrate in daylight; the correction is kept for later.');
    return;
  }
  const axes = currentAxes();
  if (!axes || state.drag) return;
  const view = vectorAngles(axes.forward);
  setError(state.errorDeg + angleDiff(sun.azimuthDeg, view.azimuthDeg));
  flash(`Saved. Compass correction is now ${state.errorDeg >= 0 ? '+' : ''}${state.errorDeg.toFixed(1)}°. Check that the yellow ring sits on the Sun.`);
});

const fov = $('fov');
fov.value = state.fov;
$('fov-read').textContent = `${state.fov}°`;
fov.addEventListener('input', () => {
  state.fov = Number(fov.value);
  $('fov-read').textContent = `${state.fov}°`;
  store.set(FOV_KEY, state.fov);
});
$('corr-reset').addEventListener('click', () => setError(0));
$('settings-toggle').addEventListener('click', () => { $('settings').hidden = !$('settings').hidden; });

// One set of instructions, shown on the start screen and behind Help.
const steps = () => document.getElementById('help-steps').content.cloneNode(true);
$('start-help').append(steps());
$('help-body').append(steps());
$('help-toggle').addEventListener('click', () => { $('help').hidden = false; });
$('help-close').addEventListener('click', () => { $('help').hidden = true; });

// A short message over the picture, for a few seconds.
let flashTimer = 0;
function flash(text, ms = 4000) {
  state.flash = text;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { state.flash = null; }, ms);
}

$('freeze').addEventListener('click', () => {
  state.frozen = !state.frozen;
  $('freeze').textContent = state.frozen ? 'Live' : 'Freeze';
  $('freeze').classList.toggle('on', state.frozen);
  if (state.frozen) video.pause();
  else video.play();
});

$('save').addEventListener('click', async () => {
  const dpr = window.devicePixelRatio || 1;
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const o = out.getContext('2d');
  if (video.videoWidth) {
    // Same crop as object-fit: cover.
    const s = Math.max(out.width / video.videoWidth, out.height / video.videoHeight);
    const w = video.videoWidth * s;
    const h = video.videoHeight * s;
    o.drawImage(video, (out.width - w) / 2, (out.height - h) / 2, w, h);
  }
  o.drawImage(canvas, 0, 0);
  o.font = `600 ${14 * dpr}px system-ui, sans-serif`;
  o.fillStyle = '#fff';
  o.fillText($('title').textContent, 12 * dpr, out.height - 14 * dpr);
  const blob = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.9));
  const file = new File([blob], 'sky-view.jpg', { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Sky view' }); return; } catch { /* cancelled */ }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sky-view.jpg';
  a.click();
});

// Drag to look around when there are no motion sensors (desktop, or denied).
let dragFrom = null;
canvas.addEventListener('pointerdown', (e) => { if (state.drag) dragFrom = { x: e.clientX, y: e.clientY, ...state.drag }; });
canvas.addEventListener('pointermove', (e) => {
  if (!dragFrom) return;
  const degPerPx = (2 * Math.atan(innerHeight / 2 / focal()) * 180) / Math.PI / innerHeight;
  state.drag.az = dragFrom.az - (e.clientX - dragFrom.x) * degPerPx;
  state.drag.el = Math.max(-10, Math.min(80, dragFrom.el + (e.clientY - dragFrom.y) * degPerPx));
});
addEventListener('pointerup', () => { dragFrom = null; });

$('start-button').addEventListener('click', async () => {
  // Ask for both permissions inside the tap; iOS requires a user gesture.
  const motion = typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission
    ? DeviceOrientationEvent.requestPermission().catch(() => 'denied')
    : Promise.resolve('granted');
  const camera = navigator.mediaDevices?.getUserMedia
    ? navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } } }).catch((e) => e)
    : Promise.resolve(new Error('No camera API'));
  const [motionAnswer, stream] = await Promise.all([motion, camera]);

  $('start').hidden = true;
  $('controls').hidden = false;
  if (stream instanceof MediaStream) {
    video.srcObject = stream;
    video.play().catch(() => {});
  } else {
    flash(`No camera (${stream?.message ?? 'not allowed'}). Showing the sky grid only. To fix it, allow camera access for this site in your browser settings and reload.`, 8000);
  }
  // Ask the browser to keep the page upright. Most phones refuse this
  // outside full-screen apps (iOS always does), so the message above is the
  // real guard; the phone's own rotation lock is the reliable way.
  try { screen.orientation?.lock?.('portrait').catch(() => {}); } catch { /* not supported */ }
  if (motionAnswer === 'granted') {
    addEventListener('deviceorientationabsolute', onOrientation);
    addEventListener('deviceorientation', onOrientation);
  }
  // If no orientation arrives, fall back to dragging, facing the path's peak.
  setTimeout(() => {
    if (!state.ori) {
      const peak = lead?.samples.reduce((a, b) => (b.elevationDeg > a.elevationDeg ? b : a));
      state.drag = { az: peak?.bearingDeg ?? 150, el: Math.min(20, peak?.elevationDeg ?? 15) };
    } else if (!state.haveLive) {
      flash('This phone gives no compass heading. In daylight, put the Sun in the centre circle and tap "Sun is in the circle" to set the direction.', 8000);
    }
  }, 1500);
  loop();
});
