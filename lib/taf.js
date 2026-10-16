// Airport forecasts (TAF) from the NWS API, in IWXXM XML. Pure parsing
// plus one fetch helper. Access facts: reference/data-sources.md.
//
// A TAF has a base forecast and change groups. Change indicators seen in a
// WMO IWXXM example: FROM (conditions change at a time), BECOMING (change
// during a period), TEMPORARY_FLUCTUATIONS (at times). Any other indicator
// (for example a probability group) is kept as given and shown as such.

const tag = (xml, name) => {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(xml);
  return m ? m[1] : null;
};
const all = (xml, name) => [...xml.matchAll(new RegExp(`<${name}[^>]*?(?:/>|>([\\s\\S]*?)</${name}>)`, 'g'))].map((m) => m[0]);
const period = (xml) => ({
  beginMs: Date.parse(tag(xml, 'ns1:beginPosition')),
  endMs: Date.parse(tag(xml, 'ns1:endPosition')),
});

function group(xml) {
  const head = /<MeteorologicalAerodromeForecast([^>]*)>/.exec(xml)[1];
  const indicator = /changeIndicator="([^"]+)"/.exec(head)?.[1] ?? 'BASE';
  const cavok = /cloudAndVisibilityOK="true"/.test(head);
  const layers = all(xml, 'CloudLayer').map((l) => {
    const amount = /CloudAmountReportedAtAerodrome\/([A-Z]+)/.exec(l)?.[1] ?? null;
    const b = /<base uom="\[ft_i\]">([\d.]+)<\/base>/.exec(l);
    return { amount, baseFt: b ? Number(b[1]) : null };
  });
  const weather = [...xml.matchAll(/<weather xlink:href="[^"]*\/([A-Z+-]+)"/g)].map((m) => m[1]);
  return { indicator, ...period(tag(xml, 'phenomenonTime')), cavok, layers, weather };
}

/** Parse one IWXXM TAF bulletin. */
export function parseTaf(xml) {
  const forecasts = [
    group(tag(xml, 'baseForecast')),
    ...all(xml, 'changeForecast').map((c) => group(c)),
  ];
  return {
    station: tag(xml, 'aixm:designator'),
    issueMs: Date.parse(tag(tag(xml, 'issueTime'), 'ns1:timePosition')),
    valid: period(tag(xml, 'validPeriod')),
    forecasts,
  };
}

/**
 * Conditions at a time. `prevailing` is the base forecast or the latest FROM
 * or BECOMING group that has begun (a BECOMING group is counted from its
 * start, which is the earliest the change can happen). `atTimes` lists the
 * other groups whose period covers the time. Returns null outside the
 * TAF's valid period.
 */
export function conditionsAt(taf, timeMs) {
  if (timeMs < taf.valid.beginMs || timeMs >= taf.valid.endMs) return null;
  let prevailing = taf.forecasts[0];
  const atTimes = [];
  for (const f of taf.forecasts.slice(1)) {
    if (f.indicator === 'FROM' || f.indicator === 'BECOMING') {
      if (f.beginMs <= timeMs) prevailing = f;
    } else if (f.beginMs <= timeMs && timeMs < f.endMs) {
      atTimes.push(f);
    }
  }
  return { prevailing, atTimes };
}

const AMOUNT = { SKC: 'clear sky', NSC: 'no significant cloud', FEW: 'few clouds', SCT: 'scattered clouds', BKN: 'broken clouds', OVC: 'overcast' };

/** Plain words for the cloud of one group, for example "few clouds at 5,000 ft". */
export function describeClouds(f) {
  if (f.cavok) return 'CAVOK (cloud and visibility OK)';
  if (!f.layers.length) return 'no cloud given';
  return f.layers
    .map((l) => (l.baseFt == null ? AMOUNT[l.amount] ?? l.amount : `${AMOUNT[l.amount] ?? l.amount} at ${l.baseFt.toLocaleString('en-US')} ft`))
    .join(', ');
}

/** Plain words for a change indicator other than FROM and BECOMING. */
export function describeIndicator(indicator) {
  if (indicator === 'TEMPORARY_FLUCTUATIONS') return 'At times';
  return indicator.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * The newest TAF for a station from the NWS API, parsed, or null. The list
 * is newest first, one entry per issue slot; an amendment replaces the file
 * behind a slot, so the issue time comes from the file itself.
 */
export async function latestTaf(stationId) {
  const res = await fetch(`https://api.weather.gov/stations/${stationId}/tafs`, { headers: { Accept: 'application/geo+json' } });
  if (!res.ok) return null;
  const list = (await res.json())['@graph'] ?? [];
  const newest = [...list].sort((a, b) => Date.parse(b.issueTime) - Date.parse(a.issueTime))[0];
  if (!newest) return null;
  const xml = await (await fetch(newest.id)).text();
  return parseTaf(xml);
}
